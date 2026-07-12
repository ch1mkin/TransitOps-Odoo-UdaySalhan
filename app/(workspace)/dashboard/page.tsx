"use client";

import { ExternalLink, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOpenModule, useOpenWorkspaceTab } from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/store/workspace-store";

const DEMO_ENTITIES = [
  { id: "1", title: "MH-12-AB-1234", type: "vehicle", href: "/vehicles/1" },
  { id: "2", title: "Trip #TR-1042", type: "trip", href: "/trips/1042" },
  { id: "3", title: "Rajesh Kumar", type: "driver", href: "/drivers/3" },
];

export default function DashboardPage() {
  const openTab = useOpenWorkspaceTab();
  const openModule = useOpenModule();
  const popoutTab = useWorkspaceStore((s) => s.popoutTab);
  const tabs = useWorkspaceStore((s) => s.tabs);

  const handleOpenEntity = (entity: (typeof DEMO_ENTITIES)[0]) => {
    const tabId = openTab(entity.title, entity.href, {
      type: "entity",
      entityType: entity.type,
      entityId: entity.id,
    });
    return tabId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fleet operations overview — open records in workspace tabs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              openModule("Filters", "filters", "dashboard-filters", {
                ephemeral: true,
              })
            }
          >
            <Filter className="size-4" />
            Filters
          </Button>
          <Button size="sm">
            <Plus className="size-4" />
            New Trip
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Vehicles", value: "24" },
          { label: "Drivers On Trip", value: "8" },
          { label: "Active Trips", value: "12" },
          { label: "Fleet Utilization", value: "78%" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {kpi.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace Demo</CardTitle>
          <CardDescription>
            Click to open tabs · Drag tabs to reorder · Double-click to pop out ·
            Navigate away to close ephemeral panels
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {DEMO_ENTITIES.map((entity) => (
            <Button
              key={entity.id}
              variant="outline"
              size="sm"
              onClick={() => handleOpenEntity(entity)}
            >
              Open {entity.title}
            </Button>
          ))}
          {tabs
            .filter((t) => !t.pinned)
            .map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => popoutTab(tab.id)}
              >
                <ExternalLink className="size-3.5" />
                Pop out {tab.title}
              </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
