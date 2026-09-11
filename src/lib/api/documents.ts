import { apiUpload } from "./client";
import type { ProviderDocumentId } from "@/lib/constants/providerDocuments";

export type UploadedDocument = {
  _id: string;
  documentType: ProviderDocumentId;
  fileUrl: string; // presigned GET URL
  fileName: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
  uploadedAt: string;
};

export function uploadProviderDocument(
  documentType: ProviderDocumentId,
  file: File,
  accessToken: string,
): Promise<{ document: UploadedDocument }> {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);
  return apiUpload("/provider/documents/upload", formData, accessToken);
}
