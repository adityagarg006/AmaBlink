import { NextRequest, NextResponse } from "next/server";
import { DISASTER_SCENARIOS, freshnessDemo, severityDemo, solveDemo } from "@/lib/demoResponses";
import { CATALOG, product } from "@/lib/data";

export const runtime = "nodejs";

// ── Provider switch (merged from the standalone backend) ───────────────────
// PROVIDER = "bedrock" | "anthropic" | "demo".
//   bedrock   → real Amazon Bedrock (what you submit for the Amazon hackathon)
//   anthropic → Anthropic API directly (fastest to test; honest Bedrock stand-in)
//   demo      → no model call; scripted responses (booth never needs Wi-Fi)
// Defaults to anthropic when a key is present, else demo.
const PROVIDER = (
  process.env.PROVIDER || (process.env.ANTHROPIC_API_KEY ? "anthropic" : "demo")
).toLowerCase();

const ANTHROPIC_MODEL = process.env.BEDROCK_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

type Block =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

type ModelResult =
  | { ok: true; text: string }
  | { ok: false; reason: string; detail?: string };

async function viaAnthropic(system: string, content: Block[], maxTokens: number): Promise<ModelResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, reason: "no-key" };
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) return { ok: false, reason: `api-${res.status}`, detail: (await res.text()).slice(0, 300) };
    const data = await res.json();
    const text = (data.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
    return { ok: true, text };
  } catch (e: any) {
    return { ok: false, reason: "fetch-error", detail: String(e).slice(0, 200) };
  }
}

async function viaBedrock(system: string, content: Block[], maxTokens: number): Promise<ModelResult> {
  try {
    // Lazy, bundler-ignored import: the AWS SDK is an OPTIONAL dependency, only
    // needed when PROVIDER=bedrock. `npm i @aws-sdk/client-bedrock-runtime` to enable.
    // @ts-ignore - optional peer dependency, resolved at runtime only
    const mod: any = await import(/* webpackIgnore: true */ "@aws-sdk/client-bedrock-runtime");
    const { BedrockRuntimeClient, InvokeModelCommand } = mod;
    const client = new BedrockRuntimeClient({ region: AWS_REGION });
    const cmd = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content }],
      }),
    });
    const res = await client.send(cmd);
    const json = JSON.parse(new TextDecoder().decode(res.body));
    const text = (json.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
    return { ok: true, text };
  } catch (e: any) {
    return { ok: false, reason: "bedrock-error", detail: String(e?.message || e).slice(0, 200) };
  }
}

async function callModel(system: string, content: Block[], maxTokens = 1024): Promise<ModelResult> {
  if (PROVIDER === "demo") return { ok: false, reason: "demo" };
  if (PROVIDER === "bedrock") return viaBedrock(system, content, maxTokens);
  return viaAnthropic(system, content, maxTokens);
}

function parseJson(text: string) {
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const startArr = clean.indexOf("[");
  const i = start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  return JSON.parse(i > 0 ? clean.slice(i) : clean);
}

// Catalog as a compact prompt block — ids the model MUST select from, with the
// dependency edges (needs:) and safety locks (NEVER_SWAP) it must respect.
const CATALOG_FOR_PROMPT = CATALOG.map(
  (p) =>
    `${p.id} | ${p.name} | ${p.category} | ₹${p.price}` +
    (p.perishable ? " | perishable" : "") +
    (p.neverSwap ? " | NEVER_SWAP" : "") +
    (p.needs ? ` | needs:${p.needs}` : "")
).join("\n");

