interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function CheckboxField({ id, label, checked, onChange, disabled, hint }: CheckboxFieldProps) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-2.5 text-body text-ink has-disabled:cursor-not-allowed has-disabled:text-ink-4"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-[15px] w-[15px] accent-primary"
        />
        <span>{label}</span>
      </label>
      {hint && <p className="mt-1 pl-[25px] text-aux text-ink-3">{hint}</p>}
    </div>
  );
}
