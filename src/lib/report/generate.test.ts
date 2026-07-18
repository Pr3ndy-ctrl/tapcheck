import assert from "node:assert/strict";
import test from "node:test";
import { generateWaterReport } from "./generate";

test("returns a clean-bill report without calling OpenAI when there are no violations", async () => {
  const report = await generateWaterReport({ system: { pwsid: "TEST", name: "Test Water", populationServed: null, sourceType: null, activityCode: "A", systemType: "CWS" }, violations: [] });
  assert.equal(report.grade, "A");
  assert.deepEqual(report.contaminants, []);
  assert.equal(report.filterRecommendation.type, "none");
});
