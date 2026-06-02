import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-white/80 px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:bg-white/5 dark:focus:border-zinc-500 dark:focus:ring-white/10",
        className,
      )}
      {...props}
    />
  );
}
