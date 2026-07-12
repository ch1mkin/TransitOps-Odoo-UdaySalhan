"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Camera, Monitor, Smartphone, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DocumentCropDialog } from "@/components/documents/document-crop-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CropTransform } from "@/lib/utils/document-image";
import { cn } from "@/lib/utils";

const QR_SIZE = 160;

export interface PreparedDocumentProof<T extends string = string> {
  file: File;
  documentType: T;
}

export interface DocumentUploadHandlers {
  createSession: (
    documentType: string
  ) => Promise<{ success: boolean; sessionId?: string; token?: string; error?: string }>;
  getSession: (sessionId: string) => Promise<{
    session: { status: string } | null;
    error?: string;
  }>;
  fetchSessionImage: (sessionId: string) => Promise<{
    base64: string | null;
    mimeType: string | null;
    error?: string;
  }>;
  completeSession?: (sessionId: string) => Promise<void>;
}

function base64ToBlob(base64: string, mimeType: string) {
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeType });
}

interface DocumentProofUploadSectionProps<T extends string> {
  title: string;
  description: string;
  documentTypes: readonly T[];
  defaultDocumentType: T;
  uploadPathSegment: string;
  handlers: DocumentUploadHandlers;
  value: PreparedDocumentProof<T> | null;
  onChange: (value: PreparedDocumentProof<T> | null) => void;
  disabled?: boolean;
  readyMessage?: string;
  fileInputId: string;
}

export function DocumentProofUploadSection<T extends string>({
  title,
  description,
  documentTypes,
  defaultDocumentType,
  uploadPathSegment,
  handlers,
  value,
  onChange,
  disabled = false,
  readyMessage = "Document ready — complete the form and save.",
  fileInputId,
}: DocumentProofUploadSectionProps<T>) {
  const [documentType, setDocumentType] = useState<T>(defaultDocumentType);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [mobileStatus, setMobileStatus] = useState("Generate a QR code to upload from your phone.");
  const [cropSource, setCropSource] = useState<Blob | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const sessionStarted = useRef(false);

  const uploadUrl = useMemo(() => {
    if (!uploadToken || typeof window === "undefined") return null;
    return `${window.location.origin}/upload/${uploadPathSegment}/${uploadToken}`;
  }, [uploadPathSegment, uploadToken]);

  useEffect(() => {
    if (!uploadUrl) {
      setQrDataUrl(null);
      return;
    }

    void QRCode.toDataURL(uploadUrl, {
      width: QR_SIZE,
      margin: 1,
      color: { dark: "#0f2744", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [uploadUrl]);

  const startQrSession = async () => {
    const result = await handlers.createSession(documentType);
    if (!result.success || !result.sessionId || !result.token) {
      setMobileStatus(result.error ?? "Could not start mobile upload.");
      return;
    }

    setSessionId(result.sessionId);
    setUploadToken(result.token);
    setMobileStatus("Scan the QR code with your phone camera.");
  };

  useEffect(() => {
    if (sessionStarted.current || disabled) return;
    sessionStarted.current = true;
    void startQrSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  useEffect(() => {
    if (!sessionId || cropOpen || value) return;

    const poll = async () => {
      const result = await handlers.getSession(sessionId);
      if (result.session?.status === "uploaded") {
        const image = await handlers.fetchSessionImage(sessionId);
        if (image.base64 && image.mimeType) {
          setCropSource(base64ToBlob(image.base64, image.mimeType));
          setCropOpen(true);
          setMobileStatus("Photo received from phone — review and crop.");
        }
      } else if (result.session?.status === "expired") {
        setMobileStatus("QR session expired. Tap regenerate to start again.");
      }
    };

    const timer = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [handlers, sessionId, cropOpen, value]);

  const handleDesktopFile = (file: File | null) => {
    if (!file) return;
    setCropSource(file);
    setCropOpen(true);
    setMobileStatus("Review and crop the document.");
  };

  const handleCropComplete = async (blob: Blob, _transform: CropTransform) => {
    const finalFile = new File(
      [blob],
      `${documentType.replace(/\s+/g, "-").toLowerCase()}.jpg`,
      { type: blob.type || "image/jpeg" }
    );
    onChange({ file: finalFile, documentType });
    setCropOpen(false);
    setCropSource(null);
    setMobileStatus(readyMessage);

    if (sessionId && handlers.completeSession) {
      await handlers.completeSession(sessionId);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
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
          const nextType = event.target.value as T;
          setDocumentType(nextType);
          onChange(null);
          void (async () => {
            const result = await handlers.createSession(nextType);
            if (!result.success || !result.sessionId || !result.token) {
              setMobileStatus(result.error ?? "Could not start mobile upload.");
              return;
            }
            setSessionId(result.sessionId);
            setUploadToken(result.token);
            setMobileStatus("Scan the QR code with your phone camera.");
          })();
        }}
        disabled={disabled}
      >
        {documentTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Smartphone className="size-3.5" />
            Scan on phone
          </div>
          <div className="mx-auto mt-4 flex w-full max-w-[180px] flex-col items-center">
            <div
              className="relative flex aspect-square w-full max-w-[160px] items-center justify-center overflow-hidden rounded-lg"
              style={{ maxHeight: QR_SIZE }}
            >
              {qrDataUrl ? (
                <>
                  <img
                    src={qrDataUrl}
                    alt="Upload QR code"
                    className="size-full object-contain"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg bg-white p-1 shadow-sm">
                      <BrandLogo variant="icon" size={32} className="rounded-md" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                  Generating QR…
                </div>
              )}
            </div>
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
            Regenerate QR
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            {mobileStatus}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Monitor className="size-3.5" />
            Upload from desktop
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={fileInputId}>Image file</Label>
              <input
                id={fileInputId}
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
              <div
                className={cn(
                  "rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground"
                )}
              >
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
