import { z } from "zod";
import { ROLES } from "@/constants/roles";

const broadcastRoleValues = [
  ROLES.FLEET_MANAGER,
  ROLES.DISPATCHER,
  ROLES.SAFETY_OFFICER,
  ROLES.FINANCIAL_ANALYST,
] as const;

export const vehicleSchema = z.object({
  registration_number: z.string().min(3, "Registration is required"),
  vehicle_name: z.string().min(2, "Vehicle name is required"),
  vehicle_model: z.string().min(2, "Model is required"),
  vehicle_type: z.enum(["Heavy Truck", "Medium Truck", "Light Truck"]),
  max_load_capacity: z.coerce.number().int().positive("Capacity must be positive"),
  odometer: z.coerce.number().int().min(0),
  acquisition_cost: z.coerce.number().min(0),
  status: z.enum(["Available", "On Trip", "In Shop", "Retired"]),
  purchase_date: z.string().min(1, "Purchase date is required"),
});

export const driverSchema = z.object({
  name: z.string().min(2, "Name is required"),
  license_number: z.string().min(3, "License number is required"),
  license_category: z.enum(["HMV", "LMV"]),
  license_expiry: z.string().min(1, "Expiry date is required"),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Valid email is required"),
  safety_score: z.coerce.number().int().min(0).max(100),
  status: z.enum([
    "Pending Approval",
    "Available",
    "On Trip",
    "Off Duty",
    "Suspended",
  ]),
});

export const driverSelfRegistrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  license_number: z.string().min(3, "License number is required"),
  license_category: z.enum(["HMV", "LMV"]),
  license_expiry: z.string().min(1, "Expiry date is required"),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Valid email is required"),
});

export const tripSchema = z.object({
  trip_number: z.string().min(3, "Trip number is required"),
  source: z.string().min(2, "Source is required"),
  destination: z.string().min(2, "Destination is required"),
  vehicle_id: z.string().uuid("Select a vehicle"),
  driver_id: z.string().uuid("Select a driver"),
  cargo_weight: z.coerce.number().int().positive("Cargo weight is required"),
  planned_distance: z.coerce.number().int().positive("Distance is required"),
  status: z.enum(["Draft", "Dispatched", "Completed", "Cancelled"]),
});

export const maintenanceSchema = z.object({
  vehicle_id: z.string().uuid("Select a vehicle"),
  maintenance_type: z.string().min(2, "Maintenance type is required"),
  description: z.string().min(3, "Description is required"),
  cost: z.coerce.number().min(0),
  service_center: z.string().min(2, "Service center is required"),
  opened_at: z.string().min(1, "Opened date is required"),
});

export const fuelLogSchema = z.object({
  vehicle_id: z.string().uuid("Select a vehicle"),
  trip_id: z.string().uuid().optional().nullable(),
  liters: z.coerce.number().positive("Liters must be positive"),
  cost: z.coerce.number().min(0),
  odometer: z.coerce.number().int().min(0),
  date: z.string().min(1, "Date is required"),
});

export const expenseSchema = z.object({
  vehicle_id: z.string().uuid("Select a vehicle"),
  trip_id: z.string().uuid().optional().nullable(),
  category: z.string().min(2, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

export const vehicleDocumentSchema = z.object({
  vehicle_id: z.string().uuid("Select a vehicle"),
  document_type: z.string().min(2, "Document type is required"),
  file_name: z.string().min(2, "File name is required"),
  storage_path: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const completeTripSchema = z.object({
  actual_distance: z.coerce.number().int().positive("Actual distance is required"),
  fuel_used: z.coerce.number().min(0, "Fuel used must be non-negative"),
  revenue: z.coerce.number().min(0, "Revenue must be non-negative"),
  closing_odometer: z.coerce.number().int().min(0, "Closing odometer is required"),
});

export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type DriverSelfRegistrationInput = z.infer<typeof driverSelfRegistrationSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type FuelLogInput = z.infer<typeof fuelLogSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type VehicleDocumentInput = z.infer<typeof vehicleDocumentSchema>;

export const driverDocumentSchema = z.object({
  driver_id: z.string().uuid("Select a driver"),
  document_type: z.enum(["Driving License", "Aadhaar Card"]),
  file_name: z.string().min(2, "File name is required"),
  storage_path: z.string().min(2, "Storage path is required"),
});

export type DriverDocumentInput = z.infer<typeof driverDocumentSchema>;

export const broadcastNotificationSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  message: z.string().trim().min(2, "Message is required").max(500),
  link: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  roles: z
    .array(z.enum(broadcastRoleValues))
    .min(1, "Select at least one role"),
});

export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;
