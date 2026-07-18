export type Contaminant = { name: string; category: string };

// Verified against EPA SDWIS annual-compliance and implementation materials.
// Codes not corroborated there are intentionally omitted and shown as unlisted.
const contaminants: Record<string, Contaminant> = {
  "0200": { name: "Surface Water Treatment Rule", category: "Treatment rule" },
  "2456": { name: "Haloacetic acids (HAA5)", category: "Disinfection byproduct" },
  "2950": { name: "Total trihalomethanes (TTHM)", category: "Disinfection byproduct" },
  "5000": { name: "Lead and Copper Rule", category: "Lead and copper rule" },
  "5200": { name: "Lead and Copper Rule Revisions", category: "Lead and copper rule" },
  "7000": { name: "Consumer Confidence Report Rule", category: "Public reporting rule" },
  "7500": { name: "Public Notice Rule", category: "Public notification rule" },
  "8000": { name: "Revised Total Coliform Rule", category: "Microbial rule" },
};

export function getContaminant(code: string | null): Contaminant | null { return code ? contaminants[code] ?? null : null; }
export function contaminantLabel(code: string | null): string { return getContaminant(code)?.name ?? `Unlisted contaminant${code ? ` (code ${code})` : ""}`; }
