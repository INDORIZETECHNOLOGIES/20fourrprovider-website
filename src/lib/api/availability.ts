import { apiRequest } from "./client";

export type WorkingHours = {
  startTime: string;
  endTime: string;
};

export type DayOff = {
  date: string;
  reason: string;
};

export function setAvailability(
  isAvailable: boolean,
  accessToken: string,
): Promise<{ isAvailable: boolean }> {
  return apiRequest("/provider/availability", { method: "PUT", body: { isAvailable }, accessToken });
}

export function addDayOff(
  date: string,
  reason: string | undefined,
  accessToken: string,
): Promise<{ daysOff: DayOff[] }> {
  return apiRequest("/provider/availability/days-off", {
    method: "POST",
    body: { date, reason },
    accessToken,
  });
}

export function removeDayOff(date: string, accessToken: string): Promise<{ daysOff: DayOff[] }> {
  return apiRequest(`/provider/availability/days-off/${date}`, { method: "DELETE", accessToken });
}
