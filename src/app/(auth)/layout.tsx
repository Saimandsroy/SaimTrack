"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { GuestOnly } from "@/features/auth/auth-guards";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestOnly>
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[#2A2726] text-[#F5F2EC] selection:bg-[#CBA365] selection:text-[#2A2726] font-sans px-4 py-12">
        
        {/* Premium Background Atmosphere */}
        
        {/* Noise Texture */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Very subtle ambient light */}
        <div className="absolute top-[10%] left-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_#CBA365_0%,_transparent_70%)] opacity-[0.03] pointer-events-none z-0 -translate-x-1/2" />

        {/* Theme toggle position */}
        <div className="absolute right-6 top-6 z-50">
          <ThemeToggle />
        </div>

        {/* Home Link / Logo at top */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute left-6 top-6 z-50 lg:left-12 lg:top-12"
        >
          <Link href="/" className="flex items-center gap-4 group">
            <span className="text-[#F5F2EC]/40 text-sm tracking-widest uppercase font-semibold group-hover:text-[#F5F2EC] transition-colors">
              SaimTrack // 1.0
            </span>
          </Link>
        </motion.div>

        {/* Center Auth Card */}
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>

      </main>
    </GuestOnly>
  );
}
