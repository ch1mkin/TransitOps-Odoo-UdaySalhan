import type { Role } from "@/constants/roles";
import { ROLES } from "@/constants/roles";
import type { Driver, Trip, Vehicle } from "@/types/entities";

/** Demo accounts — register these in the app to test each role */
export const MOCK_DEMO_ACCOUNTS: {
  serial: number;
  role: Role;
  full_name: string;
  email: string;
  password_hint: string;
}[] = [
  {
    serial: 1,
    role: ROLES.FLEET_MANAGER,
    full_name: "Uday Salhan",
    email: "fleet.manager@transitops.demo",
    password_hint: "TransitOps1!",
  },
  {
    serial: 2,
    role: ROLES.DISPATCHER,
    full_name: "Priya Sharma",
    email: "dispatcher@transitops.demo",
    password_hint: "TransitOps1!",
  },
  {
    serial: 3,
    role: ROLES.SAFETY_OFFICER,
    full_name: "Arjun Mehta",
    email: "safety@transitops.demo",
    password_hint: "TransitOps1!",
  },
  {
    serial: 4,
    role: ROLES.FINANCIAL_ANALYST,
    full_name: "Neha Gupta",
    email: "finance@transitops.demo",
    password_hint: "TransitOps1!",
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: "1", registration_number: "MH-12-AB-1234", vehicle_name: "Fleet Hauler 01", vehicle_model: "Tata Prima 5530", vehicle_type: "Heavy Truck", max_load_capacity: 25000, odometer: 84200, status: "Available", acquisition_cost: 2850000, purchase_date: "2022-03-15" },
  { id: "2", registration_number: "DL-01-CD-5678", vehicle_name: "City Runner", vehicle_model: "Ashok Leyland 4218", vehicle_type: "Medium Truck", max_load_capacity: 16000, odometer: 52100, status: "On Trip", acquisition_cost: 2100000, purchase_date: "2021-08-22" },
  { id: "3", registration_number: "KA-05-EF-9012", vehicle_name: "South Express", vehicle_model: "Mahindra Blazo X", vehicle_type: "Heavy Truck", max_load_capacity: 22000, odometer: 118400, status: "In Shop", acquisition_cost: 2650000, purchase_date: "2020-11-10" },
  { id: "4", registration_number: "GJ-27-GH-3344", vehicle_name: "Gujarat Carrier", vehicle_model: "Eicher Pro 6035", vehicle_type: "Medium Truck", max_load_capacity: 18000, odometer: 67300, status: "Available", acquisition_cost: 1950000, purchase_date: "2023-01-05" },
  { id: "5", registration_number: "TN-09-IJ-7788", vehicle_name: "Southern Haul", vehicle_model: "Tata LPT 4225", vehicle_type: "Heavy Truck", max_load_capacity: 24000, odometer: 29100, status: "Retired", acquisition_cost: 1780000, purchase_date: "2018-06-18" },
  { id: "6", registration_number: "RJ-14-KL-5566", vehicle_name: "Desert Runner", vehicle_model: "BharatBenz 5528", vehicle_type: "Heavy Truck", max_load_capacity: 26000, odometer: 44500, status: "Available", acquisition_cost: 3100000, purchase_date: "2023-06-12" },
  { id: "7", registration_number: "UP-32-MN-8899", vehicle_name: "North Star", vehicle_model: "Volvo FM 460", vehicle_type: "Heavy Truck", max_load_capacity: 28000, odometer: 91200, status: "On Trip", acquisition_cost: 4200000, purchase_date: "2021-02-28" },
  { id: "8", registration_number: "WB-19-OP-2233", vehicle_name: "Eastern Freight", vehicle_model: "Tata Signa 4018", vehicle_type: "Medium Truck", max_load_capacity: 17000, odometer: 38700, status: "Available", acquisition_cost: 2050000, purchase_date: "2024-01-20" },
  { id: "9", registration_number: "PB-03-QR-6677", vehicle_name: "Punjab Express", vehicle_model: "Ashok Leyland Boss", vehicle_type: "Light Truck", max_load_capacity: 12000, odometer: 22400, status: "In Shop", acquisition_cost: 1450000, purchase_date: "2024-08-05" },
  { id: "10", registration_number: "HR-26-ST-9900", vehicle_name: "Highway King", vehicle_model: "Mahindra Furio 12", vehicle_type: "Medium Truck", max_load_capacity: 15500, odometer: 15600, status: "Available", acquisition_cost: 1880000, purchase_date: "2025-02-14" },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "1", name: "Rajesh Kumar", license_number: "MH-2020-884521", license_category: "HMV", license_expiry: "2027-04-12", phone: "+91 98765 43210", email: "rajesh.kumar@transitops.in", safety_score: 92, status: "On Trip" },
  { id: "2", name: "Amit Singh", license_number: "DL-2019-772103", license_category: "HMV", license_expiry: "2026-09-30", phone: "+91 98112 33445", email: "amit.singh@transitops.in", safety_score: 88, status: "Available" },
  { id: "3", name: "Suresh Patel", license_number: "GJ-2021-551902", license_category: "HMV", license_expiry: "2028-02-18", phone: "+91 99088 77665", email: "suresh.patel@transitops.in", safety_score: 95, status: "Available" },
  { id: "4", name: "Vikram Reddy", license_number: "KA-2018-339014", license_category: "HMV", license_expiry: "2025-12-01", phone: "+91 98450 11223", email: "vikram.reddy@transitops.in", safety_score: 76, status: "Suspended" },
  { id: "5", name: "Mohammed Irfan", license_number: "TS-2022-441287", license_category: "HMV", license_expiry: "2029-01-15", phone: "+91 97001 55667", email: "irfan.m@transitops.in", safety_score: 91, status: "On Trip" },
  { id: "6", name: "Deepak Joshi", license_number: "RJ-2020-118903", license_category: "HMV", license_expiry: "2027-08-22", phone: "+91 98291 77884", email: "deepak.j@transitops.in", safety_score: 84, status: "Off Duty" },
  { id: "7", name: "Karan Malhotra", license_number: "PB-2023-667120", license_category: "LMV", license_expiry: "2028-11-30", phone: "+91 98780 33441", email: "karan.m@transitops.in", safety_score: 89, status: "Available" },
  { id: "8", name: "Sanjay Nair", license_number: "KL-2017-902341", license_category: "HMV", license_expiry: "2026-03-08", phone: "+91 98470 22110", email: "sanjay.n@transitops.in", safety_score: 72, status: "Available" },
];

