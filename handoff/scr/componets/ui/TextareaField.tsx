import { controlClasses, FormField } from "./FormField";

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  fullWidth = true,
  disabled,
  rows = 4,
  maxLength,
}: TextareaFieldProps) {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error} hint={hint} fullWidth={fullWidth}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={controlClasses(error, "resize-y py-2 leading-relaxed")}
      />
      {maxLength && (
        <div className="mt-1 text-right text-aux text-ink-3">
          {value.length}/{maxLength}
        </div>
      )}
    </FormField>
  );
}
