import type { Contract, ContractCycle, ContractStatus } from "@/lib/api/contracts";

export type ContractTab = "requests" | "active" | "ended";

export const CONTRACT_TAB: Record<ContractStatus, ContractTab> = {
  requested: "requests",
  accepted: "active",
  active: "active",
  suspended: "active",
  completed: "ended",
  rejected: "ended",
  cancelled: "ended",
  terminated: "ended",
};

export const CONTRACT_STATUS: Record<ContractStatus, { label: string; tone: "action" | "active" | "muted" | "danger" }> = {
  requested: { label: "New request", tone: "action" },
  accepted: { label: "Starts soon", tone: "active" },
  active: { label: "Active", tone: "active" },
  suspended: { label: "Paused — unpaid", tone: "danger" },
  completed: { label: "Completed", tone: "muted" },
  rejected: { label: "Declined", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "muted" },
  terminated: { label: "Ended early", tone: "muted" },
};

/** Whole calendar months in the term, as a client would describe it ("6 months"). */
export function termMonths(contract: Pick<Contract, "cycles">): number {
  return contract.cycles.length;
}

export const termTotalPaise = (contract: Pick<Contract, "cycles">): number =>
  contract.cycles.reduce((sum, c) => sum + c.providerPreGstPaise, 0);

export type CycleState = { label: string; tone: "action" | "active" | "muted" | "danger" };

/** One month's standing, from its booking — or its absence, for a month not yet billed. */
export function cycleState(cycle: ContractCycle, contract: Pick<Contract, "status" | "suspendedCycleIndex">): CycleState {
  if (contract.status === "suspended" && contract.suspendedCycleIndex === cycle.index) return { label: "Unpaid — paused", tone: "danger" };
  switch (cycle.bookingStatus) {
    case null:
      return ["completed", "rejected", "cancelled", "terminated"].includes(contract.status)
        ? { label: "Not billed", tone: "muted" }
        : { label: "Upcoming", tone: "muted" };
    case "provider_accepted":
    case "payment_pending":
      return { label: "Awaiting payment", tone: "action" };
    case "payment_done":
      return { label: "Paid", tone: "active" };
    case "duty_started":
      return { label: "On duty", tone: "active" };
    case "duty_ended":
      return { label: "Ended — upload invoice", tone: "action" };
    case "completed":
      return { label: "Done", tone: "muted" };
    case "cancelled":
      return { label: "Cancelled", tone: "muted" };
    default:
      return { label: cycle.bookingStatus.replace(/_/g, " "), tone: "muted" };
  }
}

/** Contract statuses in which either party can still give notice. */
export const NOTICE_ALLOWED: ContractStatus[] = ["accepted", "active", "suspended"];

/** The India calendar day a YYYY-MM-DD string names, formatted without a timezone shift. */
export function formatDay(day: string): string {
  const [y, m, d] = day.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
