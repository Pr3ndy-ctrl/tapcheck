import { readOrFetch } from "./cache";
import { geocodeZip } from "./geocode";
import { mapRows, parseEpaRows, type EpaRow } from "./parser";
import type { EpaTable, WaterSystem, WaterSystemReport, ZipReport } from "./types";

const BASE_URL = "https://data.epa.gov/efservice";
const endpoint = (table: EpaTable, column: string, value: string) => `${BASE_URL}/${table}/${column}/${encodeURIComponent(value)}/JSON`;
async function query(table: EpaTable, column: string, value: string) { return parseEpaRows(await readOrFetch(endpoint(table, column, value))); }

/** EPA PWSIDs for state-run systems begin with the two-letter state abbreviation. */
export function fallbackPwsids(rows: EpaRow[], state: string, city?: string): string[] {
  const areas = mapRows("GEOGRAPHIC_AREA", rows).filter(({ pwsid }) => pwsid.startsWith(state));
  const cityMatches = city ? areas.filter(({ cityServed }) => cityKey(cityServed).includes(cityKey(city))) : [];
  const candidates = cityMatches.length ? cityMatches : areas;
  const activeCommunity = candidates.filter(({ activityCode, systemType }) => activityCode === "A" && systemType === "CWS");
  return [...new Set((activeCommunity.length ? activeCommunity : candidates).map(({ pwsid }) => pwsid))];
}

// EPA commonly drops vowels in place names (for example, "SARATOGA SPRNGS").
function cityKey(value: string | null | undefined): string {
  return (value ?? "").toUpperCase().replace(/[^A-Z]/g, "").replace(/[AEIOU]/g, "");
}

export async function getZipReport(zip: string): Promise<ZipReport> {
  if (!/^\d{5}$/.test(zip)) throw new Error("ZIP codes must contain exactly five digits.");
  const zipRows = await query("GEOGRAPHIC_AREA", "ZIP_CODE_SERVED", zip);
  let pwsids = [...new Set(mapRows("GEOGRAPHIC_AREA", zipRows).map(({ pwsid }) => pwsid))];

  if (pwsids.length === 0) {
    const location = await geocodeZip(zip);
    const [cityRows, countyRows] = await Promise.all([
      query("GEOGRAPHIC_AREA", "CITY_SERVED", location.city),
      query("GEOGRAPHIC_AREA", "COUNTY_SERVED", location.county),
    ]);
    pwsids = fallbackPwsids([...cityRows, ...countyRows], location.state, location.city);
  }

  const systems = (await mapInBatches(pwsids, async (pwsid) => mapRows("WATER_SYSTEM", await query("WATER_SYSTEM", "PWSID", pwsid))[0] ?? null))
    .filter((system): system is WaterSystem => system !== null)
    .sort(compareSystems);
  const violations = await mapInBatches(systems, async (system) => mapRows("VIOLATION", await query("VIOLATION", "PWSID", system.pwsid)));
  const waterSystems: WaterSystemReport[] = systems.map((system, index) => ({ system, violations: violations[index] }));
  return { zip, pwsids: systems.map(({ pwsid }) => pwsid), waterSystems };
}

function compareSystems(left: WaterSystem, right: WaterSystem): number {
  const primary = (system: WaterSystem) => system.activityCode === "A" && system.systemType === "CWS";
  if (primary(left) !== primary(right)) return primary(left) ? -1 : 1;
  return (right.populationServed ?? -1) - (left.populationServed ?? -1);
}

async function mapInBatches<T, R>(items: T[], task: (item: T) => Promise<R>, batchSize = 6): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += batchSize) results.push(...await Promise.all(items.slice(index, index + batchSize).map(task)));
  return results;
}
