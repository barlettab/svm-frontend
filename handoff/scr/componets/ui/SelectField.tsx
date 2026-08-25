import { controlClasses, FormField } from "./FormField";
import { cx } from "./cx";
import { Icon } from "./Icon";

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  required,
  error,
  fullWidth,
  disabled,
}: SelectFieldProps) {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error} fullWidth={fullWidth}>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={cx(
            controlClasses(error, "h-[38px] appearance-none pr-9"),
            !value && "text-ink-4",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-ink">
              {option}
            </option>
          ))}
        </select>
        <Icon
          name="chev-down"
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2"
        />
      </div>
    </FormField>
  );
}
