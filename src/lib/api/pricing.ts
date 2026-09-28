import { apiRequest } from "./client";
import type { ProviderPricing, ServiceCategory } from "./provider";

// Backend spec 0012 — rate cards are per city. A provider appears to clients only in the
// cities where they've saved rates, and each booking is priced from its deployment city's card.

/** One row of a city's card, as the API returns it (city fields live on the card). */
export type CityRateRow = Omit<ProviderPricing, "cityKey" | "cityName">;

export type CityRateCard = {
  /** Null for rows not yet placed in a city (priced before the provider named one). */
  cityKey: string | null;
  cityName: string | null;
  stateCode: string | null;
  rows: CityRateRow[];
};

export type CityOption = { key: string; name: string; stateCode: string; priced?: boolean };

export function getCityRateCards(
  accessToken: string,
): Promise<{ cities: CityRateCard[]; primaryCityKey: string | null }> {
  return apiRequest("/provider/pricing", { accessToken });
}

/** Replaces this city's rows only; every other city is untouched. */
export function saveCityRates(
  cityKey: string,
  rows: Array<Partial<CityRateRow> & { category: ServiceCategory; dailyRate: number }>,
  accessToken: string,
): Promise<{ cityKey: string; cityName: string; rows: CityRateRow[] }> {
  return apiRequest(`/provider/pricing/cities/${encodeURIComponent(cityKey)}`, {
    method: "PUT",
    body: { rows },
    accessToken,
  });
}

/** Refused with SC_1514 while the provider has live bookings priced in this city. */
export function removeCity(cityKey: string, accessToken: string): Promise<{ removed: string }> {
  return apiRequest(`/provider/pricing/cities/${encodeURIComponent(cityKey)}`, { method: "DELETE", accessToken });
}

/** Cities this provider may price (their PSARA states when the platform enforces it), optionally in one state. */
export function listEligibleCities(accessToken: string, stateCode?: string): Promise<{ cities: CityOption[] }> {
  const query = stateCode ? `?state=${encodeURIComponent(stateCode)}` : "";
  return apiRequest(`/provider/cities/eligible${query}`, { accessToken });
}

/** Finds a city by name, or registers it (known renames fold in: Bombay → Mumbai). */
export function registerCity(name: string, stateCode: string, accessToken: string): Promise<CityOption> {
  return apiRequest("/provider/cities", { method: "POST", body: { name, state: stateCode }, accessToken });
}
