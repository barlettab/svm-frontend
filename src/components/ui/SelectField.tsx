import { FormField } from "./FormField";

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
}: SelectFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
          value ? "text-slate-900" : "text-slate-400"
        } ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-blue-600"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="text-slate-900">
            {option}
          </option>
        ))}
      </select>
    </FormField>
  );
}
