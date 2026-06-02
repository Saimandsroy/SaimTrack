"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Sidebar, MobileSidebar } from "@/components/app/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
   

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent-subtle selection:text-accent-text font-sans">
      <div className="flex min-h-screen max-w-[1800px] mx-auto">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col relative">
          
          {/* Mobile Topbar Substitute (Desktop has no topbar) */}
          <header className="lg:hidden flex h-14 items-center gap-3 px-4 border-b border-border bg-background sticky top-0 z-30">
            <MobileSidebar />
            <span className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <img src="/logo.png" alt="SaimTrack Logo" className="w-5 h-5 object-contain" />
              SaimTrack
            </span>
          </header>
          
          <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
