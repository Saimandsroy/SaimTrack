import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
};

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  accent,
}: MetricCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm",
            accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}
