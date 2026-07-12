export const VEHICLE_DOCUMENT_TYPES = [
  "Registration Certificate",
  "Insurance",
  "Fitness Certificate",
  "PUC Certificate",
] as const;

export type VehicleDocumentType = (typeof VEHICLE_DOCUMENT_TYPES)[number];

export const VEHICLE_DOCS_BUCKET = "vehicle-documents";
