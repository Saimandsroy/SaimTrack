import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-zinc-950 transition-all dark:bg-white"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
