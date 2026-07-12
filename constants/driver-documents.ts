export const DRIVER_PROOF_TYPES = [
  "Driving License",
  "Aadhaar Card",
] as const;

export type DriverProofType = (typeof DRIVER_PROOF_TYPES)[number];

export const DRIVER_DOCS_BUCKET = "driver-documents";
