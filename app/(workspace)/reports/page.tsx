"use client";

import { ModulePage } from "@/components/data/module-page";

export default function ReportsPage() {
  return (
    <ModulePage
      title="Reports"
      description="Fleet analytics and operational reports — coming next in the hackathon build"
    >
      <div className="px-4 py-16 text-center text-sm text-muted-foreground">
        Report modules will render here in tabular format with export and date-range filters.
      </div>
    </ModulePage>
  );
}
