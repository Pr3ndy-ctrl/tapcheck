import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readOrFetch(url: string, cacheName = "epa"): Promise<string> {
  const cacheDirectory = path.join(process.cwd(), ".cache", cacheName);
  const location = path.join(cacheDirectory, `${createHash("sha256").update(url).digest("hex")}.json`);
  try { return JSON.parse(await readFile(location, "utf8")).body; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  const body = await response.text();
  await mkdir(cacheDirectory, { recursive: true });
  // EPA occasionally returns 500s; persist those bodies too so a failed query is not retried.
  await writeFile(location, JSON.stringify({ url, fetchedAt: new Date().toISOString(), status: response.status, body }));
  return body;
}
