import { FormField } from "./FormField";

interface RadioGroupFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function RadioGroupField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  error,
  fullWidth,
  disabled,
}: RadioGroupFieldProps) {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error} fullWidth={fullWidth}>
      <div id={id} role="radiogroup" className="flex min-h-[38px] flex-wrap items-center gap-x-6 gap-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-body text-ink has-disabled:cursor-not-allowed has-disabled:text-ink-4"
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              className="h-[15px] w-[15px] accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
    </FormField>
  );
}
