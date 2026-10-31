import assert from "node:assert/strict";
import { isValidAnonId } from "../lib/supabase.ts";
import { readJsonObject } from "../lib/request.ts";

async function main() {
  let passed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    await fn();
    passed++;
    console.log("✓", name);
  };

  await test("accepts a valid anonymous browser UUID", () => {
    assert.equal(isValidAnonId("f47ac10b-58cc-4372-a567-0e02b2c3d479"), true);
  });

  await test("rejects malformed or non-v4 anonymous IDs", () => {
    assert.equal(isValidAnonId("not-a-uuid"), false);
    assert.equal(isValidAnonId("f47ac10b-58cc-1372-a567-0e02b2c3d479"), false);
  });

  await test("reads a JSON object request", async () => {
    const req = new Request("https://papertrail.test/api/mark", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionId: "p1-quad-01" }),
    });
    assert.deepEqual(await readJsonObject(req, 1000), { body: { questionId: "p1-quad-01" } });
  });

  await test("rejects malformed JSON and non-object JSON", async () => {
    const invalid = new Request("https://papertrail.test/api/mark", { method: "POST", body: "{" });
    const array = new Request("https://papertrail.test/api/mark", { method: "POST", body: "[]" });
    assert.deepEqual(await readJsonObject(invalid, 1000), { error: "invalid" });
    assert.deepEqual(await readJsonObject(array, 1000), { error: "invalid" });
  });

  await test("rejects requests over the configured size limit", async () => {
    const req = new Request("https://papertrail.test/api/mark", {
      method: "POST",
      body: "x".repeat(1001),
    });
    assert.deepEqual(await readJsonObject(req, 1000), { error: "too_large" });
  });

  console.log(`\n${passed} checks passed`);
}

await main();
