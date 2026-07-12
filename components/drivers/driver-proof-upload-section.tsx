"use client";

import {
  DocumentProofUploadSection,
  type PreparedDocumentProof,
} from "@/components/documents/document-proof-upload-section";
import { DRIVER_PROOF_TYPES, type DriverProofType } from "@/constants/driver-documents";
import {
  completeDriverUploadSession,
  createDriverUploadSession,
  fetchDriverUploadSessionImage,
  getDriverUploadSession,
} from "@/lib/fleet/driver-document-actions";

export type PreparedDriverProof = PreparedDocumentProof<DriverProofType>;

interface DriverProofUploadSectionProps {
  value: PreparedDriverProof | null;
  onChange: (value: PreparedDriverProof | null) => void;
  disabled?: boolean;
}

export function DriverProofUploadSection({
  value,
  onChange,
  disabled = false,
}: DriverProofUploadSectionProps) {
  return (
    <DocumentProofUploadSection
      title="Identity proof"
      description="Upload a driving license or Aadhaar card. Use QR for phone capture or pick a file on desktop."
      documentTypes={DRIVER_PROOF_TYPES}
      defaultDocumentType="Driving License"
      uploadPathSegment="driver-proof"
      fileInputId="driver-proof-file"
      readyMessage="Document ready — complete driver details and save."
      value={value}
      onChange={onChange}
      disabled={disabled}
      handlers={{
        createSession: createDriverUploadSession,
        getSession: async (sessionId) => {
          const result = await getDriverUploadSession(sessionId);
          return { session: result.session, error: result.error };
        },
        fetchSessionImage: fetchDriverUploadSessionImage,
        completeSession: completeDriverUploadSession,
      }}
    />
  );
}
