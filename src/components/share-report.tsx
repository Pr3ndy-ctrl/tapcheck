"use client";

import { useState } from "react";

export function ShareReport({ zip }: { zip: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  async function download() { const response = await fetch(`/api/og/${zip}`); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `tapcheck-${zip}.png`; link.click(); URL.revokeObjectURL(url); }
  return <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-7 py-5 sm:px-10"><span className="mr-1 text-sm font-semibold text-slate-600">Share this report</span><button onClick={copy} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-teal-800 transition hover:border-teal-300 hover:bg-teal-50">{copied ? "Link copied" : "Copy link"}</button><button onClick={download} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-teal-800 transition hover:border-teal-300 hover:bg-teal-50">Download card</button></div>;
}
