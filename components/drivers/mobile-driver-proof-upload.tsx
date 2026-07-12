"use client";

import { MobileProofUpload } from "@/components/documents/mobile-proof-upload";

interface MobileDriverProofUploadProps {
  token: string;
  documentType: string;
}

export function MobileDriverProofUpload({
  token,
  documentType,
}: MobileDriverProofUploadProps) {
  return (
    <MobileProofUpload
      token={token}
      documentType={documentType}
      uploadEndpoint={`/api/upload/driver-proof/${token}`}
      title="Upload"
      subtitle="Driver identity upload"
      doneMessage="Go back to your desktop to crop and complete the driver profile."
    />
  );
}
