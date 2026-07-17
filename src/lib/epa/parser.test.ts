import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mapRows, parseEpaRows } from "./parser";

test("parses a saved live EPA VIOLATION response", async () => {
  const fixture = await readFile(new URL("./__fixtures__/violation-real-response.json", import.meta.url), "utf8");
  const [violation] = mapRows("VIOLATION", parseEpaRows(fixture));
  assert.deepEqual(violation, { pwsid: "010106001", contaminantCode: "2950", healthBased: true, compliancePeriod: { begins: "2018-10-01 00:00:00", ends: "2018-12-31 00:00:00" }, resolved: true, status: "R" });
});
