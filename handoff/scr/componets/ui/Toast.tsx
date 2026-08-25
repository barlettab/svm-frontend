import { useEffect } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";
import { IconButton } from "./Button";

export type ToastTone = "success" | "error" | "warning" | "info";

const TONES: Record<ToastTone, [string, string, IconName]> = {
  success: ["border-success-line bg-success-bg", "text-success", "check"],
  error: ["border-error-line bg-error-bg", "text-error", "warning"],
  warning: ["border-warning-line bg-warning-bg", "text-warning", "warning"],
  info: ["border-info-line bg-info-bg", "text-info", "info"],
};

interface ToastProps {
  open: boolean;
  tone?: ToastTone;
  message: string;
  detail?: string;
  onClose: () => void;
  duration?: number;
}

/** Toast no topo direito, abaixo do header. Região aria-live. */
export function Toast({ open, tone = "success", message, detail, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (!open || !duration) return;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;
  const [box, ink, icon] = TONES[tone];

  return (
    <div aria-live="polite" className="fixed right-6 top-[70px] z-50">
      <div
        className={cx(
          "flex w-[380px] items-start gap-3 rounded-svm border px-4 py-3 shadow-pop animate-[svm-toast-in_0.18s_ease-out]",
          box,
        )}
      >
        <Icon name={icon} size={17} className={cx("mt-px", ink)} />
        <div className="min-w-0 flex-1">
          <p className={cx("text-body font-semibold", ink)}>{message}</p>
          {detail && <p className="mt-0.5 text-aux text-ink-2">{detail}</p>}
        </div>
        <IconButton icon="x" label="Fechar aviso" onClick={onClose} className="h-6 w-6" />
      </div>
    </div>
  );
}