export const MOCK_TRIPS: Trip[] = [
  { id: "1042", trip_number: "TR-1042", source: "Mumbai", destination: "Pune", vehicle_id: "2", driver_id: "1", cargo_weight: 14500, planned_distance: 148, status: "Dispatched", dispatch_time: "2026-07-12T06:30:00" },
  { id: "1043", trip_number: "TR-1043", source: "Delhi", destination: "Jaipur", vehicle_id: "1", driver_id: "2", cargo_weight: 18200, planned_distance: 280, status: "Draft", dispatch_time: null },
  { id: "1044", trip_number: "TR-1044", source: "Bangalore", destination: "Chennai", vehicle_id: "4", driver_id: "3", cargo_weight: 12000, planned_distance: 346, status: "Completed", dispatch_time: "2026-07-10T04:00:00" },
  { id: "1045", trip_number: "TR-1045", source: "Ahmedabad", destination: "Surat", vehicle_id: "1", driver_id: "2", cargo_weight: 9800, planned_distance: 265, status: "Cancelled", dispatch_time: null },
  { id: "1046", trip_number: "TR-1046", source: "Hyderabad", destination: "Vijayawada", vehicle_id: "7", driver_id: "5", cargo_weight: 21000, planned_distance: 275, status: "Dispatched", dispatch_time: "2026-07-12T05:00:00" },
  { id: "1047", trip_number: "TR-1047", source: "Kolkata", destination: "Bhubaneswar", vehicle_id: "8", driver_id: "8", cargo_weight: 11500, planned_distance: 440, status: "Draft", dispatch_time: null },
  { id: "1048", trip_number: "TR-1048", source: "Chandigarh", destination: "Ludhiana", vehicle_id: "6", driver_id: "7", cargo_weight: 8900, planned_distance: 95, status: "Completed", dispatch_time: "2026-07-09T07:00:00" },
  { id: "1049", trip_number: "TR-1049", source: "Indore", destination: "Bhopal", vehicle_id: "10", driver_id: "3", cargo_weight: 7600, planned_distance: 195, status: "Dispatched", dispatch_time: "2026-07-11T18:00:00" },
  { id: "1050", trip_number: "TR-1050", source: "Nagpur", destination: "Raipur", vehicle_id: "2", driver_id: "6", cargo_weight: 13200, planned_distance: 280, status: "Cancelled", dispatch_time: null },
  { id: "1051", trip_number: "TR-1051", source: "Lucknow", destination: "Kanpur", vehicle_id: "4", driver_id: "2", cargo_weight: 10500, planned_distance: 90, status: "Completed", dispatch_time: "2026-07-08T09:30:00" },
];

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  cost: number;
  service_center: string;
  status: string;
  opened_at: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  liters: number;
  cost: number;
  odometer: number;
  date: string;
}

