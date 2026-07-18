import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AiWaterReport } from "./types";

const directory = path.join(process.cwd(), ".cache", "reports");
export function reportCacheKey(pwsid: string, violations: unknown): string {
  return `${pwsid}-${createHash("sha256").update(JSON.stringify(violations)).digest("hex")}`;
}
export async function readCachedReport(key: string): Promise<AiWaterReport | null> {
  try { return JSON.parse(await readFile(path.join(directory, `${key}.json`), "utf8")) as AiWaterReport; } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function writeCachedReport(key: string, report: AiWaterReport): Promise<void> {
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${key}.json`), JSON.stringify(report));
}
