import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const cacheDirectory = path.join(process.cwd(), ".cache", "epa");
export async function readOrFetch(url: string): Promise<string> {
  const location = path.join(cacheDirectory, `${createHash("sha256").update(url).digest("hex")}.json`);
  try { return JSON.parse(await readFile(location, "utf8")).body; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  if (!response.ok) throw new Error(`EPA request failed (${response.status}) for ${url}`);
  const body = await response.text();
  await mkdir(cacheDirectory, { recursive: true });
  await writeFile(location, JSON.stringify({ url, fetchedAt: new Date().toISOString(), body }));
  return body;
}
