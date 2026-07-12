import { ABOUT } from "@/constants/about";

export const MARKETING = {
  tagline: ABOUT.subtitle,
  intro: ABOUT.solution.summary,
  workflow: ABOUT.solution.points.slice(0, 3).map((detail, index) => ({
    step: `0${index + 1}`,
    title: ["Centralize fleet data", "Dispatch with rules", "Stay compliant"][index],
    detail,
  })),
  modules: [
    { name: "Vehicles", detail: "Profiles, documents, maintenance, odometer" },
    { name: "Drivers", detail: "Licenses, documents, self-registration, approvals" },
    { name: "Trips", detail: "Planning, dispatch rules, tracking, completion" },
    { name: "Operations", detail: "Fuel, expenses, alerts, ROI reporting" },
  ],
  roles: [
    "Fleet Manager — vehicles, maintenance, documents",
    "Dispatcher — trip creation and dispatch",
    "Safety Officer — drivers, compliance, registration review",
    "Financial Analyst — fuel, expenses, ROI reports",
  ],
  securityNote:
    "Sign-in uses email OTP verification. Each role only sees the modules relevant to their work.",
} as const;
