import type { Violation, WaterSystem } from "@/lib/epa/types";

export type Safety = "safe" | "caution" | "risk";
export type AiWaterReport = {
  grade: "A" | "B" | "C" | "D" | "F";
  gradeRationale: string;
  summary: string;
  contaminants: Array<{ name: string; whatItIs: string; healthEffects: string; exceededLimit: boolean; citationViolationId: string }>;
  filterRecommendation: { type: "none" | "activated-carbon" | "reverse-osmosis"; reason: string };
  nonHuman: Record<"fish" | "plants" | "pets", { safety: Safety; explanation: string }>;
};

export type ReportInput = { system: WaterSystem; violations: Violation[] };
