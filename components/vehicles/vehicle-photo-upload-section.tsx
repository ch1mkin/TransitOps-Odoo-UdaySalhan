"use client";

import {
  DocumentProofUploadSection,
  type PreparedDocumentProof,
} from "@/components/documents/document-proof-upload-section";
import { VEHICLE_PHOTO_TYPE } from "@/constants/vehicle-documents";
import {
  completeVehicleUploadSession,
  createVehicleUploadSession,
  fetchVehicleUploadSessionImage,
  getVehicleUploadSession,
} from "@/lib/fleet/vehicle-upload-actions";

export type PreparedVehiclePhoto = PreparedDocumentProof<typeof VEHICLE_PHOTO_TYPE>;

interface VehiclePhotoUploadSectionProps {
  value: PreparedVehiclePhoto | null;
  onChange: (value: PreparedVehiclePhoto | null) => void;
  disabled?: boolean;
}

export function VehiclePhotoUploadSection({
  value,
  onChange,
  disabled = false,
}: VehiclePhotoUploadSectionProps) {
  return (
    <DocumentProofUploadSection
      title="Vehicle photo"
      description="Capture the vehicle during registration using QR on phone or upload from desktop."
      documentTypes={[VEHICLE_PHOTO_TYPE]}
      defaultDocumentType={VEHICLE_PHOTO_TYPE}
      uploadPathSegment="vehicle-proof"
      fileInputId="vehicle-photo-file"
      readyMessage="Photo ready — complete vehicle details and save."
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
