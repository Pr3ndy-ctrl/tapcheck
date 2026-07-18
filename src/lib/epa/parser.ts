import type { EpaTable, GeographicArea, Violation, WaterSystem } from "./types";

export type EpaRow = Record<string, unknown>;
const decodeXml = (value: string) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function xmlRows(xml: string): EpaRow[] {
  // Envirofacts XML has varied between <ROW> and table-named row elements.
  const withoutDeclaration = xml.replace(/^\s*<\?xml[^>]*>\s*/i, "");
  const root = withoutDeclaration.match(/^<([A-Za-z_][\w-]*)\b[^>]*>([\s\S]*)<\/\1>\s*$/);
  const contents = root?.[2] ?? withoutDeclaration;
  const rows = [...contents.matchAll(/<(ROW|GEOGRAPHIC_AREA|WATER_SYSTEM|VIOLATION)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  return rows.map((match) => {
    const row: EpaRow = {};
    for (const field of match[2].matchAll(/<([A-Z0-9_]+)\b[^>]*>([\s\S]*?)<\/\1>/gi)) row[field[1].toLowerCase()] = decodeXml(field[2].trim());
    return row;
  }).filter((row) => Object.keys(row).length > 0);
}

/** Parses JSON, JSON envelopes, and the XML fallback EPA can return for /JSON URLs. */
export function parseEpaRows(body: string): EpaRow[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.filter(isRow).map(normalizeKeys);
    if (isRow(parsed)) {
      const candidate = Object.values(parsed).find(Array.isArray);
      if (Array.isArray(candidate)) return candidate.filter(isRow).map(normalizeKeys);
      return [normalizeKeys(parsed)];
    }
  } catch { /* EPA sometimes sends XML despite /JSON. */ }
  return xmlRows(trimmed).map(normalizeKeys);
}

function isRow(value: unknown): value is EpaRow { return typeof value === "object" && value !== null && !Array.isArray(value); }
function normalizeKeys(row: EpaRow): EpaRow { return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])); }
const stringAt = (row: EpaRow, key: string): string | null => { const value = row[key]; return value === null || value === undefined || value === "" ? null : String(value); };
const numberAt = (row: EpaRow, key: string): number | null => { const value = Number(row[key]); return Number.isFinite(value) ? value : null; };
const flagAt = (row: EpaRow, key: string): boolean | null => { const value = stringAt(row, key)?.toUpperCase(); return value === "Y" ? true : value === "N" ? false : null; };

export function mapRows(table: "GEOGRAPHIC_AREA", rows: EpaRow[]): GeographicArea[];
export function mapRows(table: "WATER_SYSTEM", rows: EpaRow[]): WaterSystem[];
export function mapRows(table: "VIOLATION", rows: EpaRow[]): Violation[];
export function mapRows(table: EpaTable, rows: EpaRow[]): GeographicArea[] | WaterSystem[] | Violation[] {
  if (table === "GEOGRAPHIC_AREA") return rows.flatMap((row) => { const pwsid = stringAt(row, "pwsid"); return pwsid ? [{ pwsid, activityCode: stringAt(row, "pws_activity_code"), systemType: stringAt(row, "pws_type_code"), cityServed: stringAt(row, "city_served"), countyServed: stringAt(row, "county_served") }] : []; });
  if (table === "WATER_SYSTEM") return rows.flatMap((row) => { const pwsid = stringAt(row, "pwsid"); return pwsid ? [{ pwsid, name: stringAt(row, "pws_name"), populationServed: numberAt(row, "population_served_count"), sourceType: stringAt(row, "primary_source_code"), activityCode: stringAt(row, "pws_activity_code"), systemType: stringAt(row, "pws_type_code") }] : []; });
  return rows.flatMap((row) => {
    const pwsid = stringAt(row, "pwsid"); if (!pwsid) return [];
    const status = stringAt(row, "compliance_status_code");
    return [{ pwsid, contaminantCode: stringAt(row, "contaminant_code"), healthBased: flagAt(row, "is_health_based_ind"), compliancePeriod: { begins: stringAt(row, "compl_per_begin_date"), ends: stringAt(row, "compl_per_end_date") }, resolved: status === "R" || Boolean(stringAt(row, "rtc_date")), status }];
  });
}
