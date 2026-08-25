import { controlClasses, FormField } from "./FormField";

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

/** Date picker nativo — a referência usa o controle do navegador. */
export function DateField({ id, label, value, onChange, required, error, disabled, min, max }: DateFieldProps) {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error}>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={controlClasses(error, "h-[38px]")}
      />
    </FormField>
  );
}
