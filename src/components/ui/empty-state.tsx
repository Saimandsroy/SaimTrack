import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  eyebrow,
  action,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur",
        className,
      )}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/40 to-transparent" />
      <div className="flex max-w-xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-white shadow-sm dark:bg-white/10">
            <Icon className="h-5 w-5" />
          </div>
          {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </section>
  );
}
