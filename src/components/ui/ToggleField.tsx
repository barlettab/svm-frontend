import { cx } from "./cx";

interface ToggleFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Texto ao lado do botão quando ligado / desligado. */
  onLabel?: string;
  offLabel?: string;
  hint?: string;
}

/** Interruptor liga/desliga (role="switch"), para opções Sim/Não que valem na hora em que são salvas. */
export function ToggleField({ id, label, checked, onChange, disabled, onLabel = "Sim", offLabel = "Não", hint }: ToggleFieldProps) {
  return (
    <div className="min-w-0">
      <span id={`${id}-label`} className="mb-2 block text-label uppercase tracking-[0.4px] text-ink-2">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cx(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-primary" : "bg-line-strong",
          )}
        >
          <span
            aria-hidden="true"
            className={cx(
              "inline-block size-5 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
        <span className="text-body text-ink">{checked ? onLabel : offLabel}</span>
      </div>
      {hint && <p className="mt-1.5 text-aux text-ink-3">{hint}</p>}
    </div>
  );
}
