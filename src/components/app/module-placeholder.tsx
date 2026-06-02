import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  phase: string;
  icon: LucideIcon;
  features: string[];
};

export function ModulePlaceholder({
  title,
  description,
  phase,
  icon,
  features,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={phase}
        title={title}
        description={description}
        actions={<Badge>Coming next</Badge>}
      />
      <EmptyState
        eyebrow="Product-ready placeholder"
        icon={icon}
        title={`${title} is queued for ${phase}`}
        description="The route, navigation, layout, theme, and empty state are already wired so the next phase can focus on the module logic."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature}
            className="rounded-xl border border-border bg-card/85 p-5 shadow-sm"
          >
            <p className="text-sm font-medium">{feature}</p>
            <div className="mt-5">
              <Progress value={(index + 1) * 18} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
