# TransitOps

**Smart Transport Operations Platform** — Odoo Hackathon 2026

Built by **Uday Salhan**

TransitOps is a role-based fleet operations workspace for transport teams. It replaces scattered spreadsheets, phone calls, and paper records with one web app for vehicles, drivers, trips, compliance, costs, and reporting.

---

## The problem

Transport operators often lack a single source of truth for fleet data. Dispatch decisions can go wrong when license expiry, vehicle status, and load capacity are not checked together. Collecting driver documents from the field is slow, and different staff need different views of the same operation.

## The approach

TransitOps connects fleet records, trip lifecycle rules, and compliance workflows in one workspace. Each role sees the modules relevant to their job, and business rules are enforced when trips are dispatched or completed.

---

## Core modules

### Dashboard
- Fleet KPIs, utilization overview, and operational snapshot
- Role-aware landing view

### Vehicles
- Vehicle registry with registration, model, capacity, odometer, and status
- Vehicle documents with storage and expiry tracking
- Maintenance logs and shop status
- Vehicle photos and proof upload via desktop or mobile QR

### Drivers
- Driver roster with license details, safety scores, and status
- Identity document upload (Driving License / Aadhaar) with crop and watermark
- Mobile QR capture for document proofs
- **Driver self-registration** — operators share an invite link; drivers submit their own profile and documents; operators approve or reject pending registrations
- License expiry monitoring with in-app alerts

### Trips
- Trip draft → dispatch → complete / cancel lifecycle
- Enforced rules: vehicle availability, driver eligibility, cargo capacity, license validity
- Auto-updates vehicle and driver status on dispatch and completion
- Closing odometer capture on trip completion
- **Live GPS tracking** via shareable public link
- Trip activity log and stakeholder notifications

### Fuel & expenses
- Fuel logs tied to vehicles and optional trips
- Expense logging by category with vehicle linkage

### Reports
- Fleet utilization, fuel efficiency, and ROI views
- Role-specific report variants (fleet, safety, financial)
- Export support from data tables

### Notifications
- In-app notification bell and dedicated notifications page
- Automatic alerts for trip events and license compliance
- **Broadcast notifications** — any role can send alerts to selected workspace roles (all roles by default)

### Profile & settings
- Edit display name
- **Change password** with current-password verification and strength rules
- Role-specific workspace preferences
- Demo account reference for testing all four roles

---

## Workspace experience

### Role-based access
| Role | Focus |
|------|--------|
| Fleet Manager | Vehicles, maintenance, documents, fleet reports |
| Dispatcher | Trip planning, dispatch, active/history trips |
| Safety Officer | Drivers, license monitoring, registration approvals |
| Financial Analyst | Fuel, expenses, ROI and financial reports |

### Linked workspace UI
- Browser-style tabs inside the app
- Collapsible module panels and entity detail views
- Pop-out windows for records
- First-time walkthrough for new users

### Mobile-friendly layout
- Bottom navigation bar on small screens
- Hamburger drawer for full module list
- Compact mobile header with notification access

---

## Authentication & security

- Email + password sign-in and registration
- **4-digit email OTP** verification on login and account creation (inline on the auth card)
- Branded transactional email templates (OTP, license reminders, driver registration thanks)
- Password requirements: 8+ characters, uppercase, symbol
- Profile password change without leaving the workspace

---

## Document & upload flows

- Driver and vehicle identity proofs with image crop dialog
- QR-based mobile upload sessions for field capture
- Nested dialog handling so crop does not close parent forms
- Supabase Storage for document files

---

## UI & polish

- Dark mode with top-bar theme toggle
- Bluish ambient background with floating orbs, grid texture, and live particle network
- Glass-style cards and premium gradient auth / landing pages
- Animated truck loader for loading states
- Vibrant SVG brand logo
- Hackathon landing page with honest project roadmap (problem → approach → what was built)
- Chart theming for light and dark modes

---

## Business rules (enforced)

- Retired or in-shop vehicles cannot be dispatched
- Suspended, off-duty, on-trip, or pending-approval drivers cannot be assigned
- Expired driver licenses block trip assignment
- Cargo weight cannot exceed vehicle capacity
- Dispatch and completion automatically sync vehicle and driver status

---

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, Storage, RLS) · TanStack Query · Recharts · Resend (email) · Zustand

---

## Database migrations

Migrations `001`–`014` cover profiles, fleet tables, RLS, documents, upload sessions, trip tracking, notifications, auth OTP codes, and driver self-registration.

---

*TransitOps · Uday Salhan · Odoo Hackathon 2026*
