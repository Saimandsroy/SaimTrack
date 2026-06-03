"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
        <p className="text-sm font-medium text-text-secondary">Loading SaimTrack...</p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/sign-in");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    if (loading) {
      return <FullPageLoader />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 text-center shadow-lg">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Access required
          </p>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Sign in required</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            SaimTrack is loading correctly, but this workspace needs a logged-in
            account to proceed.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/auth/sign-in">Go to sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading, signOutUser, expelUnauthorizedUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If we were bounced back here with an unauthorized error from middleware, sign out.
    if (user && typeof window !== "undefined" && window.location.search.includes("error=unauthorized")) {
      expelUnauthorizedUser();
      // Clean the URL so they aren't trapped if they try to log in again
      router.replace("/auth/sign-in");
      return;
    }

    if (user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user, expelUnauthorizedUser]);

  const isUnauthorizedError = typeof window !== "undefined" && window.location.search.includes("error=unauthorized");

  if (loading || (user && !isUnauthorizedError)) {
    return <FullPageLoader />;
  }

  return children;
}
