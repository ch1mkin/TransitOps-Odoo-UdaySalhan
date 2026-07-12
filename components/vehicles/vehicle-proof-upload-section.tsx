"use client";

import {
  DocumentProofUploadSection,
  type PreparedDocumentProof,
} from "@/components/documents/document-proof-upload-section";
import {
  VEHICLE_DOCUMENT_TYPES,
  type VehicleDocumentType,
} from "@/constants/vehicle-documents";
import {
  completeVehicleUploadSession,
  createVehicleUploadSession,
  fetchVehicleUploadSessionImage,
  getVehicleUploadSession,
} from "@/lib/fleet/vehicle-upload-actions";

export type PreparedVehicleProof = PreparedDocumentProof<VehicleDocumentType>;

interface VehicleProofUploadSectionProps {
  value: PreparedVehicleProof | null;
  onChange: (value: PreparedVehicleProof | null) => void;
  disabled?: boolean;
}

export function VehicleProofUploadSection({
  value,
  onChange,
  disabled = false,
}: VehicleProofUploadSectionProps) {
  return (
    <DocumentProofUploadSection
      title="Vehicle document"
      description="Upload registration, insurance, fitness, or PUC proof. Use QR for phone capture or pick a file on desktop."
      documentTypes={VEHICLE_DOCUMENT_TYPES}
      defaultDocumentType="Registration Certificate"
      uploadPathSegment="vehicle-proof"
      fileInputId="vehicle-proof-file"
      readyMessage="Document ready — complete details and upload."
      value={value}
      onChange={onChange}
      disabled={disabled}
      handlers={{
        createSession: createVehicleUploadSession,
        getSession: async (sessionId) => {
          const result = await getVehicleUploadSession(sessionId);
          return { session: result.session, error: result.error };
        },
        fetchSessionImage: fetchVehicleUploadSessionImage,
        completeSession: completeVehicleUploadSession,
      }}
    />
  );
}
