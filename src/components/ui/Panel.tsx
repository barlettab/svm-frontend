import type { ReactNode } from "react";
import { cx } from "./cx";

interface PanelProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Superfície padrão: branco, borda 1px #E0E0E0, raio 2px, sem sombra.
 * Cabeçalho opcional com título de seção 16/600 e ações à direita.
 */
export function Panel({ title, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cx("rounded-svm border border-line bg-surface", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-4 border-b border-line-soft px-7 py-4">
          {title && <h2 className="text-section font-semibold text-ink">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cx("px-7 py-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Grid de formulário da referência: 3 colunas, gap 20/24. */
export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

/** Barra de ações no pé de formulários e painéis. */
export function FormActions({ children, align = "right" }: { children: ReactNode; align?: "left" | "right" | "between" }) {
  return (
    <div
      className={cx(
        "mt-7 flex flex-wrap items-center gap-3 border-t border-line-soft pt-5",
        align === "right" && "justify-end",
        align === "between" && "justify-between",
      )}
    >
      {children}
    </div>
  );
}
