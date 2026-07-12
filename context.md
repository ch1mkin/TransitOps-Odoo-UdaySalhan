# TransitOps — Cursor AI Context

## Project Overview

**Project Name:** TransitOps  
**Tagline:** Smart Transport Operations Platform

TransitOps is a modern fleet and transport operations management platform built for logistics companies to replace spreadsheets and manual logbooks with a centralized, intelligent system.

The platform manages the complete lifecycle of transport operations including:

- Fleet Management
- Driver Management
- Trip Dispatch
- Vehicle Maintenance
- Fuel Tracking
- Expense Management
- Reports & Analytics

The primary goal is operational efficiency while enforcing strict business rules automatically.

---

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui
- Lucide Icons
- React Hook Form
- Zod Validation
- TanStack Table
- Recharts
- Framer Motion (minimal animations)

### Backend

- Supabase
  - PostgreSQL
  - Supabase Auth
  - Row Level Security
  - Storage (Vehicle documents)
  - Edge Functions (future email reminders)

### State Management

- Zustand

### Data Fetching

- TanStack Query (React Query)

### Forms

- React Hook Form + Zod

### Charts

- Recharts

### Notifications

- Sonner Toast

### Authentication

- Supabase Auth (Email + Password)
- Role Based Access Control

---

## Design Philosophy

This is **NOT** an ERP.

It should feel like:

- Linear
- Stripe Dashboard
- Vercel
- Notion
- Ramp
- Brex

Avoid:

- Clutter
- Bright colors
- Unnecessary gradients
- Oversized cards
- Corporate blue dashboards

Instead:

- Whitespace
- Typography
- Clean borders
- Subtle shadows
- Rounded-xl cards
- Muted colors
- Professional

The application should be usable inside a logistics company for 8+ hours every day.

---

## Color Palette

| Token | Value |
|-------|-------|
| Background (Light) | `#FAFAFA` |
| Background (Dark) | `#0A0A0A` |
| Primary | `#111827` |
| Accent | `#2563EB` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |
| Border | `#E5E7EB` |
| Muted | `#6B7280` |
| Cards | White |
| Radius | 16px |
| Shadow | Very subtle |

No glassmorphism. No neumorphism.

---

## Typography

Use **Inter**.

Hierarchy:

- Dashboard titles
- Section headings
- Card labels
- Muted captions

Everything should look enterprise-grade.

---

## General UI Rules

Every page must have:

- Header
- Title
- Description
- Primary Action Button
- Search
- Filters (where applicable)
- Table
- Pagination
- Loading Skeleton
- Empty State
- Error State
- Confirmation Dialogs
- Success Toast

---

## Sidebar

- Dashboard
- Fleet
  - Vehicles
- Drivers
- Trips
- Maintenance
- Fuel Logs
- Expenses
- Reports
- Settings
- Profile
- Logout

---

## Roles

### Fleet Manager

**Permissions:**

- Manage Vehicles
- Manage Maintenance
- Dashboard
- Reports
- Expenses
- Fuel Logs

**Cannot:**

- Manage Users

### Dispatcher

**Permissions:**

- Create Trips
- Dispatch Trips
- Complete Trips
- Cancel Trips

**Can View:**

- Vehicles
- Drivers

**Cannot:**

- Delete Vehicles

### Safety Officer

**Permissions:**

- Drivers
- License Monitoring
- Safety Scores

**Read Only:**

- Trips

### Financial Analyst

**Permissions:**

- Fuel
- Expenses
- Reports
- Analytics

**Read Only:**

- Vehicles
- Drivers
- Trips

---

## Authentication Flow

```
Login
  ↓
Fetch Profile
  ↓
Get Role
  ↓
Load Dashboard
  ↓
Protect Routes
```

Unauthenticated users must never access any page.

---

## Registration Flow

### Authentication

TransitOps uses Supabase Authentication with Email and Password.

The application has a **single Authentication page** that supports both **Login** and **Register**.

#### Login

Users provide:

- Email
- Password

After successful authentication, the system fetches the user's assigned role from the database and redirects them to the appropriate dashboard.

#### Registration

During registration, the user must provide:

- Full Name
- Email
- Password
- Confirm Password
- Role (Required)

The **Role** field is a dropdown and is mandatory.

Available roles:

- Fleet Manager
- Dispatcher
- Safety Officer
- Financial Analyst

The selected role is stored in the user's profile during account creation.

**Example Flow:**

```
Register → Select Role → Create Supabase Auth User → Create Profile Record → Redirect to Dashboard
```

### Profiles Table

The `profiles` table should contain:

