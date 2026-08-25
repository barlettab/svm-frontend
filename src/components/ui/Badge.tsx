import type { ReactNode } from "react";
import { cx } from "./cx";

export type Tone = "slate" | "blue" | "amber" | "green" | "red";

const TONE_CLASSES: Record<Tone, string> = {
  slate: "border-line bg-surface-alt text-ink-2",
  blue: "border-info-line bg-info-bg text-info",
  amber: "border-warning-line bg-warning-bg text-warning",
  green: "border-success-line bg-success-bg text-success",
  red: "border-error-line bg-error-bg text-error",
};

interface BadgeProps {
  tone: Tone;
  children: ReactNode;
  className?: string;
}

/** 11px / 600 / maiúsculo, raio 2px, sempre com rótulo textual (nunca só cor). */
export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-svm border px-2 py-[3px] text-micro font-semibold uppercase tracking-[0.5px]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Mapa de status → tom. Centralizado para manter consistência entre telas. */
export const STATUS_TONE: Record<string, Tone> = {
  Submetido: "blue",
  "Em análise": "amber",
  "Em complementação": "amber",
  Validado: "green",
  "Não validado": "red",
  Cancelado: "slate",
  Ativo: "green",
  Inativo: "slate",
  Suspenso: "amber",
  "Em monitoramento": "blue",
  "Não monitorado": "slate",
  "Não se aplica": "slate",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "slate"}>{status}</Badge>;
}
