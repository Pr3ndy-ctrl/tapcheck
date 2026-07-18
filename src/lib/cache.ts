import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.CACHE_DIR ?? (process.env.VERCEL ? "/tmp/tapcheck-cache" : path.join(process.cwd(), ".cache"));
const seedRoot = path.join(process.cwd(), "seeds", "cache");

export function cacheFile(namespace: string, filename: string) { return path.join(root, namespace, filename); }
export function seedFile(namespace: string, filename: string) { return path.join(seedRoot, namespace, filename); }

export async function readCache<T>(namespace: string, filename: string): Promise<T | null> {
  for (const location of [cacheFile(namespace, filename), seedFile(namespace, filename)]) {
    try { return JSON.parse(await readFile(location, "utf8")) as T; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.warn(`TapCheck cache read failed for ${location}; continuing without it.`, error); }
  }
  return null;
}

export async function writeCache(namespace: string, filename: string, value: unknown): Promise<void> {
  const location = cacheFile(namespace, filename);
  try { await mkdir(path.dirname(location), { recursive: true }); await writeFile(location, JSON.stringify(value)); }
  catch (error) { console.warn(`TapCheck cache write failed for ${location}; continuing without cache.`, error); }
}
