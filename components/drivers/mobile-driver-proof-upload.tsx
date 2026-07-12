"use client";

import { MobileProofUpload } from "@/components/documents/mobile-proof-upload";
import { uploadDriverProofByToken } from "@/lib/fleet/driver-document-actions";

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
      title="Upload"
      subtitle="Driver identity upload"
      doneMessage="Go back to your desktop to crop and complete the driver profile."
      onUpload={uploadDriverProofByToken}
    />
  );
}
