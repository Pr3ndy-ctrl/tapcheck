"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ZipSearch() {
  const router = useRouter(); const [zip, setZip] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (/^\d{5}$/.test(zip)) router.push(`/report/${zip}`); }
  return <form onSubmit={submit} className="flex gap-2"><label className="sr-only" htmlFor="zip">US ZIP code</label><input id="zip" value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" placeholder="Enter a ZIP code" className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-5 py-4 text-lg text-slate-900 outline-none ring-teal-500 placeholder:text-slate-400 focus:ring-2" /><button className="rounded-2xl bg-teal-700 px-5 py-4 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50" disabled={!/^\d{5}$/.test(zip)}>Check water</button></form>;
}
