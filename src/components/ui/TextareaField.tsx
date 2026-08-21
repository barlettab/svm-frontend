import { FormField } from "./FormField";

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  rows?: number;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  fullWidth = true,
  rows = 4,
}: TextareaFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-blue-600"
        }`}
      />
    </FormField>
  );
}
