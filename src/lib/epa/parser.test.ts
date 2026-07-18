import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mapRows, parseEpaRows } from "./parser";
import { fallbackPwsids } from "./client";

test("parses a saved live EPA VIOLATION response", async () => {
  const fixture = await readFile(new URL("./__fixtures__/violation-real-response.json", import.meta.url), "utf8");
  const [violation] = mapRows("VIOLATION", parseEpaRows(fixture));
  assert.deepEqual(violation, { id: "0106001022950102018", pwsid: "010106001", contaminantCode: "2950", contaminantName: "Total trihalomethanes (TTHM)", contaminantCategory: "Disinfection byproduct", healthBased: true, compliancePeriod: { begins: "2018-10-01 00:00:00", ends: "2018-12-31 00:00:00" }, resolved: true, status: "R" });
});

test("filters saved EPA city/county fallback rows to the geocoded state", async () => {
  const fixture = await readFile(new URL("./__fixtures__/geographic-area-fallback-real-response.json", import.meta.url), "utf8");
  assert.deepEqual(fallbackPwsids(parseEpaRows(fixture), "NJ", "HOBOKEN"), ["NJ0905001"]);
  assert.deepEqual(fallbackPwsids(parseEpaRows(fixture), "NY", "SARATOGA SPRINGS"), ["NY4500168"]);
});
