export const MARKETING = {
  tagline: "Fleet operations workspace for transport teams",
  intro:
    "TransitOps keeps vehicles, drivers, trips, fuel, maintenance, and compliance in one place — so dispatchers, safety officers, and managers stop chasing spreadsheets.",
  workflow: [
    {
      step: "01",
      title: "Register assets & people",
      detail: "Add vehicles and drivers, upload license proofs, and monitor expiry dates.",
    },
    {
      step: "02",
      title: "Plan and dispatch trips",
      detail: "Assign available vehicles and drivers with capacity and license checks built in.",
    },
    {
      step: "03",
      title: "Track, close, and report",
      detail: "Follow live trip updates, record fuel and expenses, and review ROI dashboards.",
    },
  ],
  modules: [
    { name: "Vehicles", detail: "Registration, documents, maintenance, odometer" },
    { name: "Drivers", detail: "Licenses, safety scores, self-registration invites" },
    { name: "Trips", detail: "Draft, dispatch, GPS tracking, completion rules" },
    { name: "Operations", detail: "Fuel logs, expenses, license monitoring, alerts" },
  ],
  roles: [
    "Fleet Manager — assets, maintenance, documents",
    "Dispatcher — trip planning and dispatch",
    "Safety Officer — drivers, compliance, approvals",
    "Financial Analyst — fuel, expenses, ROI reports",
  ],
  securityNote:
    "Sign-in uses email verification. Each role sees only the modules relevant to their work.",
} as const;
