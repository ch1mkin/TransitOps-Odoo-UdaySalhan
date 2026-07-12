import { z } from "zod";
import { ROLES } from "@/constants/roles";

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must include at least one symbol (e.g. !@#$%)"
  );

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(
      [
        ROLES.FLEET_MANAGER,
        ROLES.DISPATCHER,
        ROLES.SAFETY_OFFICER,
        ROLES.FINANCIAL_ANALYST,
      ],
      { message: "Please select a role" }
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .length(4, "Enter the 4-digit verification code")
    .regex(/^\d{4}$/, "Verification code must be 4 digits"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "symbol", label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;
