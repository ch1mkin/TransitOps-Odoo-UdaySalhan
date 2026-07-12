export const ABOUT = {
  builder: "Uday Salhan",
  event: "Odoo Hackathon 2026",
  theme: "Smart Transport Operations Platform",
  product: "TransitOps",
  subtitle: "A hackathon project exploring fleet operations software for transport teams",
  problem: {
    title: "The problem",
    summary:
      "Many transport operators still run day-to-day work across spreadsheets, phone calls, and paper records. That makes it hard to answer basic questions in real time.",
    points: [
      "Vehicle, driver, and trip data live in different places with no shared source of truth.",
      "Dispatch decisions are easy to get wrong when license expiry, vehicle status, and load capacity are not checked in one flow.",
      "Driver documents and compliance proofs are painful to collect, especially when drivers are on the road.",
      "Managers, dispatchers, and safety staff need different views, but often share one overloaded inbox or chat thread.",
    ],
  },
  solution: {
    title: "The approach",
    summary:
      "TransitOps is a role-based operations workspace that connects fleet records, trip lifecycle rules, and compliance workflows in a single web app.",
    points: [
      "One workspace for vehicles, drivers, trips, fuel, maintenance, expenses, and reporting.",
      "Trip dispatch enforces availability, capacity, and license checks instead of relying on manual judgment alone.",
      "Safety officers can invite drivers to submit their own details and documents, then approve profiles before assignment.",
      "Document capture supports desktop upload and mobile QR upload for license and identity proofs.",
      "Notifications and license monitoring surface issues before they block operations.",
    ],
  },
  implemented: [
    "Role-based workspace for Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst",
    "Vehicle and driver records with document storage",
    "Trip draft → dispatch → complete flow with business-rule validation",
    "Live trip tracking via shareable link",
    "Fuel, maintenance, and expense logging",
    "License expiry monitoring with in-app and email alerts",
    "Driver self-registration invites with operator approval",
    "Email OTP sign-in, dark mode, and mobile-friendly navigation",
  ],
  stack: "Next.js · Supabase · TypeScript · Tailwind CSS",
} as const;
