"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  cropImageToSquare,
  applyDocumentWatermark,
  type CropTransform,
} from "@/lib/utils/document-image";

interface DocumentCropDialogProps {
  open: boolean;
  source: Blob | null;
  documentType: string;
  onCancel: () => void;
  onComplete: (blob: Blob, transform: CropTransform) => void;
}

export function DocumentCropDialog({
  open,
  source,
  documentType,
  onCancel,
  onComplete,
}: DocumentCropDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [processing, setProcessing] = useState(false);
  const dragRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    if (!source) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(source);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [source]);

  useEffect(() => {
    if (!source || !open) {
      setProcessedPreviewUrl(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const transform = { scale, offsetX, offsetY };
        const cropped = await cropImageToSquare(source, transform, 480);
        const watermarked = await applyDocumentWatermark(cropped);
        const url = URL.createObjectURL(watermarked);
        setProcessedPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return url;
        });
      } catch {
        setProcessedPreviewUrl(null);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [source, open, scale, offsetX, offsetY]);

  useEffect(() => {
    return () => {
      if (processedPreviewUrl) URL.revokeObjectURL(processedPreviewUrl);
    };
  }, [processedPreviewUrl]);

  const handleConfirm = async () => {
    if (!source) return;
    setProcessing(true);
    try {
      const transform = { scale, offsetX, offsetY };
      const cropped = await cropImageToSquare(source, transform, 1024);
      const watermarked = await applyDocumentWatermark(cropped);
      onComplete(watermarked, transform);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      title="Crop identity document"
      description={`Adjust the square crop for ${documentType}. A light TransitOps watermark will be applied.`}
      className="w-[min(100%,40rem)]"
    >
      <div className="space-y-4">
        <div
          className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-muted"
          onPointerDown={(event) => {
            dragRef.current = { x: event.clientX, y: event.clientY, active: true };
          }}
          onPointerMove={(event) => {
            if (!dragRef.current.active) return;
            const dx = event.clientX - dragRef.current.x;
            const dy = event.clientY - dragRef.current.y;
            dragRef.current = { x: event.clientX, y: event.clientY, active: true };
            setOffsetX((value) => value + dx * 0.4);
            setOffsetY((value) => value + dy * 0.4);
          }}
          onPointerUp={() => {
            dragRef.current.active = false;
          }}
          onPointerLeave={() => {
            dragRef.current.active = false;
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Document preview"
              className="size-full object-cover"
              style={{
                transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
              }}
              draggable={false}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-primary/80" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setScale((value) => Math.max(1, value - 0.1))}
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="w-16 text-center text-xs text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setScale((value) => Math.min(2.5, value + 0.1))}
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>

        {processedPreviewUrl ? (
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Final preview</p>
            <img
              src={processedPreviewUrl}
              alt="Processed document preview"
              className="mx-auto aspect-square w-full max-w-[220px] rounded-lg border border-border object-cover"
            />
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={processing || !source}>
            {processing ? "Processing…" : "Use this document"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
