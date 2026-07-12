"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Camera, Monitor, Smartphone, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DocumentCropDialog } from "@/components/drivers/document-crop-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DRIVER_PROOF_TYPES, type DriverProofType } from "@/constants/driver-documents";
import {
  createDriverUploadSession,
  getDriverUploadSession,
} from "@/lib/fleet/driver-document-actions";
import type { CropTransform } from "@/lib/utils/document-image";
import { cn } from "@/lib/utils";

export interface PreparedDriverProof {
  file: File;
  documentType: DriverProofType;
}

interface DriverProofUploadSectionProps {
  value: PreparedDriverProof | null;
  onChange: (value: PreparedDriverProof | null) => void;
  disabled?: boolean;
}

export function DriverProofUploadSection({
  value,
  onChange,
  disabled = false,
}: DriverProofUploadSectionProps) {
  const [documentType, setDocumentType] = useState<DriverProofType>("Driving License");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [mobileStatus, setMobileStatus] = useState<string>("Waiting for phone upload…");
  const [cropSource, setCropSource] = useState<Blob | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const uploadUrl = useMemo(() => {
    if (!uploadToken || typeof window === "undefined") return null;
    return `${window.location.origin}/upload/driver-proof/${uploadToken}`;
  }, [uploadToken]);

  useEffect(() => {
    if (!uploadUrl) {
      setQrDataUrl(null);
      return;
    }

    void QRCode.toDataURL(uploadUrl, {
      width: 220,
      margin: 1,
      color: { dark: "#0f2744", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [uploadUrl]);

  useEffect(() => {
    if (!sessionId || cropOpen || value) return;

    const poll = async () => {
      const result = await getDriverUploadSession(sessionId);
      if (result.session?.status === "uploaded" && result.previewUrl) {
        const response = await fetch(result.previewUrl);
        const blob = await response.blob();
        setCropSource(blob);
        setCropOpen(true);
        setMobileStatus("Photo received from phone — review and crop.");
      } else if (result.session?.status === "expired") {
        setMobileStatus("QR session expired. Start a new session.");
      }
    };

    const timer = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [sessionId, cropOpen, value]);

  const startQrSession = async () => {
    const result = await createDriverUploadSession(documentType);
    if (!result.success || !result.sessionId || !result.token) {
      setMobileStatus("error" in result ? result.error : "Could not start mobile upload.");
      return;
    }

    setSessionId(result.sessionId);
    setUploadToken(result.token);
    setMobileStatus("Scan the QR code with your phone camera.");
  };

  const handleDesktopFile = (file: File | null) => {
    if (!file) return;
    setCropSource(file);
    setCropOpen(true);
    setMobileStatus("Review and crop the document.");
  };

  const handleCropComplete = async (blob: Blob, transform: CropTransform) => {
    const processed = blob;
    const finalFile = new File(
      [processed],
      `${documentType.replace(/\s+/g, "-").toLowerCase()}.jpg`,
      { type: processed.type || "image/jpeg" }
    );
    onChange({ file: finalFile, documentType });
    setCropOpen(false);
    setCropSource(null);
    setMobileStatus("Document ready — complete driver details and save.");
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Identity proof</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a driving license or Aadhaar card. Use QR for phone capture or pick a file on desktop.
          </p>
        </div>
        {value ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Ready
          </span>
        ) : null}
      </div>

      <Select
        label="Document type"
        value={documentType}
        onChange={(event) => {
          setDocumentType(event.target.value as DriverProofType);
          onChange(null);
        }}
        disabled={disabled}
      >
        {DRIVER_PROOF_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Smartphone className="size-3.5" />
            Scan on phone
          </div>
          <div className="relative mx-auto mt-4 flex size-[220px] items-center justify-center">
            {qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="Upload QR code" className="size-[220px] rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-xl bg-white p-1.5 shadow-sm">
                    <BrandLogo variant="icon" size={44} className="rounded-lg" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex size-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                QR will appear here
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            disabled={disabled}
            onClick={() => void startQrSession()}
          >
            <Camera className="size-4" />
            Generate QR
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            {mobileStatus}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Monitor className="size-3.5" />
            Upload from desktop
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="driver-proof-file">Image file</Label>
              <input
                id="driver-proof-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={disabled}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                onChange={(event) => handleDesktopFile(event.target.files?.[0] ?? null)}
              />
            </div>

            {value ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                <p className="font-medium text-emerald-800">{value.documentType}</p>
                <p className="mt-1 text-xs text-emerald-700">{value.file.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 px-2"
                  onClick={() => onChange(null)}
                >
                  Replace document
                </Button>
              </div>
            ) : (
              <div className={cn("rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground")}>
                <Upload className="mb-2 size-4" />
                After upload you&apos;ll crop the document to a square and preview it before saving.
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentCropDialog
        open={cropOpen}
        source={cropSource}
        documentType={documentType}
        onCancel={() => {
          setCropOpen(false);
          setCropSource(null);
        }}
        onComplete={handleCropComplete}
      />
    </div>
  );
}