export interface ExpenseLog {
  id: string;
  vehicle_id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export const MOCK_MAINTENANCE: MaintenanceLog[] = [
  { id: "1", vehicle_id: "3", maintenance_type: "Engine Service", description: "Full engine overhaul and oil change", cost: 42000, service_center: "Tata Authorised · Bangalore", status: "In Progress", opened_at: "2026-07-08" },
  { id: "2", vehicle_id: "1", maintenance_type: "Tyre Replacement", description: "6 tyres replaced — MRF ZLX", cost: 28500, service_center: "MRF Fitment · Pune", status: "Completed", opened_at: "2026-06-22" },
  { id: "3", vehicle_id: "9", maintenance_type: "Brake Service", description: "Brake pad and drum inspection", cost: 12400, service_center: "Ashok Leyland · Chandigarh", status: "In Progress", opened_at: "2026-07-10" },
  { id: "4", vehicle_id: "7", maintenance_type: "AC Repair", description: "Cabin AC compressor replaced", cost: 18600, service_center: "Volvo Care · Delhi", status: "Completed", opened_at: "2026-06-15" },
  { id: "5", vehicle_id: "5", maintenance_type: "Decommission", description: "Final inspection before retirement", cost: 5200, service_center: "In-house Workshop", status: "Completed", opened_at: "2026-05-01" },
];

export const MOCK_FUEL: FuelLog[] = [
  { id: "1", vehicle_id: "2", liters: 180, cost: 16200, odometer: 51980, date: "2026-07-11" },
  { id: "2", vehicle_id: "1", liters: 220, cost: 19800, odometer: 84010, date: "2026-07-09" },
  { id: "3", vehicle_id: "4", liters: 150, cost: 13500, odometer: 67120, date: "2026-07-07" },
  { id: "4", vehicle_id: "7", liters: 260, cost: 23400, odometer: 90950, date: "2026-07-11" },
  { id: "5", vehicle_id: "6", liters: 200, cost: 18000, odometer: 44200, date: "2026-07-08" },
  { id: "6", vehicle_id: "8", liters: 140, cost: 12600, odometer: 38550, date: "2026-07-06" },
  { id: "7", vehicle_id: "10", liters: 120, cost: 10800, odometer: 15400, date: "2026-07-10" },
];

export const MOCK_EXPENSES: ExpenseLog[] = [
  { id: "1", vehicle_id: "2", category: "Tolls", amount: 2400, description: "Mumbai–Pune highway tolls", date: "2026-07-11" },
  { id: "2", vehicle_id: "3", category: "Repairs", amount: 8500, description: "Brake pad replacement", date: "2026-07-08" },
  { id: "3", vehicle_id: "1", category: "Permits", amount: 12000, description: "Interstate permit renewal", date: "2026-07-05" },
  { id: "4", vehicle_id: "7", category: "Tolls", amount: 4800, description: "Delhi–Jaipur expressway", date: "2026-07-10" },
  { id: "5", vehicle_id: "4", category: "Parking", amount: 1200, description: "Warehouse yard parking — 3 days", date: "2026-07-09" },
  { id: "6", vehicle_id: "6", category: "Fines", amount: 2000, description: "Overweight checkpoint fine", date: "2026-07-04" },
  { id: "7", vehicle_id: "8", category: "Loading", amount: 3500, description: "Crane loading charges", date: "2026-07-07" },
];

export function getVehicleById(id: string) {
  return MOCK_VEHICLES.find((v) => v.id === id);
}

export function getDriverById(id: string) {
  return MOCK_DRIVERS.find((d) => d.id === id);
}

export function getTripById(id: string) {
  return MOCK_TRIPS.find((t) => t.id === id);
}

export function getVehicleLabel(id: string) {
  return getVehicleById(id)?.registration_number ?? "—";
}

export function getDriverLabel(id: string) {
  return getDriverById(id)?.name ?? "—";
}
