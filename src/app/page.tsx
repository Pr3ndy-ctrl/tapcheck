import Link from "next/link";
import { ZipSearch } from "@/components/zip-search";
import { ThemeToggle } from "@/components/theme-toggle";

const samples = ["07030", "12866", "10001"];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
      <nav className="mb-16 flex items-center justify-between text-xl font-semibold tracking-tight text-teal-900 dark:text-teal-100"><span className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-teal-600 text-sm text-white dark:bg-teal-700">≈</span>TapCheck</span><ThemeToggle /></nav>
      <section className="max-w-3xl">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Your local water, explained</p>
        <h1 className="text-5xl font-semibold tracking-[-0.045em] text-slate-900 dark:text-slate-100 sm:text-7xl">What&apos;s actually in your tap water?</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">TapCheck turns public EPA records into a clear, grounded water-quality report for the system serving your ZIP code.</p>
        <div className="mt-10 max-w-xl rounded-3xl border border-teal-100 bg-white p-3 shadow-[0_20px_60px_-30px_rgba(13,148,136,0.35)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <ZipSearch />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><span>Try a sample:</span>{samples.map((zip) => <Link key={zip} href={`/report/${zip}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-teal-800 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900 dark:text-teal-200 dark:hover:bg-slate-800">{zip}</Link>)}</div>
      </section>
      <section className="mt-20 grid max-w-3xl gap-4 sm:grid-cols-3">
        {[['EPA records', 'Public SDWIS data'], ['Grounded AI', 'Claims cite a record'], ['Made for home', 'People, pets & plants']].map(([title, copy]) => <div key={title} className="rounded-2xl border border-slate-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/70"><p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy}</p></div>)}
      </section>
    </main>
  );
}
