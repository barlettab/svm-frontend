import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: IconName;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon = "search", action }: EmptyStateProps) {
  return (
    <div className="border border-line bg-surface px-6 py-14 text-center">
      <Icon name={icon} size={34} className="mx-auto text-[#c9c9c9]" strokeWidth={1.4} />
      <p className="mt-4 text-ident text-ink-2">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-body text-ink-3">{description}</p>
      {action && <div className="mt-4 flex justify-center gap-3">{action}</div>}
    </div>
  );
}
