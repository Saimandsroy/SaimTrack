"use client";

import { Search } from "lucide-react";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserMenu } from "@/components/app/user-menu";
import { MobileSidebar } from "@/components/app/sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <MobileSidebar />
        <div className="hidden h-10 flex-1 max-w-xl items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground shadow-sm md:flex">
          <Search className="h-4 w-4" />
          Search modules, goals, notes
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
