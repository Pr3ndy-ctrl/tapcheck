import { readOrFetch } from "./cache";
import { mapRows, parseEpaRows } from "./parser";
import type { EpaTable, ZipReport } from "./types";

const BASE_URL = "https://data.epa.gov/efservice";
const endpoint = (table: EpaTable, column: string, value: string) => `${BASE_URL}/${table}/${column}/${encodeURIComponent(value)}/JSON`;
async function query(table: EpaTable, column: string, value: string) { return parseEpaRows(await readOrFetch(endpoint(table, column, value))); }

export async function getZipReport(zip: string): Promise<ZipReport> {
  if (!/^\d{5}$/.test(zip)) throw new Error("ZIP codes must contain exactly five digits.");
  const areas = mapRows("GEOGRAPHIC_AREA", await query("GEOGRAPHIC_AREA", "ZIP_CODE_SERVED", zip));
  const pwsids = [...new Set(areas.map((area) => area.pwsid))];
  const reports = await Promise.all(pwsids.map(async (pwsid) => {
    const [systems, violations] = await Promise.all([query("WATER_SYSTEM", "PWSID", pwsid), query("VIOLATION", "PWSID", pwsid)]);
    const system = mapRows("WATER_SYSTEM", systems)[0];
    return system ? { system, violations: mapRows("VIOLATION", violations) } : null;
  }));
  return { zip, pwsids, waterSystems: reports.filter((report): report is NonNullable<typeof report> => report !== null) };
}
