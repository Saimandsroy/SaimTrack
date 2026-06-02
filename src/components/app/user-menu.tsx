"use client";

import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";

export function UserMenu() {
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  async function handleSignOut() {
    try {
      await signOutUser();
      toast.success("Signed out.");
      router.replace("/auth/sign-in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  const name = user?.displayName || user?.email || "SaimTrack user";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm md:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-950 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="max-w-36 truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">Personal workspace</p>
        </div>
      </div>
      <Button
        aria-label="Sign out"
        size="icon"
        type="button"
        variant="secondary"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
      </Button>
      <UserCircle className="hidden" />
    </div>
  );
}
