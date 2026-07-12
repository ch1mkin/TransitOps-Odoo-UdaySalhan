"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpenWorkspaceTab } from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/store/workspace-store";

interface DemoEntity {
  id: string;
  title: string;
  href: string;
  type: string;
}

interface PlaceholderPageProps {
  title: string;
  description: string;
  demoEntities?: DemoEntity[];
}

export function PlaceholderPage({
  title,
  description,
  demoEntities = [],
}: PlaceholderPageProps) {
  const openTab = useOpenWorkspaceTab();
  const popoutTab = useWorkspaceStore((s) => s.popoutTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {demoEntities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open in workspace tab</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {demoEntities.map((entity) => (
              <div key={entity.id} className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openTab(entity.title, entity.href, {
                      type: "entity",
                      entityType: entity.type,
                      entityId: entity.id,
                    })
                  }
                >
                  {entity.title}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    const tabId = openTab(entity.title, entity.href, {
                      type: "entity",
                      entityType: entity.type,
                      entityId: entity.id,
                    });
                    popoutTab(tabId);
                  }}
                  aria-label={`Pop out ${entity.title}`}
                >
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
