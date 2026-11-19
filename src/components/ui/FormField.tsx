import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Texto de ajuda mostrado no ícone (i) ao lado do label. */
  info?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

/** Label 11.5px maiúsculo, 8px até o campo, erro com ícone + texto. */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  info,
  children,
  fullWidth,
}: FormFieldProps) {
  return (
    <div className={cx("min-w-0", fullWidth && "md:col-span-2 lg:col-span-3")}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-label uppercase tracking-[0.4px] text-ink-2"
      >
        {label}
        {info && (
          // Fica fora do <label> no clique (preventDefault) para não focar o campo ao abrir a dica.
          <span
            className="group relative ml-1 inline-flex align-[-2px] normal-case tracking-normal"
            onClick={(e) => e.preventDefault()}
          >
            <span
              tabIndex={0}
              aria-describedby={`${htmlFor}-info`}
              aria-label="Ajuda"
              className="inline-flex cursor-help rounded-full text-ink-2 outline-none hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Icon name="info" size={13} />
            </span>
            <span
              id={`${htmlFor}-info`}
              role="tooltip"
              className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-72 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-svm bg-ink px-3 py-2 text-aux font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
            >
              {info}
            </span>
          </span>
        )}
        {required && <span className="ml-1 text-error">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-aux text-ink-3">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-aux text-error">
          <Icon name="warning" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

/** Classe única do controle — reutilizada por input, select, textarea. */
export function controlClasses(error?: string, extra?: string) {
  return cx(
    "w-full rounded-svm border bg-white px-2.5 text-body text-ink transition-colors placeholder:text-ink-4",
    "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-alt disabled:text-ink-4",
    error ? "border-error" : "border-field hover:border-[#a9a9a9]",
    extra,
  );
}
