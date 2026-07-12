import { PlaceholderPage } from "@/components/workspace/placeholder-page";

export default function TripsPage() {
  return (
    <PlaceholderPage
      title="Trips"
      description="Dispatch and track trips across your fleet"
      demoEntities={[
        { id: "1042", title: "Trip #TR-1042", href: "/trips/1042", type: "trip" },
        { id: "1043", title: "Trip #TR-1043", href: "/trips/1043", type: "trip" },
      ]}
    />
  );
}
