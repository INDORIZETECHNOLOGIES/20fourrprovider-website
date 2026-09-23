import type { BadgeTone } from "@/lib/constants/settlementState";

// Razorpay's review of the provider's payout ("linked") account — the backend mirrors it from
// Razorpay's account.* webhooks onto bankDetails.razorpayActivationStatus.
export type PayoutActivation = "created" | "under_review" | "needs_clarification" | "activated" | "suspended";

export type PayoutAccountStatus = {
  label: string;
  detail: string;
  tone: BadgeTone;
  done: boolean;
  action?: { href: string; label: string };
};

type PayoutBankDetails = {
  verified?: boolean;
  confirmedByProvider?: boolean;
  razorpayActivationStatus?: PayoutActivation | null;
  razorpayProvisioningError?: string | null;
};

const SUPPORT = { href: "/tickets", label: "Contact support" };

/**
 * Where the provider's payout account stands, in their terms. Null until the bank account is
 * verified and confirmed — before that, the bank-account step is the thing to act on, and the
 * payout account doesn't exist yet.
 *
 * Razorpay can't hold a client's payment, so the backend refuses a v6 booking (SC_1494) until
 * this account is activated. That is why "activated" is the only done state.
 */
export function payoutAccountStatus(bank: PayoutBankDetails | null | undefined): PayoutAccountStatus | null {
  if (!bank?.verified || !bank.confirmedByProvider) return null;

  switch (bank.razorpayActivationStatus) {
    case "activated":
      return {
        label: "Active",
        detail: "Approved by Razorpay. You can accept bookings.",
        tone: "active",
        done: true,
      };
    case "created":
    case "under_review":
      return {
        label: "In review",
        detail: "Razorpay is reviewing your payout account, usually within 24–48 hours. You can accept bookings once it's approved.",
        tone: "muted",
        done: false,
      };
    case "needs_clarification":
      return {
        label: "Needs details",
        detail: "Razorpay needs more details before it can approve your payout account. Contact support and we'll tell you what's missing.",
        tone: "danger",
        done: false,
        action: SUPPORT,
      };
    case "suspended":
      return {
        label: "Suspended",
        detail: "Razorpay has suspended your payout account, so you can't accept bookings. Contact support to resolve it.",
        tone: "danger",
        done: false,
        action: SUPPORT,
      };
    default:
      // Not submitted yet. The most common reason it can't be is a missing PAN — say so, and
      // point at the page that fixes it.
      if (bank.razorpayProvisioningError && /PAN/i.test(bank.razorpayProvisioningError)) {
        return {
          label: "PAN needed",
          detail: "Add your PAN so we can submit your payout account to Razorpay for approval.",
          tone: "action",
          done: false,
          action: { href: "/tax-profile", label: "Add your PAN" },
        };
      }
      if (bank.razorpayProvisioningError) {
        return {
          label: "Not submitted",
          detail: "We couldn't submit your payout account to Razorpay yet. Contact support and we'll sort it out.",
          tone: "danger",
          done: false,
          action: SUPPORT,
        };
      }
      return {
        label: "Being set up",
        detail: "We're submitting your payout account to Razorpay for approval. Their review usually takes 24–48 hours.",
        tone: "muted",
        done: false,
      };
  }
}
