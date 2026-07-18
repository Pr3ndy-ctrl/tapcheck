import { createHash } from "node:crypto";
import { readCache, writeCache } from "@/lib/cache";

export async function readOrFetch(url: string, cacheName = "epa"): Promise<string> {
  const filename = `${createHash("sha256").update(url).digest("hex")}.json`;
  const cached = await readCache<{ body: string }>(cacheName, filename);
  if (cached) return cached.body;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  const body = await response.text();
  // EPA occasionally returns 500s; persist those bodies too so a failed query is not retried.
  await writeCache(cacheName, filename, { url, fetchedAt: new Date().toISOString(), status: response.status, body });
  return body;
}
