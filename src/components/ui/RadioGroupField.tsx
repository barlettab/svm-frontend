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
}: RadioGroupFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <div className="flex items-center gap-5 pt-1" id={id}>
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600/30"
            />
            {option}
          </label>
        ))}
      </div>
    </FormField>
  );
}
