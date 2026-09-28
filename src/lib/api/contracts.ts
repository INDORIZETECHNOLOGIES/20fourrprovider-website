import { apiRequest } from "./client";
import type { BookingStatus } from "@/lib/constants/bookingStatus";
import type { ServiceCategory } from "./provider";

// Backend spec 0014. A long-term contract billed month by month: one booking per cycle, each paid
// before it starts. Built switched off — every endpoint answers SC_1530 until the platform turns
// contracts on, which is how this site knows whether to show them at all.

export type ContractStatus =
  | "requested"
  | "accepted"
  | "active"
  | "suspended"
  | "completed"
  | "rejected"
  | "cancelled"
  | "terminated";

export type ContractCycle = {
  index: number; // 0-based; "month 1" is index 0
  startDate: string; // YYYY-MM-DD, India calendar day
  endDate: string;
  days: number;
  /** The provider's price for this cycle, all people, before GST. */
  providerPreGstPaise: number;
  bookingId: string | null;
  bookingStatus: BookingStatus | null;
};

export type Contract = {
  _id: string;
  contractId: string;
  serviceCategory: ServiceCategory;
  headcount: number;
  deployment: { addressLine?: string | null; city?: string | null; stateName?: string | null; pincode?: string | null };
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  cycles: ContractCycle[];
  status: ContractStatus;
  mandate: { status: "none" | "pending" | "confirmed" | "rejected" | "cancelled"; method: "emandate" | "upi" | "card" | null };
  suspendedAt: string | null;
  suspendedCycleIndex?: number | null;
  terminationNotice: { by: "client" | "provider" | "admin"; givenAt: string; effectiveOn: string; effectiveCycleIndex: number; reason?: string | null } | null;
  acceptedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
};

export function listContracts(accessToken: string): Promise<{ contracts: Contract[]; pagination: { total: number } }> {
  return apiRequest("/provider/contracts?limit=100", { accessToken });
}

/** True when contracts are switched on for the platform; any failure reads as off. */
export function contractsEnabled(accessToken: string): Promise<boolean> {
  return apiRequest("/provider/contracts?limit=1", { accessToken }).then(
    () => true,
    () => false,
  );
}

export function getContract(id: string, accessToken: string): Promise<Contract> {
  return apiRequest(`/provider/contracts/${id}`, { accessToken });
}

/** Takes capacity for the whole term (SC_1534 when there isn't any). Gated on verification. */
export function acceptContract(id: string, accessToken: string): Promise<Contract> {
  return apiRequest(`/provider/contracts/${id}/accept`, { method: "POST", accessToken });
}

export function rejectContract(id: string, reason: string | null, accessToken: string): Promise<Contract> {
  return apiRequest(`/provider/contracts/${id}/reject`, { method: "POST", body: { reason }, accessToken });
}

/**
 * Notice. Before the contract starts this cancels it outright; once running, the server works out
 * the end date (the end of the month in which the notice period runs out) and returns it.
 */
export function giveNotice(id: string, reason: string | null, accessToken: string): Promise<Contract> {
  return apiRequest(`/provider/contracts/${id}/terminate`, { method: "POST", body: { reason }, accessToken });
}
