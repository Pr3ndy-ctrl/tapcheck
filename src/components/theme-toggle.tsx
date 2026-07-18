"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;
const serverSnapshot = () => false;

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), serverSnapshot);
  function toggle() { const next = !dark; document.documentElement.classList.toggle("dark", next); document.documentElement.classList.toggle("light", !next); localStorage.setItem("tapcheck-theme", next ? "dark" : "light"); }
  return <button onClick={toggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-teal-100 dark:hover:border-teal-700" title="Toggle color theme"><span aria-hidden="true">{dark ? "☀" : "☾"}</span></button>;
}
