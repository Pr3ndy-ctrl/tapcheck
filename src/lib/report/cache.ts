import { createHash } from "node:crypto";
import { readCache, writeCache } from "@/lib/cache";
import type { AiWaterReport } from "./types";

export function reportCacheKey(pwsid: string, violations: unknown): string {
  return `${pwsid}-${createHash("sha256").update(JSON.stringify(violations)).digest("hex")}`;
}
export async function readCachedReport(key: string): Promise<AiWaterReport | null> { return readCache<AiWaterReport>("reports", `${key}.json`); }
export async function writeCachedReport(key: string, report: AiWaterReport): Promise<void> {
  await writeCache("reports", `${key}.json`, report);
}
