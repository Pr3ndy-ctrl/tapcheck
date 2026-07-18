import { readCachedReport, reportCacheKey, writeCachedReport } from "./cache";
import type { AiWaterReport, ReportInput } from "./types";

function reportSchema(violationIds: string[]) { return {
  type: "object", additionalProperties: false,
  properties: {
    grade: { type: "string", enum: ["A", "B", "C", "D", "F"] }, gradeRationale: { type: "string" }, summary: { type: "string" },
    contaminants: { type: "array", items: { type: "object", additionalProperties: false, properties: { name: { type: "string" }, whatItIs: { type: "string" }, healthEffects: { type: "string" }, exceededLimit: { type: "boolean" }, citationViolationId: { type: "string", enum: violationIds } }, required: ["name", "whatItIs", "healthEffects", "exceededLimit", "citationViolationId"] } },
    filterRecommendation: { type: "object", additionalProperties: false, properties: { type: { type: "string", enum: ["none", "activated-carbon", "reverse-osmosis"] }, reason: { type: "string" } }, required: ["type", "reason"] },
    nonHuman: { type: "object", additionalProperties: false, properties: Object.fromEntries(["fish", "plants", "pets"].map((key) => [key, { type: "object", additionalProperties: false, properties: { safety: { type: "string", enum: ["safe", "caution", "risk"] }, explanation: { type: "string" } }, required: ["safety", "explanation"] }])), required: ["fish", "plants", "pets"] },
  }, required: ["grade", "gradeRationale", "summary", "contaminants", "filterRecommendation", "nonHuman"],
}; }

const instructions = `You write careful, plain-English drinking-water reports from supplied EPA data only. HARD RULE: Every contaminant claim must cite a real violation_id from the input in citationViolationId. Never invent a contaminant, limit exceedance, health effect, source treatment, or system fact. If the data cannot support a judgment (including hardness or the disinfectant type needed for fish), explicitly say that it is unavailable rather than guessing. For fish, distinguish chlorine from chloramine only when input data identifies it; otherwise state that the disinfectant type is unavailable. A violation may be resolved, so describe its supplied status precisely. Keep summary to 2–3 sentences.`;

export async function generateWaterReport(input: ReportInput): Promise<AiWaterReport> {
  if (input.violations.length === 0) return cleanBillReport(input);
  const key = reportCacheKey(input.system.pwsid, input.violations);
  const cached = await readCachedReport(key);
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required to generate a water report.");
  const violationIds = input.violations.flatMap(({ id }) => id ? [id] : []);
  if (violationIds.length === 0) throw new Error("EPA violations are missing IDs, so contaminant claims cannot be safely cited.");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-5.6", instructions, input: JSON.stringify(input), text: { format: { type: "json_schema", name: "tapcheck_water_report", strict: true, schema: reportSchema(violationIds) } } }),
  });
  if (!response.ok) throw new Error(`OpenAI report request failed (${response.status}).`);
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const outputText = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!outputText) throw new Error("OpenAI returned no structured report output.");
  const report = JSON.parse(outputText) as AiWaterReport;
  await writeCachedReport(key, report);
  return report;
}

function cleanBillReport({ system }: ReportInput): AiWaterReport {
  const unknown = "EPA violation data supplied for this report does not identify this detail.";
  return { grade: "A", gradeRationale: "No EPA violations were returned for this water system.", summary: `No EPA violations were returned for ${system.name ?? system.pwsid}. This is a clean bill based on the supplied violation data, not a guarantee that every possible water-quality measure was tested.`, contaminants: [], filterRecommendation: { type: "none", reason: "No violations were returned in the supplied data." }, nonHuman: { fish: { safety: "caution", explanation: `Disinfectant type is unavailable; ${unknown}` }, plants: { safety: "caution", explanation: unknown }, pets: { safety: "caution", explanation: unknown } } };
}