// Resolve the raw model/demo output into normalised lines + enforce the
// Dependency Guardrail server-side so it's reliable even if the model forgets.
function resolveSolve(raw: any, source: "live" | "demo") {
  const lines: any[] = [];
  const seen = new Set<string>();
  const pushLine = (id: string, kind: "primary" | "dependency", reason: string, forItem?: string) => {
    const p = product(id);
    if (!p || seen.has(id)) return;
    seen.add(id);
    lines.push({
      sku_id: id,
      name: p.name,
      emoji: p.emoji,
      price: p.price,
      reason: reason || "",
      kind,
      forItem,
      neverSwap: !!p.neverSwap,
    });
  };

  (raw.items || []).forEach((it: any) => pushLine(it.sku_id, "primary", it.reason));
  (raw.dependencies || []).forEach((d: any) => pushLine(d.sku_id, "dependency", d.reason, d.for));
  // Guardrail: every selected item that needs a consumable must have it present.
  for (const it of raw.items || []) {
    const p = product(it.sku_id);
    if (p?.needs && !seen.has(p.needs)) {
      pushLine(p.needs, "dependency", `required to operate ${p.name}`, p.name);
    }
  }

  return {
    source,
    diagnosis: raw.diagnosis || "Package assembled.",
    triage: Array.isArray(raw.triage) ? raw.triage.slice(0, 3) : [],
    lines,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ── ZERO-DECISION ENGINE → complete, dependency-checked, safety-locked package ──
  if (action === "solve") {
    const { query, imageBase64, mediaType, scenarioHint } = body;
    const sys =
      'You are the "Zero-Decision Engine" for Amazon Blink, an urgent-shopping mode. The user is in an ' +
      "urgent situation. Select the EXACT items from the CATALOG that COMPLETELY solve their problem so " +
      "they never have to search or decide.\nRULES\n" +
      "1. Only use sku_id values that exist in the CATALOG. Never invent a SKU.\n" +
      "2. Pick the minimal COMPLETE set: the primary items PLUS anything required to actually use them.\n" +
      "3. DEPENDENCY CHECK: if an item needs a consumable to work, add that consumable to \"dependencies\" " +
      "and say what it is for. The catalog marks these as needs:<sku>.\n" +
      "4. SAFETY: never auto-substitute medicine or infant formula (catalog marks these NEVER_SWAP). List " +
      "them under \"safety\".\n" +
      "5. You are NOT a doctor. Do NOT diagnose or give dosages. For health cases include only common OTC " +
      "essentials and a triage step to follow the label / consult a pharmacist.\n" +
      "6. triage: 1-3 very short action steps. No dosages.\n" +
      'Return ONLY raw JSON, no markdown/prose, EXACTLY: {"diagnosis":"one sentence","triage":["step"],' +
      '"items":[{"sku_id":"xxx","reason":"short"}],"dependencies":[{"sku_id":"xxx","for":"item name","reason":"short"}],' +
      '"safety":[{"sku_id":"xxx","reason":"short"}]}\nCATALOG\n' +
      CATALOG_FOR_PROMPT;

    const content: Block[] = [];
    if (imageBase64) {
      content.push({ type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } });
      content.push({ type: "text", text: `The user pointed their camera at an urgent problem. Identify what is shown, then solve it. Note: ${query || "none"}` });
    } else {
      content.push({ type: "text", text: `User's situation: "${query || ""}"` });
    }

    const r = await callModel(sys, content, 900);
    if (r.ok) {
      try {
        return NextResponse.json(resolveSolve(parseJson(r.text), "live"));
      } catch {
        /* fall through to demo */
      }
    }
    return NextResponse.json(resolveSolve(solveDemo(query || "", scenarioHint), "demo"));
  }

  // ── DISASTER CAMERA → triage plan + bundled cart ──
  if (action === "disaster") {
    const { imageBase64, mediaType, description, scenarioHint } = body;
    const sys =
      "You are Amazon Bedrock's disaster-triage engine for an urgent-commerce app in India. " +
      "Look at the situation and return a crisis-command plan. Reply with ONLY valid JSON, no prose, " +
      'matching: {"title":string,"radius":string,"question":string (ONE clarifying question),' +
      '"steps":string[] (3-5 short imperative safety/repair steps),' +
      '"items":[{"name":string,"price":number (INR),"emoji":string,"why":string}] (3-5 items to bundle)}. ' +
      "Prices realistic in INR. Be specific (part numbers, valve directions) when possible.";
    const content: Block[] = [];
    if (imageBase64) {
      content.push({ type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } });
    }
    content.push({
      type: "text",
      text: "Situation" + (description ? `: ${description}` : " is shown in the image.") + " Produce the triage JSON now.",
    });

    const r = await callModel(sys, content, 1100);
    if (r.ok) {
      try {
        return NextResponse.json({ source: "live", plan: parseJson(r.text) });
      } catch {
        /* fall through to demo */
      }
    }
    const plan = DISASTER_SCENARIOS[scenarioHint] || DISASTER_SCENARIOS["burst-pipe"];
    return NextResponse.json({ source: "demo", plan, note: (r as any).reason });
  }

  // ── FRESHNESS PASSPORT → per-item pass/flag + substitute ──
  if (action === "freshness") {
    const { imageBase64, mediaType, sampleId, itemName } = body;
    const sys =
      "You are Amazon Bedrock's pre-dispatch freshness gate. Assess perishable quality from the image " +
      "(shell texture, bruising, discolouration, packaging seal). Reply with ONLY a JSON array, no prose: " +
      '[{"item":string,"emoji":string,"verdict":"pass"|"flag","score":number (0-100),"note":string,' +
      '"substitute":{"name":string,"emoji":string,"score":number}|null}]. ' +
      "Flag anything below a 70 freshness score and propose a verified substitute.";
    const content: Block[] = [];
    if (imageBase64) {
      content.push({ type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } });
    }
    content.push({
      type: "text",
      text: `Assess this perishable${itemName ? ` (${itemName})` : ""} for the freshness gate. Return the JSON array.`,
    });

    const r = await callModel(sys, content, 900);
    if (r.ok) {
      try {
        const arr = parseJson(r.text);
        return NextResponse.json({ source: "live", results: Array.isArray(arr) ? arr : [arr] });
      } catch {
        /* fall through */
      }
    }
    return NextResponse.json({ source: "demo", results: freshnessDemo(sampleId) });
  }

  // ── ZERO-BOT ESCALATION → severity classification ──
  if (action === "severity") {
    const { description } = body;
    const sys =
      "You are Amazon Bedrock's support-triage classifier for urgent commerce. Classify a post-delivery " +
      "issue report. HIGH severity = spoiled/expired food, wrong or unsafe medicine, anything affecting an " +
      "infant, or a safety hazard → instant auto-refund + human escalation, NO bot loop. LOW = packaging, " +
      "late, minor service. Reply with ONLY JSON: " +
      '{"severity":"high"|"low","category":string,"action":string,"refund":number|null,"reason":string}.';
    const r = await callModel(sys, [{ type: "text", text: `Issue report: "${description}"` }], 500);
    if (r.ok) {
      try {
        return NextResponse.json({ source: "live", result: parseJson(r.text) });
      } catch {
        /* fall through */
      }
    }
    return NextResponse.json({ source: "demo", result: severityDemo(description || "") });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
