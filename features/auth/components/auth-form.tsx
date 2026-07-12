"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
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
import { ROLE_OPTIONS } from "@/constants/roles";
import { WALKTHROUGH_PENDING_KEY } from "@/constants/walkthrough";
import { cn } from "@/lib/utils";
import { MinimalConfetti } from "@/features/auth/components/minimal-confetti";
import { OtpInput } from "@/features/auth/components/otp-input";
import {
  PasswordMatchIndicator,
  PasswordRequirements,
} from "@/features/auth/components/password-feedback";
import {
  sendLoginOtp,
  sendRegisterOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} from "@/lib/auth/auth-otp-actions";
import { createClient } from "@/lib/supabase/client";
import {
  getSupabaseEnvErrorMessage,
} from "@/lib/supabase/env";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/schemas/auth";

function getSupabaseClient() {
  try {
    return createClient();
  } catch (error) {
    throw new Error(getSupabaseEnvErrorMessage(error));
  }
}


export function AuthForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingLogin, setPendingLogin] = useState<LoginFormValues | null>(null);
  const [pendingRegister, setPendingRegister] = useState<RegisterFormValues | null>(null);
  const submittingRef = useRef(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
    mode: "onChange",
  });

  const isLogin = mode === "login";
  const registerPassword = registerForm.watch("password");
  const registerConfirmPassword = registerForm.watch("confirmPassword");
  const verifyEmail = isLogin ? pendingLogin?.email : pendingRegister?.email;

  const resetVerification = () => {
    setOtpSent(false);
    setOtpCode("");
    setPendingLogin(null);
    setPendingRegister(null);
  };

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      getSupabaseClient();
      setConfigError(null);
    } catch (error) {
      setConfigError(getSupabaseEnvErrorMessage(error));
    }
  }, []);

  const completeRegistration = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();

    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      loginForm.setValue("email", email);
      loginForm.setValue("password", password);
      registerForm.reset();
      resetVerification();
      setMode("login");
      toast.success("Account created! Sign in to enter your workspace.");
    }, 1500);
  };

  const handleLogin = async (values: LoginFormValues) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const result = await sendLoginOtp(values);
      if (!result.success) {
        toast.error(result.error ?? "Could not send verification code.");
        return;
      }

      setPendingLogin(values);
      setOtpCode("");
      setOtpSent(true);
      toast.success(
        result.devCode
          ? `Verification code sent. Dev code: ${result.devCode}`
          : "Verification code sent to your email."
      );
    } catch (error) {
      toast.error(getSupabaseEnvErrorMessage(error));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const result = await sendRegisterOtp(values);
      if (!result.success) {
        toast.error(result.error ?? "Could not send verification code.");
        return;
      }

      setPendingRegister(values);
      setOtpCode("");
      setOtpSent(true);
      toast.success(
        result.devCode
          ? `Verification code sent. Dev code: ${result.devCode}`
          : "Verification code sent to your email."
      );
    } catch (error) {
      toast.error(getSupabaseEnvErrorMessage(error));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleVerifyOtp = async () => {
    if (submittingRef.current || otpCode.length !== 4) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      if (isLogin && pendingLogin) {
        const result = await verifyLoginOtp({
          ...pendingLogin,
          code: otpCode,
        });

        if (!result.success) {
          toast.error(result.error ?? "Verification failed.");
          return;
        }

        toast.success("Welcome back");
        sessionStorage.setItem(WALKTHROUGH_PENDING_KEY, "1");
        window.location.assign("/dashboard");
        return;
      }

      if (!isLogin && pendingRegister) {
        const result = await verifyRegisterOtp({
          ...pendingRegister,
          code: otpCode,
        });

        if (!result.success) {
          toast.error(result.error ?? "Verification failed.");
          return;
        }

        await completeRegistration(pendingRegister.email.trim(), pendingRegister.password);
        return;
      }

      toast.error("Session expired. Please start again.");
      resetVerification();
    } catch (error) {
      toast.error(getSupabaseEnvErrorMessage(error));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      if (isLogin && pendingLogin) {
        const result = await sendLoginOtp(pendingLogin);
        if (!result.success) {
          toast.error(result.error ?? "Could not resend code.");
          return;
        }
        toast.success(
          result.devCode
            ? `New code sent. Dev code: ${result.devCode}`
            : "A new verification code was sent."
        );
        return;
      }

      if (!isLogin && pendingRegister) {
        const result = await sendRegisterOtp(pendingRegister);
        if (!result.success) {
          toast.error(result.error ?? "Could not resend code.");
          return;
        }
        toast.success(
          result.devCode
            ? `New code sent. Dev code: ${result.devCode}`
            : "A new verification code was sent."
        );
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleSubmit = async () => {
    if (otpSent) {
      await handleVerifyOtp();
      return;
    }

    if (isLogin) {
      await loginForm.handleSubmit(handleLogin)();
      return;
    }

    await registerForm.handleSubmit(handleRegister)();
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <>
      <MinimalConfetti active={showConfetti} />

      <div className="auth-page-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div
          className={cn(
            "auth-page-glow pointer-events-none absolute inset-0",
            isLogin ? "auth-page-glow-login" : "auth-page-glow-register"
          )}
        />

        <Card
          className={cn(
            "auth-premium-card relative w-full max-w-md overflow-hidden border-border/70 bg-card/82 backdrop-blur-xl",
            isLogin ? "auth-premium-card-login" : "auth-premium-card-register"
          )}
        >
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
              <TruckLoader
                size="sm"
                label={otpSent ? "Signing you in…" : isLogin ? "Signing in…" : "Creating account…"}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "auth-card-accent h-1.5 w-full",
              isLogin ? "auth-card-accent-login" : "auth-card-accent-register"
            )}
          />

          <CardHeader className="space-y-3 pt-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center">
              <BrandLogo variant="icon" size={56} priority />
            </div>
            <CardTitle className="text-2xl">TransitOps</CardTitle>
            <CardDescription>
              {otpSent
                ? `Enter the 4-digit code sent to ${verifyEmail ?? "your email"}`
                : isLogin
                  ? "Sign in to your transport operations workspace"
                  : "Create your TransitOps account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {configError && (
              <div className="mb-4 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Supabase configuration error</p>
                  <p className="mt-1 text-destructive/90">{configError}</p>
                </div>
              </div>
            )}

            {!otpSent ? (
              <div className="mb-6 flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    resetVerification();
                  }}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    isLogin
                      ? "bg-card text-foreground workspace-shadow"
                      : "text-muted-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    resetVerification();
                  }}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    !isLogin
                      ? "bg-card text-foreground workspace-shadow"
                      : "text-muted-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              {!otpSent && !isLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Rajesh Kumar"
                    {...registerForm.register("fullName")}
                  />
                  {registerForm.formState.errors.fullName ? (
                    <p className="text-xs text-destructive">
                      {registerForm.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="rajesh.kumar@transitops.in"
                      {...(isLogin
                        ? loginForm.register("email")
                        : registerForm.register("email"))}
                    />
                    {(isLogin
                      ? loginForm.formState.errors.email
                      : registerForm.formState.errors.email) ? (
                      <p className="text-xs text-destructive">
                        {(isLogin
                          ? loginForm.formState.errors.email
                          : registerForm.formState.errors.email
                        )?.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...(isLogin
                          ? loginForm.register("password")
                          : registerForm.register("password"))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {(isLogin
                      ? loginForm.formState.errors.password
                      : registerForm.formState.errors.password) ? (
                      <p className="text-xs text-destructive">
                        {(isLogin
                          ? loginForm.formState.errors.password
                          : registerForm.formState.errors.password
                        )?.message}
                      </p>
                    ) : null}
                    {!isLogin ? (
                      <PasswordRequirements password={registerPassword ?? ""} />
                    ) : null}
                  </div>
                </>
              ) : null}

              {!otpSent && !isLogin ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <PasswordMatchIndicator
                      password={registerPassword ?? ""}
                      confirmPassword={registerConfirmPassword ?? ""}
                    />
                    {registerForm.formState.errors.confirmPassword ? (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...registerForm.register("role")}
                    >
                      <option value="">Select your role</option>
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {registerForm.formState.errors.role ? (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.role.message}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}

              {otpSent ? (
                <div className="space-y-4">
                  <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={resetVerification}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="text-accent hover:underline"
                      disabled={loading}
                      onClick={() => void handleResendOtp()}
                    >
                      Resend code
                    </button>
                  </div>
                </div>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  Boolean(configError) ||
                  showConfetti ||
                  (otpSent && otpCode.length !== 4)
                }
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <TruckLoaderInline />
                    {isLogin ? "Sign In" : "Create Account"}
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
