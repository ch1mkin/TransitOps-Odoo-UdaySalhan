import { FleetDataError } from "@/components/data/fleet-data-error";
import { ExpensesModule } from "@/features/expenses/components/expenses-module";
import { canManageExpenses } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getExpenses, getFleetLabels, getVehicles } from "@/lib/fleet/queries";

export default async function ExpensesPage() {
  const role = await getPageRole();
  const [recordsResult, labelsResult, vehiclesResult] = await Promise.all([
    getExpenses(),
    getFleetLabels(),
    getVehicles(),
  ]);

  if (recordsResult.error || !recordsResult.data) {
    return (
      <FleetDataError message={recordsResult.error ?? "Run migration 007_ops_tables.sql"} />
    );
  }

  if (labelsResult.error || !labelsResult.data) {
    return <FleetDataError message={labelsResult.error ?? "Unknown error"} />;
  }

  if (vehiclesResult.error || !vehiclesResult.data) {
    return <FleetDataError message={vehiclesResult.error ?? "Unknown error"} />;
  }

  return (
    <ExpensesModule
      records={recordsResult.data}
      vehicles={vehiclesResult.data}
      vehicleLabels={labelsResult.data.vehicles}
      canManage={canManageExpenses(role)}
    />
  );
}
