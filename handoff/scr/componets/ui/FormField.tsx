import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
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