| Column | Type |
|--------|------|
| id | UUID (references `auth.users.id`) |
| full_name | text |
| email | text |
| role | text |
| created_at | timestamp |
| updated_at | timestamp |

The role is one of:

- `fleet_manager`
- `dispatcher`
- `safety_officer`
- `financial_analyst`

### RBAC

Every authenticated request must verify the user's role before allowing access.

UI elements, routes, and API actions should be permission-aware.

Users should only see navigation items and actions that are permitted for their role.

### Auth UI Requirements

The authentication page should be clean and modern with:

- One combined Login/Register card
- Toggle between **Sign In** and **Create Account**
- A role dropdown that appears **only during registration**
- Client-side validation using React Hook Form + Zod
- Password visibility toggle
- Loading states
- Inline validation errors
- Success and error toast notifications

The authentication experience should feel similar to Linear, Vercel, or Notion—minimal, fast, and professional.

---

## Database

### Tables

- `users`
- `roles`
- `profiles`
- `vehicles`
- `drivers`
- `trips`
- `maintenance_logs`
- `fuel_logs`
- `expenses`
- `trip_updates`
- `vehicle_documents`
- `notifications`

### Vehicle Schema

| Field | Notes |
|-------|-------|
| id | UUID |
| registration_number | unique |
| vehicle_name | |
| vehicle_model | |
| vehicle_type | |
| max_load_capacity | |
| odometer | |
| acquisition_cost | |
| status | |
| purchase_date | |
| created_at | |
| updated_at | |

**Allowed Status:** Available, On Trip, In Shop, Retired

### Driver Schema

| Field | Notes |
|-------|-------|
| id | UUID |
| name | |
| license_number | |
| license_category | |
| license_expiry | |
| phone | |
| email | |
| safety_score | |
| status | |
| created_at | |
| updated_at | |

**Allowed Status:** Available, On Trip, Off Duty, Suspended

### Trip Schema

| Field | Notes |
|-------|-------|
| id | UUID |
| trip_number | |
| source | |
| destination | |
| vehicle_id | FK |
| driver_id | FK |
| cargo_weight | |
| planned_distance | |
| actual_distance | |
| fuel_used | |
| revenue | |
| status | |
| dispatch_time | |
| completion_time | |
| created_at | |
| updated_at | |

**Lifecycle:**

```
Draft → Dispatched → Completed
                  ↘ Cancelled
```

### Maintenance Schema

| Field | Notes |
|-------|-------|
| vehicle_id | FK |
| maintenance_type | |
| description | |
| cost | |
| service_center | |
| status | |
| opened_at | |
| closed_at | |

### Fuel Logs

| Field | Notes |
|-------|-------|
| vehicle_id | FK |
| trip_id | FK (optional) |
| liters | |
| cost | |
| date | |
| odometer | |

### Expenses

| Field | Notes |
|-------|-------|
| vehicle_id | FK |
| trip_id | FK (optional) |
| category | |
| amount | |
| description | |
| date | |

---

## Business Rules

These are **NON NEGOTIABLE**. Always enforce server-side.

1. **Vehicle Registration Number** — Must be unique.

2. **Retired vehicles** — Cannot appear in dispatch.

3. **Vehicles in shop** — Cannot appear in dispatch.

4. **Expired license** — Cannot assign driver.

5. **Suspended driver** — Cannot assign.

6. **Driver already On Trip** — Cannot assign.

7. **Vehicle already On Trip** — Cannot assign.

8. **Cargo Weight** — Must be ≤ vehicle max capacity.

9. **Dispatch Trip** — Automatically:
   - Vehicle: Available → On Trip
   - Driver: Available → On Trip

10. **Complete Trip** — Automatically:
    - Vehicle → Available
    - Driver → Available

11. **Cancel Trip** — Restore:
    - Vehicle → Available
    - Driver → Available

12. **Create Maintenance** — Vehicle → In Shop

13. **Close Maintenance** — Vehicle → Available (unless Retired)

---

## Dashboard KPIs

- Active Vehicles
- Available Vehicles
- Vehicles In Shop
- Retired Vehicles
- Drivers On Duty
- Drivers On Trip
- Pending Trips
- Active Trips
- Completed Trips
- Fleet Utilization %
- Average Fuel Efficiency
- Operational Cost
- Monthly Expenses
- Vehicle ROI
- Maintenance Cost
- Fuel Cost

---

## Reports

- Fleet Utilization
- Fuel Efficiency
- Vehicle ROI
- Maintenance Trends
- Fuel Trends
- Monthly Operational Cost
- Trips by Region
- Vehicle Usage
- Top Performing Drivers
- License Expiry
- Safety Score Distribution

---

## Analytics

