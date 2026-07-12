"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data/status-badge";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface EntityDetailModuleProps {
  title: string;
  subtitle: string;
  status?: string;
  fields: DetailField[];
  entityType: string;
  entityId: string;
  href: string;
  compact?: boolean;
  actions?: React.ReactNode;
}

export function EntityDetailModule({
  title,
  subtitle,
  status,
  fields,
  entityType,
  entityId,
  href,
  compact = false,
  actions,
}: EntityDetailModuleProps) {
  const popoutTab = useWorkspaceStore((s) => s.popoutTab);
  const tabs = useWorkspaceStore((s) => s.tabs);

  const currentTab = tabs.find(
    (t) => t.entityId === entityId && t.entityType === entityType
  );

  return (
    <div className={cn("space-y-4", compact && "space-y-3 p-2")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {subtitle}
          </p>
          <h1 className={cn("mt-1 font-semibold tracking-tight", compact ? "text-lg" : "text-2xl")}>
            {title}
          </h1>
          {status && (
            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          )}
        </div>
        {!compact && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions}
            <Link
              href={href.split("/").slice(0, -1).join("/") || "/"}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium hover:bg-muted"
            >
              Back to list
            </Link>
            {currentTab && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => popoutTab(currentTab.id)}
              >
                <ExternalLink className="size-4" />
                Pop out
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card workspace-shadow">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Record Details</h2>
        </div>
        <dl className="divide-y divide-border">
          {fields.map((field, index) => (
            <div
              key={field.label}
              className="grid grid-cols-[48px_140px_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[56px_180px_1fr]"
            >
              <dt className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </dt>
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              <dd className={cn("text-sm font-medium")}>{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function EntityNotFound({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
      <p className="text-lg font-semibold">Record not found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        This {moduleName} record does not exist or was removed.
      </p>
      <Link
        href={`/${moduleName}`}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
      >
        Return to {moduleName} list
      </Link>
    </div>
  );
}
