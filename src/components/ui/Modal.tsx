import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { IconButton } from "./Button";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}

const WIDTHS = { sm: "max-w-[420px]", md: "max-w-[560px]", lg: "max-w-[760px]" };

/** Modal: overlay 40%, sombra forte, cabeçalho com borda, sem raio grande. */
export function Modal({ open, title, onClose, children, footer, width = "md" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(45,45,45,0.4)] p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx("w-full rounded-svm bg-surface shadow-modal outline-none", WIDTHS[width])}
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 className="text-section font-semibold text-ink">{title}</h2>
          <IconButton icon="x" label="Fechar" onClick={onClose} />
        </header>
        <div className="px-6 py-5 text-body text-ink">{children}</div>
        <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">
          {footer ?? (
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

/** Confirmação destrutiva ou de envio. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <Icon
          name={tone === "danger" ? "warning" : "info"}
          size={20}
          className={tone === "danger" ? "mt-px text-error" : "mt-px text-primary"}
        />
        <div>{message}</div>
      </div>
    </Modal>
  );
}

/** Confirmação de sucesso com o número gerado. */
export function SuccessModal({
  open,
  message,
  code,
  onClose,
  secondaryAction,
}: {
  open: boolean;
  message: string;
  code: string;
  onClose: () => void;
  secondaryAction?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(45,45,45,0.4)] p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-[420px] rounded-svm bg-surface p-8 text-center shadow-modal">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-success-line bg-success-bg">
          <Icon name="check" size={22} className="text-success" strokeWidth={2} />
        </span>
        <p className="mt-4 text-ident text-ink">{message}</p>
        <p className="mt-2 font-mono text-[19px] font-semibold text-primary">{code}</p>
        <div className="mt-6 flex justify-center gap-3">
          {secondaryAction}
          <Button variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
