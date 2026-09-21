import { apiRequest, apiUpload } from "./client";

/**
 * The provider's own invoice to the client, for a v6 booking. The client gets two documents:
 * 20fourr's platform fee invoice (issued by us at payment) and this one, which the provider
 * issues and uploads after the end-of-duty OTP. The payout is held until it's uploaded.
 */
export type ProviderInvoiceView = {
  bookingId: string;
  bookingRef: string;
  providerInvoice: {
    invoiceNumber: string;
    invoiceDate: string;
    totalPaise: number;
    fileName: string | null;
    mimeType: string;
    uploadedAt: string;
    fileUrl: string | null; // presigned GET URL, short-lived
  } | null;
  expected: {
    documentKind: "tax_invoice" | "bill_of_supply";
    servicePaise: number;
    serviceGstPaise: number;
    serviceGstRatePct: number;
    totalPaise: number;
  };
  billTo: {
    legalName: string | null;
    address: string | null;
    gstin: string | null;
    stateCode: string | null;
    stateName: string | null;
    placeOfSupplyStateCode: string | null;
    placeOfSupplyStateName: string | null;
  };
  canUpload: boolean;
  payoutHeldForInvoice: boolean;
};

export function getProviderInvoice(bookingId: string, accessToken: string): Promise<ProviderInvoiceView> {
  return apiRequest(`/bookings/${bookingId}/provider-invoice`, { accessToken });
}

export function uploadProviderInvoice(
  bookingId: string,
  input: { file: File; invoiceNumber: string; invoiceDate: string; totalPaise: number },
  accessToken: string,
): Promise<ProviderInvoiceView> {
  const formData = new FormData();
  formData.append("invoiceNumber", input.invoiceNumber);
  formData.append("invoiceDate", input.invoiceDate);
  formData.append("totalPaise", String(input.totalPaise));
  formData.append("file", input.file);
  return apiUpload(`/provider/bookings/${bookingId}/invoice`, formData, accessToken);
}
