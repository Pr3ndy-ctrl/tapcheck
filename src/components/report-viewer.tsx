"use client";

import Link from "next/link";
import { useState } from "react";
import type { WaterSystemReport } from "@/lib/epa/types";
import type { AiWaterReport } from "@/lib/report/types";
import { contaminantLabel, getContaminant } from "@/lib/epa/contaminants";
import { ShareReport } from "./share-report";
import { ThemeToggle } from "./theme-toggle";

type SystemReport = WaterSystemReport & { aiReport: AiWaterReport };
const gradeStyle: Record<AiWaterReport["grade"], string> = { A: "bg-teal-600", B: "bg-emerald-600", C: "bg-amber-500", D: "bg-red-500", F: "bg-red-700" };
const safetyStyle = { safe: "bg-emerald-100 text-emerald-800", caution: "bg-amber-100 text-amber-800", risk: "bg-red-100 text-red-800" };
const sourceName: Record<string, string> = { GW: "Groundwater", SW: "Surface water", GU: "Groundwater influenced by surface water", SWP: "Surface water purchase" };

export function ReportViewer({ zip, systems }: { zip: string; systems: SystemReport[] }) {
  const [active, setActive] = useState(0); const item = systems[active]; const { system, aiReport } = item;
  const isClean = item.violations.length === 0;
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <div className="mb-9 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-teal-900 dark:text-teal-100"><span className="grid size-8 place-items-center rounded-xl bg-teal-600 text-sm text-white dark:bg-teal-700">≈</span>TapCheck</Link><div className="flex items-center gap-3"><Link href="/" className="text-sm font-medium text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100">Check another ZIP</Link><ThemeToggle /></div></div>
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Water report · ZIP {zip}</p>
    {systems.length > 1 && <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist">{systems.map((entry, index) => <button key={entry.system.pwsid} role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${active === index ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-700"}`}>{entry.system.name ?? entry.system.pwsid}</button>)}</div>}
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,118,110,0.45)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-7 sm:p-10 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center"><div className={`grid size-32 shrink-0 place-items-center rounded-full text-7xl font-semibold tracking-tighter text-white shadow-lg dark:shadow-none ${gradeStyle[aiReport.grade]}`}>{aiReport.grade}</div><div><p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">TapCheck grade</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{system.name ?? system.pwsid}</h1><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-300"><span>{system.populationServed?.toLocaleString() ?? "Population unavailable"} people served</span><span>{system.sourceType ? sourceName[system.sourceType] ?? system.sourceType : "Source type unavailable"}</span></div></div></div>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-200">{aiReport.summary}</p><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{aiReport.gradeRationale}</p>
      </div>
      <ShareReport zip={zip} />
      <div className="space-y-10 p-7 sm:p-10">
        {isClean ? <CleanBill /> : <Contaminants report={aiReport} violations={item.violations} />}
        <FilterCallout report={aiReport} />
        <NonHuman report={aiReport} />
      </div>
    </section>
  </main>;
}

function Contaminants({ report, violations }: { report: AiWaterReport; violations: WaterSystemReport["violations"] }) {
  return <section><div className="mb-5"><p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-700 dark:text-teal-300">What we found</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">EPA-recorded contaminants</h2></div><div className="grid gap-4 md:grid-cols-2">{report.contaminants.map((item) => { const violation = violations.find(({ id }) => id === item.citationViolationId); const code = violation?.contaminantCode ?? null; const label = contaminantLabel(code); const category = getContaminant(code)?.category; return <article key={`${item.name}-${item.citationViolationId}`} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700 dark:bg-slate-800/70"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-slate-100">{label}</h3><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">code {code ?? "—"}</span>{category && <span className="rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-200">{category}</span>}<span className="text-slate-500 dark:text-slate-400">{violation ? humanizeDate(violation.compliancePeriod.begins, violation.resolved) : "Date unavailable"}</span></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.exceededLimit ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"}`}>{item.exceededLimit ? "Limit exceeded" : "Reported violation"}</span></div><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.whatItIs}</p><p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200"><span className="font-medium">Health effects: </span>{item.healthEffects}</p><span className="mt-4 inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-200">EPA violation #{item.citationViolationId}</span></article>; })}</div></section>;
}

function humanizeDate(value: string | null, resolved: boolean | null): string {
  if (!value) return resolved ? "Date unavailable · resolved" : "Date unavailable · unresolved";
  const date = new Date(`${value.replace(" ", "T")}Z`);
  const label = Number.isNaN(date.getTime()) ? value.slice(0, 10) : new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  return `${label} · ${resolved ? "resolved" : "unresolved"}`;
}

function CleanBill() { return <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40"><p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">A calm clean bill</p><h2 className="mt-1 text-2xl font-semibold text-emerald-950 dark:text-emerald-100">No EPA violations were returned</h2><p className="mt-2 max-w-2xl leading-7 text-emerald-900/75 dark:text-emerald-100/80">That&apos;s encouraging. It reflects the public violation records available for this system, not a guarantee that every water-quality measure has been tested.</p></section>; }
function FilterCallout({ report }: { report: AiWaterReport }) { const icon = report.filterRecommendation.type === "none" ? "💧" : report.filterRecommendation.type === "activated-carbon" ? "◒" : "◎"; return <section className="rounded-2xl bg-teal-900 p-6 text-white sm:p-7"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-xl">{icon}</span><div><p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-200">Filter recommendation</p><h2 className="mt-1 text-xl font-semibold capitalize">{report.filterRecommendation.type.replace("-", " ")}</h2><p className="mt-2 max-w-2xl leading-7 text-teal-50/90">{report.filterRecommendation.reason}</p></div></div></section>; }
function NonHuman({ report }: { report: AiWaterReport }) { const labels = { fish: ["🐟", "Fish"], plants: ["🪴", "Plants"], pets: ["🐾", "Pets"] } as const; return <section><p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-700 dark:text-teal-300">Not just for humans</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">How it may affect the rest of the household</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{(Object.keys(labels) as Array<keyof typeof labels>).map((key) => { const [icon, label] = labels[key]; const advice = report.nonHuman[key]; return <article key={key} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700 dark:bg-slate-800/70"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900 dark:text-slate-100">{icon} {label}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${safetyStyle[advice.safety]}`}>{advice.safety}</span></div><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{advice.explanation}</p></article>; })}</div></section>; }
