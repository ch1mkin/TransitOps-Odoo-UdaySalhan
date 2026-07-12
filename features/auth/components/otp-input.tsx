"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({ value, onChange, disabled = false, className }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 4 }, (_, index) => value[index] ?? "");

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, nextDigit: string) => {
    const sanitized = nextDigit.replace(/\D/g, "").slice(-1);
    const next = digits.map((digit, i) => (i === index ? sanitized : digit)).join("");
    onChange(next.replace(/\s/g, ""));

    if (sanitized && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div className={cn("flex justify-center gap-3", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          className="h-12 w-12 rounded-lg border border-input bg-card text-center text-lg font-semibold tracking-widest shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
