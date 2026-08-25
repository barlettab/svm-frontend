import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="border-b border-line-soft py-3 last:border-b-0">
      <dt className="text-label uppercase tracking-[0.4px] text-ink-3">{label}</dt>
      <dd className="mt-1 text-body text-ink">{value}</dd>
    </div>
  );
}
