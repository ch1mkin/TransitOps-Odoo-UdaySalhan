"use client";

import { MobileProofUpload } from "@/components/documents/mobile-proof-upload";
import { uploadVehicleProofByToken } from "@/lib/fleet/vehicle-upload-actions";

interface MobileVehicleProofUploadProps {
  token: string;
  documentType: string;
}

export function MobileVehicleProofUpload({
  token,
  documentType,
}: MobileVehicleProofUploadProps) {
  return (
    <MobileProofUpload
      token={token}
      documentType={documentType}
      title="Upload"
      subtitle="Vehicle document upload"
      doneMessage="Go back to your desktop to crop and complete the document upload."
      onUpload={uploadVehicleProofByToken}
    />
  );
}
