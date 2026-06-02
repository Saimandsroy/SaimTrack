"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireAuth } from "@/features/auth/auth-guards";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
