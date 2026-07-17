export type EpaTable = "GEOGRAPHIC_AREA" | "WATER_SYSTEM" | "VIOLATION";
export type GeographicArea = { pwsid: string };
export type WaterSystem = { pwsid: string; name: string | null; populationServed: number | null; sourceType: string | null };
export type Violation = { pwsid: string; contaminantCode: string | null; healthBased: boolean | null; compliancePeriod: { begins: string | null; ends: string | null }; resolved: boolean | null; status: string | null };
export type WaterSystemReport = { system: WaterSystem; violations: Violation[] };
export type ZipReport = { zip: string; pwsids: string[]; waterSystems: WaterSystemReport[] };
