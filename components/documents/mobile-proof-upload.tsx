"use client";

import { useState } from "react";
import { Camera, CheckCircle2, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

interface MobileProofUploadProps {
  token: string;
  documentType: string;
  title: string;
  subtitle: string;
  doneMessage: string;
  onUpload: (
    token: string,
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
}

export function MobileProofUpload({
  token,
  documentType,
  title,
  subtitle,
  doneMessage,
  onUpload,
}: MobileProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Choose or capture a photo first.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setUploading(true);
    setError(null);

    const result = await onUpload(token, formData);
    setUploading(false);

    if (!result.success) {
      setError(result.error ?? "Upload failed.");
      return;
    }

    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" size={44} className="rounded-xl" />
          <div>
            <p className="text-sm font-semibold">TransitOps</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="text-lg font-semibold">
            {title} {documentType}
          </h1>
          <p className="text-sm text-muted-foreground">
            Take a clear photo of the document or choose one from your gallery. Return to the
            desktop screen to crop and finish.
          </p>
        </div>

        {done ? (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
            <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
            <p className="mt-2 text-sm font-medium text-emerald-800">Upload received</p>
            <p className="mt-1 text-xs text-emerald-700">{doneMessage}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
              <Camera className="size-8 text-muted-foreground" />
              <span className="mt-3 text-sm font-medium">Tap to capture or choose photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {file ? (
              <p className="text-center text-xs text-muted-foreground">{file.name}</p>
            ) : null}

            {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}

            <Button
              type="button"
              className="w-full"
              disabled={uploading}
              onClick={() => void handleUpload()}
            >
              <Upload className="size-4" />
              {uploading ? "Uploading…" : "Send to desktop"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