| Chart Type | Use Case |
|------------|----------|
| Line Chart | Fuel Consumption |
| Area Chart | Expenses |
| Bar Chart | Trips |
| Pie Chart | Vehicle Status |
| Heatmap | Maintenance Frequency |

---

## Filters

- Vehicle Type
- Vehicle Status
- Driver Status
- Trip Status
- Region
- Date Range
- Search

---

## Table Features

- Sorting
- Filtering
- Pagination
- Column Visibility
- CSV Export
- Bulk Actions
- Sticky Headers

---

## UX Guidelines

| Action | Requirement |
|--------|-------------|
| Destructive action | Confirmation Modal |
| API call | Loading State |
| Empty dataset | Beautiful Empty Illustration |
| Save | Toast |
| Validation | Inline Error |

Never reload the page after CRUD. Everything should update optimistically.

---

## Folder Structure

```
app/
components/
features/
  dashboard/
  vehicles/
  drivers/
  trips/
  maintenance/
  fuel/
  expenses/
  reports/
  settings/
lib/
hooks/
services/
actions/
types/
utils/
schemas/
constants/
store/
supabase/
middleware.ts
```

---

## Architecture

Follow **Feature Based Architecture**.

Each feature contains:

```
components/
actions/
hooks/
schemas/
types/
services/
```

---

## Code Standards

Always use:

- TypeScript
- Server Components where possible
- Server Actions
- Optimistic UI
- Reusable Components

Never duplicate code. Use clean architecture.

- Keep components under 250 lines
- Extract logic into hooks
- Extract database logic into services

---

## Performance

- Server Components
- Suspense
- Streaming
- Lazy loading
- Memoization
- Pagination
- Database indexing

---

## Accessibility

- Keyboard navigation
- Proper aria labels
- Focus states
- Color contrast
- Screen reader support

---

## Future Features

- GPS Tracking
- Live Vehicle Location
- Route Optimization
- Driver Mobile App
- Push Notifications
- Predictive Maintenance
- AI Fuel Consumption Prediction
- Document OCR
- Incident Reporting
- Geofencing
- IoT Integration

---

## Cursor Instructions

When generating code:

- Always use TypeScript
- Use App Router
- Use shadcn/ui components
- Prefer Server Components
- Use Supabase Server Client
- Use React Query for client fetching
- Validate using Zod
- Keep components reusable
- Follow enterprise naming conventions
- Never hardcode values
- Use enums where possible
- Create reusable dialogs, tables, forms, and cards
- Follow SOLID principles
- Always separate UI, business logic, and database logic
- Make every module production-ready
- Ensure all business rules are enforced on both the frontend and backend
- Prefer scalable architecture over quick implementations
- Generate code with maintainability as the highest priority

---

## Workspace UI (Software Shell)

TransitOps uses a **Linked Workspace** desktop-style shell — not a traditional website layout.

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Linked Workspace Header | `components/workspace/linked-workspace-header.tsx` | Dark bar showing connected workspace context |
| Tab Bar | `components/workspace/workspace-tab-bar.tsx` | Chrome-like draggable tabs inside the app |
| Sidebar | `components/workspace/workspace-sidebar.tsx` | Collapsible navigation, role-aware |
| Module Panels | `components/workspace/module-panel.tsx` | Slide-in collapsible panels (profile, filters, forms) |
| Pop-out Windows | `components/workspace/popout-window.tsx` | Floating sub-windows detached from tabs |
| Workspace Chrome | `components/workspace/workspace-chrome.tsx` | Main shell wrapper |
| Workspace Store | `store/workspace-store.ts` | Zustand state for tabs, modules, popouts |

### Behavior Rules

1. **Home tab** is pinned and cannot be closed or dragged.
2. **Entity tabs** open when clicking vehicles, trips, drivers, etc.
3. **Tabs are draggable** to reorder (via `@dnd-kit`).
4. **Double-click a tab** to pop it out into a floating sub-window.
5. **Pop-out windows** can be dragged, minimized, docked back, or closed.
6. **Module panels** (profile, filters) slide in from the right and are collapsible.
7. **Ephemeral modules** auto-close when the user navigates to another page.
8. **Sidebar** collapses to icon-only mode.

### Hooks

- `useWorkspaceNavigation()` — syncs route changes with workspace state
- `useOpenWorkspaceTab()` — open entity/route tabs programmatically
- `useOpenModule()` — open collapsible module panels

---

## Project Vision

TransitOps should feel like a modern SaaS product used by enterprise logistics companies—not a student project. Every screen should prioritize speed, clarity, and operational efficiency. The codebase should be modular, scalable, and ready for future expansion into GPS tracking, AI-powered fleet insights, and mobile applications.
