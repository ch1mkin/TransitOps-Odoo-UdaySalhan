import { PlaceholderPage } from "@/components/workspace/placeholder-page";

export default function VehiclesPage() {
  return (
    <PlaceholderPage
      title="Vehicles"
      description="Manage your fleet — click a vehicle to open it in a workspace tab"
      demoEntities={[
        { id: "1", title: "MH-12-AB-1234", href: "/vehicles/1", type: "vehicle" },
        { id: "2", title: "DL-01-CD-5678", href: "/vehicles/2", type: "vehicle" },
        { id: "3", title: "KA-05-EF-9012", href: "/vehicles/3", type: "vehicle" },
      ]}
    />
  );
}
