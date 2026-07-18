import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ReportViewer } from "@/components/report-viewer";
import { getZipReport } from "@/lib/epa/client";
import { generateWaterReport } from "@/lib/report/generate";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ zip: string }> }): Promise<Metadata> {
  const { zip } = await params; const requestHeaders = await headers();
  const origin = `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000"}`;
  let title = `TapCheck water report · ${zip}`; let description = "A plain-English view of public drinking-water records.";
  try { const source = await getZipReport(zip); const primary = source.waterSystems[0]; if (primary) { const report = await generateWaterReport(primary); title = `${report.grade} grade · ${primary.system.name ?? "Water system"} · TapCheck`; description = report.summary; } } catch { /* Keep a useful share fallback for unknown ZIPs. */ }
  const image = new URL(`/api/og/${zip}`, origin).toString();
  return { title, description, openGraph: { title, description, type: "website", images: [{ url: image, width: 1200, height: 630, alt: `TapCheck water report for ZIP ${zip}` }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function ReportPage({ params }: { params: Promise<{ zip: string }> }) {
  const { zip } = await params;
  return <Suspense fallback={<Analyzing zip={zip} />}><ReportContent zip={zip} /></Suspense>;
}

async function ReportContent({ zip }: { zip: string }) {
  let systems: Awaited<ReturnType<typeof loadSystems>> | null = null;
  try {
    systems = await loadSystems(zip);
  } catch { /* Render the same friendly state for lookup or generation failures. */ }
  return systems?.length ? <ReportViewer zip={zip} systems={systems} /> : <NotFound zip={zip} />;
}

async function loadSystems(zip: string) {
  const report = await getZipReport(zip);
  return Promise.all(report.waterSystems.map(async (waterSystem) => ({ ...waterSystem, aiReport: await generateWaterReport(waterSystem) })));
}

function Analyzing({ zip }: { zip: string }) { return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center"><div className="water-loader" aria-hidden="true"><div className="water-droplet" /><div className="water-rim" /><div className="water-glass"><div className="water-fill"><div className="water-wave" /></div></div></div><p className="mt-8 text-xl font-semibold text-slate-900 dark:text-slate-100">Analyzing 30 years of EPA data…</p><p className="mt-2 leading-7 text-slate-500 dark:text-slate-400">We&apos;re connecting public records to the water system serving ZIP {zip}.</p></main>; }
function NotFound({ zip }: { zip: string }) { const suggestions = ["07030", "12866", "10001"]; return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-sky-100 text-3xl dark:bg-slate-800">⌕</div><h1 className="mt-7 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">We couldn&apos;t find a report for {zip}</h1><p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">EPA coverage can be incomplete for some ZIP codes. Try checking the ZIP again or explore a sample report.</p><div className="mt-7 flex justify-center gap-2">{suggestions.map((sample) => <Link key={sample} href={`/report/${sample}`} className="rounded-full border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-teal-200">{sample}</Link>)}</div></main>; }
