import type { BadgeTone } from "@/lib/constants/settlementState";
import type { TaxDocumentStatus, TaxDocumentType } from "@/lib/api/taxDocuments";

export const TAX_DOCUMENT_TYPES: TaxDocumentType[] = [
  "platform_fee_invoice",
  "service_tax_invoice",
  "bill_of_supply",
  "settlement_statement",
  "platform_credit_note",
  "service_credit_note",
];

export const TAX_DOCUMENT_TYPE_LABELS: Record<TaxDocumentType, string> = {
  platform_fee_invoice: "Platform fee invoice",
  service_tax_invoice: "Service tax invoice",
  bill_of_supply: "Bill of supply",
  settlement_statement: "Settlement statement",
  platform_credit_note: "Platform credit note",
  service_credit_note: "Service credit note",
};

export const TAX_DOCUMENT_STATUS_LABELS: Record<TaxDocumentStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  cancelled: "Cancelled",
};

export const TAX_DOCUMENT_STATUS_TONE: Record<TaxDocumentStatus, BadgeTone> = {
  draft: "muted",
  issued: "active",
  cancelled: "danger",
};
