import { apiRequest } from "./client";
import type { Coordinates } from "./duty";
import type { IncidentCategory, IncidentSeverity } from "@/lib/constants/incident";

export function raiseSos(
  bookingId: string,
  accessToken: string,
  note?: string,
  coords?: Coordinates,
): Promise<{ sosId: string; status: string; message: string }> {
  return apiRequest(`/protection/${bookingId}/sos`, {
    method: "POST",
    body: { note, ...coords },
    accessToken,
  });
}

export function submitLiveLocation(
  bookingId: string,
  coords: Coordinates,
  accessToken: string,
): Promise<{ recorded: boolean; withinFence: boolean | null; geofenceBreached: boolean }> {
  return apiRequest(`/protection/${bookingId}/location`, {
    method: "POST",
    body: coords,
    accessToken,
  });
}

export type Incident = {
  _id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  status: string;
  reporter: { name: string; role: string };
  createdAt: string;
};

export function createIncident(
  bookingId: string,
  input: { category: IncidentCategory; severity: IncidentSeverity; description: string },
  accessToken: string,
  coords?: Coordinates,
): Promise<{ incident: Incident }> {
  return apiRequest(`/protection/${bookingId}/incidents`, {
    method: "POST",
    body: { ...input, ...coords },
    accessToken,
  });
}

export function listIncidents(
  bookingId: string,
  accessToken: string,
): Promise<{ incidents: Incident[] }> {
  return apiRequest(`/protection/${bookingId}/incidents`, { accessToken });
}
