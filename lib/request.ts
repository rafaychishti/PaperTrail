export type JsonObjectResult =
  | { body: Record<string, unknown>; error?: never }
  | { body?: never; error: "invalid" | "too_large" };

export async function readJsonObject(req: Request, maxBytes: number): Promise<JsonObjectResult> {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { error: "too_large" };
  }

  const reader = req.body?.getReader();
  if (!reader) return { error: "invalid" };

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { error: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { error: "invalid" };
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { error: "invalid" };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "invalid" };
  }

  return { body: value as Record<string, unknown> };
}
