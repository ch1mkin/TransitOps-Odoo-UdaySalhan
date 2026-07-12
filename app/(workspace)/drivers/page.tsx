import { PlaceholderPage } from "@/components/workspace/placeholder-page";

export default function DriversPage() {
  return (
    <PlaceholderPage
      title="Drivers"
      description="Driver roster and license monitoring"
      demoEntities={[
        { id: "1", title: "Rajesh Kumar", href: "/drivers/1", type: "driver" },
        { id: "2", title: "Amit Singh", href: "/drivers/2", type: "driver" },
      ]}
    />
  );
}
