import { Suspense } from "react";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
