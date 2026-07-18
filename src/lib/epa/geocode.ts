import { readOrFetch } from "./cache";

export type ZipLocation = { city: string; state: string; county: string };

type ZippopotamResponse = { places?: Array<{ "place name"?: unknown; "state abbreviation"?: unknown; latitude?: unknown; longitude?: unknown }> };
type CensusResponse = { result?: { geographies?: { Counties?: Array<{ BASENAME?: unknown }> } } };

/** Resolves a ZIP with Zippopotam.us, then gets its county from its returned coordinates. */
export async function geocodeZip(zip: string): Promise<ZipLocation> {
  const zippopotam = JSON.parse(await readOrFetch(`https://api.zippopotam.us/us/${zip}`, "geocoding")) as ZippopotamResponse;
  const place = zippopotam.places?.[0];
  const city = stringValue(place?.["place name"]);
  const state = stringValue(place?.["state abbreviation"]);
  const latitude = stringValue(place?.latitude);
  const longitude = stringValue(place?.longitude);
  if (!city || !state || !latitude || !longitude) throw new Error(`No complete geocoding result for ZIP ${zip}.`);

  const censusUrl = new URL("https://geocoding.geo.census.gov/geocoder/geographies/coordinates");
  censusUrl.search = new URLSearchParams({ x: longitude, y: latitude, benchmark: "Public_AR_Current", vintage: "Current_Current", format: "json" }).toString();
  const census = JSON.parse(await readOrFetch(censusUrl.toString(), "geocoding")) as CensusResponse;
  const county = stringValue(census.result?.geographies?.Counties?.[0]?.BASENAME);
  if (!county) throw new Error(`No county found for ZIP ${zip}.`);
  return { city: city.toUpperCase(), state: state.toUpperCase(), county: county.toUpperCase() };
}

function stringValue(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : null; }
