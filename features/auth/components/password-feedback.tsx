"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "@/schemas/auth";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="space-y-1 rounded-lg border border-border bg-muted/30 p-3 text-xs">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = password.length > 0 && req.test(password);
        return (
          <li
            key={req.id}
            className={cn(
              "flex items-center gap-2",
              met ? "text-success" : "text-muted-foreground"
            )}
          >
            {met ? (
              <Check className="size-3.5 shrink-0" />
            ) : (
              <X className="size-3.5 shrink-0 opacity-50" />
            )}
            <span>{req.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

export function PasswordMatchIndicator({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs",
        matches ? "text-success" : "text-destructive"
      )}
    >
      {matches ? (
        <>
          <Check className="size-3.5" />
          Passwords match
        </>
      ) : (
        <>
          <X className="size-3.5" />
          Passwords do not match
        </>
      )}
    </p>
  );
}
