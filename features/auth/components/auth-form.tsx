"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  PasswordMatchIndicator,
  PasswordRequirements,
} from "@/features/auth/components/password-feedback";
import { createClient } from "@/lib/supabase/client";
import {
  getSupabaseEnvErrorMessage,
  mapSupabaseAuthError,
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
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      getSupabaseClient();
      setConfigError(null);
    } catch (error) {
      setConfigError(getSupabaseEnvErrorMessage(error));
    }
  }, []);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(mapSupabaseAuthError(error.message));
        return;
      }

      toast.success("Welcome back");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(getSupabaseEnvErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: values.role,
          },
        },
      });

      if (error) {
        toast.error(mapSupabaseAuthError(error.message));
        return;
      }

      // Profile is created by the handle_new_user() DB trigger — no client upsert
      // (client upsert fails RLS when email confirmation is on and no session exists yet)
      if (data.session) {
        toast.success("Account created successfully");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (data.user) {
        toast.success(
          "Account created! If email confirmation is enabled, check your inbox then sign in."
        );
        setMode("login");
        return;
      }

      toast.success("Account created successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(getSupabaseEnvErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = isLogin
    ? loginForm.handleSubmit(handleLogin)
    : registerForm.handleSubmit(handleRegister);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="size-6" />
          </div>
          <CardTitle className="text-2xl">TransitOps</CardTitle>
          <CardDescription>
            {isLogin
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
                <p className="mt-2 text-destructive/80">
                  Fix <code className="rounded bg-destructive/10 px-1">.env</code>{" "}
                  using <code className="rounded bg-destructive/10 px-1">.env.example</code>, then restart{" "}
                  <code className="rounded bg-destructive/10 px-1">npm run dev</code>.
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
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
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-card text-foreground workspace-shadow"
                  : "text-muted-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  {...registerForm.register("fullName")}
                />
                {registerForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...(isLogin
                  ? loginForm.register("email")
                  : registerForm.register("email"))}
              />
              {(isLogin
                ? loginForm.formState.errors.email
                : registerForm.formState.errors.email) && (
                <p className="text-xs text-destructive">
                  {(isLogin
                    ? loginForm.formState.errors.email
                    : registerForm.formState.errors.email
                  )?.message}
                </p>
              )}
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
                : registerForm.formState.errors.password) && (
                <p className="text-xs text-destructive">
                  {(isLogin
                    ? loginForm.formState.errors.password
                    : registerForm.formState.errors.password
                  )?.message}
                </p>
              )}
              {!isLogin && (
                <PasswordRequirements password={registerPassword ?? ""} />
              )}
            </div>

            {!isLogin && (
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
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
                  {registerForm.formState.errors.role && (
                    <p className="text-xs text-destructive">
                      {registerForm.formState.errors.role.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || Boolean(configError)}
            >
              {loading && <Loader2 className="animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
