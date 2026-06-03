import { AuthCard } from "@/features/auth/auth-card";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function AuthFallback() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center rounded-[1.5rem] bg-[#1F1C1B] border border-[#F5F2EC]/5 shadow-2xl">
      <Loader2 className="h-8 w-8 animate-spin text-[#CBA365]" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthCard mode="sign-up" />
    </Suspense>
  );
}
