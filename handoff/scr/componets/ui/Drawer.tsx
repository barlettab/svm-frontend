import type { ReactNode } from "react";
import { useEffect } from "react";
import { IconButton } from "./Button";

interface DrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Painel lateral de detalhe — 520px, entra pela direita, overlay 40%. */
export function Drawer({ open, title, subtitle, onClose, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Fechar detalhes" onClick={onClose} className="absolute inset-0 bg-[rgba(45,45,45,0.4)]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-[520px] flex-col border-l border-line bg-surface shadow-modal"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-section font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-aux text-ink-3">{subtitle}</p>}
          </div>
          <IconButton icon="x" label="Fechar" onClick={onClose} />
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</footer>}
      </aside>
    </div>
  );
}
