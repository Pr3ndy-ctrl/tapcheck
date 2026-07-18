import { ImageResponse } from "next/og";
import React from "react";
import { getZipReport } from "@/lib/epa/client";
import { generateWaterReport } from "@/lib/report/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const gradeColor = { A: "#0f766e", B: "#059669", C: "#d97706", D: "#ef4444", F: "#b91c1c" };

export async function GET(_: Request, { params }: { params: Promise<{ zip: string }> }) {
  const { zip } = await params;
  try {
    const source = await getZipReport(zip);
    const primary = source.waterSystems[0];
    if (!primary) return card(zip, "?", "Water system not found", "EPA coverage is incomplete for this ZIP.", "#64748b");
    const report = await generateWaterReport(primary);
    return card(zip, report.grade, primary.system.name ?? primary.system.pwsid, report.summary, gradeColor[report.grade]);
  } catch {
    return card(zip, "?", "TapCheck water report", "A plain-English view of public drinking-water records.", "#64748b");
  }
}

function card(zip: string, grade: string, system: string, summary: string, color: string) {
  const shareSummary = summary.replace(/\s+/g, " ").slice(0, 64).replace(/\s+\S*$/, "") + (summary.length > 64 ? "..." : "");
  return new ImageResponse(<div style={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", padding: 56, fontFamily: "Arial", color: "#12303a", backgroundColor: "#f3fbfc", backgroundImage: "radial-gradient(circle at 88% 10%, #c4f3ed 0, transparent 26%), radial-gradient(circle at 8% 100%, #c9e8ff 0, transparent 30%)" }}>
    <div style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 700, color: "#115e59" }}><span style={{ display: "flex", height: 40, width: 40, marginRight: 12, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#0f766e", color: "white" }}>T</span>TapCheck</div>
    <div style={{ display: "flex", flex: 1, alignItems: "center" }}><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", alignItems: "center" }}><div style={{ display: "flex", height: 192, width: 192, alignItems: "center", justifyContent: "center", borderRadius: 999, fontSize: 128, fontWeight: 700, color: "white", backgroundColor: color }}>{grade}</div><div style={{ display: "flex", marginLeft: 40, flexDirection: "column" }}><div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#0f766e" }}>WATER REPORT / ZIP {zip}</div><div style={{ display: "flex", marginTop: 16, maxWidth: 650, fontSize: 50, fontWeight: 700, lineHeight: 1.1, color: "#0f172a" }}>{system}</div></div></div><div style={{ display: "flex", marginTop: 48, maxWidth: 1060, fontSize: 27, lineHeight: 1.2, color: "#334155" }}>{shareSummary}</div></div></div>
    <div style={{ display: "flex", borderTop: "1px solid #b9e5e1", paddingTop: 28, fontSize: 21, letterSpacing: 1, color: "#52717a" }}>tapcheck | EPA-sourced</div>
  </div>, { width: 1200, height: 630 });
}
