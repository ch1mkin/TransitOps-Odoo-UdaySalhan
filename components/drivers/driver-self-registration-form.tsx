"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { TruckLoader, TruckLoaderInline } from "@/components/ui/truck-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DRIVER_PROOF_TYPES } from "@/constants/driver-documents";
import { submitDriverSelfRegistration } from "@/lib/fleet/driver-registration-actions";
import { cn } from "@/lib/utils";

interface DriverSelfRegistrationFormProps {
  token: string;
}

export function DriverSelfRegistrationForm({ token }: DriverSelfRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [documentType, setDocumentType] = useState<"Driving License" | "Aadhaar Card">(
    "Driving License"
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("identity_proof");

    if (!(file instanceof File) || file.size === 0) {
      toast.error("Please upload your driving license or Aadhaar card.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      formData.set("document_type", documentType);
      const result = await submitDriverSelfRegistration(token, formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSubmitted(true);
      toast.success("Your information was submitted successfully.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (submitted) {
    return (
      <div className="auth-page-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="auth-page-glow auth-page-glow-register pointer-events-none absolute inset-0" />
        <Card className="auth-premium-card auth-premium-card-register relative w-full max-w-md border-border/70 bg-card/82 backdrop-blur-xl">
          <CardHeader className="space-y-4 pt-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="size-7" />
            </div>
            <CardTitle className="text-2xl">Thank you</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Your driver information has been submitted. You will receive a confirmation email,
              and the safety team will review your profile shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-page-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4 py-10">
      <div className="auth-page-glow auth-page-glow-register pointer-events-none absolute inset-0" />

      <Card className="auth-premium-card auth-premium-card-register relative w-full max-w-2xl border-border/70 bg-card/82 backdrop-blur-xl">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <TruckLoader size="sm" label="Submitting your information…" />
          </div>
        ) : null}

        <div className="auth-card-accent auth-card-accent-register h-1.5 w-full" />

        <CardHeader className="space-y-3 pt-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center">
            <BrandLogo variant="icon" size={56} priority />
          </div>
          <CardTitle className="text-2xl">Driver registration</CardTitle>
          <CardDescription>
            Complete your profile and upload identity proof. Your operator will review and approve
            your information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Your full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License number</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  placeholder="License number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_category">License category</Label>
                <Select
                  id="license_category"
                  name="license_category"
                  defaultValue="HMV"
                  required
                >
                  <option value="HMV">HMV</option>
                  <option value="LMV">LMV</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_expiry">License expiry</Label>
                <Input id="license_expiry" name="license_expiry" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 00000 00000" required />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/40 p-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">Identity document</Label>
                <Select
                  id="document_type"
                  value={documentType}
                  onChange={(event) =>
                    setDocumentType(event.target.value as "Driving License" | "Aadhaar Card")
                  }
                >
                  {DRIVER_PROOF_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="identity_proof">Upload {documentType}</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    ref={fileInputRef}
                    id="identity_proof"
                    name="identity_proof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setFileName(file?.name ?? null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    {fileName ? "Change file" : "Choose photo"}
                  </Button>
                  <p className={cn("text-sm", fileName ? "text-foreground" : "text-muted-foreground")}>
                    {fileName ?? "JPEG, PNG, or WebP up to 10 MB"}
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <TruckLoaderInline />
                  Submit information
                </span>
              ) : (
                "Submit information"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
