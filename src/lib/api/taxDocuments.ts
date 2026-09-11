import { apiRequest, apiDownload } from "./client";

export type TaxDocumentType =
  | "platform_fee_invoice"
  | "service_tax_invoice"
  | "bill_of_supply"
  | "settlement_statement"
  | "platform_credit_note"
  | "service_credit_note";

export type TaxDocumentStatus = "draft" | "issued" | "cancelled";

export type TaxDocumentHeader = {
  _id: string;
  documentNumber: string;
  series: string;
  docType: TaxDocumentType;
  financialYear: string;
  bookingId: string;
  issuedAt: string;
  status: TaxDocumentStatus;
  totalPaise: number;
  issuer: { party: "platform" | "provider" };
  recipient: { party: "client" | "provider" };
  reversesDocumentId?: string | null;
};

export type TaxDocumentLineItem = {
  description: string;
  sac?: string | null;
  quantity: number;
  unitPricePaise: number;
  amountPaise: number;
};

export type TaxDocumentTaxLine = {
  label: string;
  taxType: "service_gst" | "platform_gst" | "tcs" | "tds_194o";
  ratePct: number | null;
  basePaise: number;
  amountPaise: number;
  split?: { intraState: boolean | null; cgst: number; sgst: number; igst: number };
};

export type TaxDocumentParty = {
  party: string;
  legalName?: string | null;
  address?: string | null;
  gstin?: string | null;
  stateCode?: string | null;
};

export type TaxDocumentDetail = TaxDocumentHeader & {
  paymentId?: string | null;
  issuer: TaxDocumentParty;
  recipient: TaxDocumentParty;
  lineItems: TaxDocumentLineItem[];
  taxLines: TaxDocumentTaxLine[];
  placeOfSupplyStateCode?: string | null;
  taxableValuePaise: number;
  notes?: string | null;
};

export type Pagination = { page: number; limit: number; total: number; pages: number };

export function listTaxDocuments(
  accessToken: string,
  options: { docType?: TaxDocumentType; bookingId?: string; page?: number; limit?: number } = {},
): Promise<{ documents: TaxDocumentHeader[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.docType) params.set("docType", options.docType);
  if (options.bookingId) params.set("bookingId", options.bookingId);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/documents/${query ? `?${query}` : ""}`, { accessToken });
}

export function getTaxDocument(documentId: string, accessToken: string): Promise<TaxDocumentDetail> {
  return apiRequest(`/documents/${documentId}`, { accessToken });
}

export function downloadTaxDocumentPdf(documentId: string, accessToken: string): Promise<Blob> {
  return apiDownload(`/documents/${documentId}/pdf`, accessToken);
}
