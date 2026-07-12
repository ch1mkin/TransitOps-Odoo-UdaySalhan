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

export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "symbol", label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;
