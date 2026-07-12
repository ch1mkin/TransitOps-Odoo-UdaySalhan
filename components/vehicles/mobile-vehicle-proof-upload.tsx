"use client";

import { MobileProofUpload } from "@/components/documents/mobile-proof-upload";

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
      uploadEndpoint={`/api/upload/vehicle-proof/${token}`}
      title="Upload"
      subtitle="Vehicle document upload"
      doneMessage="Go back to your desktop to crop and complete the document upload."
    />
  );
}
