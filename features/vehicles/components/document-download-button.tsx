"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getVehicleDocumentUrl } from "@/lib/fleet/actions";

interface DocumentDownloadButtonProps {
  fileName: string;
  storagePath?: string | null;
}

export function DocumentDownloadButton({
  fileName,
  storagePath,
}: DocumentDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!storagePath) {
    return <span className="text-muted-foreground">{fileName}</span>;
  }

  const handleDownload = async () => {
    setLoading(true);
    const result = await getVehicleDocumentUrl(storagePath);
    setLoading(false);

    if (!result.url) {
      toast.error(result.error ?? "Could not generate download link.");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      className="h-auto gap-1.5 px-0 text-accent"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        void handleDownload();
      }}
    >
      <Download className="size-3.5" />
      {loading ? "Opening…" : fileName}
    </Button>
  );
}
