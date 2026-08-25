import { cx } from "./cx";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

/** Campo preenchido pelo sistema — cinza, não editável. */
export function ReadOnlyField({ label, value, fullWidth }: ReadOnlyFieldProps) {
  return (
    <div className={cx("min-w-0", fullWidth && "md:col-span-2 lg:col-span-3")}>
      <span className="mb-2 block text-label uppercase tracking-[0.4px] text-ink-2">{label}</span>
      <div className="flex h-[38px] items-center rounded-svm border border-line bg-surface-alt px-2.5 text-body text-ink-2">
        {value}
      </div>
    </div>
  );
}
