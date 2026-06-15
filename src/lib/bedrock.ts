// Thin client wrapper around /api/bedrock.

export async function bedrock(payload: Record<string, any>) {
  const res = await fetch("/api/bedrock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
