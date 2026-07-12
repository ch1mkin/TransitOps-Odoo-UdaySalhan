"use client";

import { useState } from "react";
import { Download, FileImage } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getDriverDocumentUrl } from "@/lib/fleet/driver-document-actions";
import type { DriverDocument } from "@/types/entities";

interface DriverDocumentsPanelProps {
  documents: DriverDocument[];
}

export function DriverDocumentsPanel({ documents }: DriverDocumentsPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        No identity documents uploaded for this driver yet.
      </div>
    );
  }

  const handleDownload = async (document: DriverDocument) => {
    setLoadingId(document.id);
    const result = await getDriverDocumentUrl(document.storage_path);
    setLoadingId(null);

    if (!result.url) {
      toast.error(result.error ?? "Could not open document.");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Identity documents</h3>
        <p className="text-xs text-muted-foreground">
          Driving license and Aadhaar proofs uploaded during onboarding.
        </p>
      </div>
      <div className="divide-y divide-border">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <FileImage className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{document.document_type}</p>
                <p className="truncate text-xs text-muted-foreground">{document.file_name}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingId === document.id}
              onClick={() => void handleDownload(document)}
            >
              <Download className="size-4" />
              {loadingId === document.id ? "Opening…" : "View"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
