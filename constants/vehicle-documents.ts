export const VEHICLE_DOCUMENT_TYPES = [
  "Registration Certificate",
  "Insurance",
  "Fitness Certificate",
  "PUC Certificate",
  "Vehicle Photo",
] as const;

export type VehicleDocumentType = (typeof VEHICLE_DOCUMENT_TYPES)[number];

export const VEHICLE_DOCS_BUCKET = "vehicle-documents";
export const VEHICLE_PHOTOS_BUCKET = "vehicle-photos";
export const VEHICLE_PHOTO_TYPE = "Vehicle Photo" as const;
