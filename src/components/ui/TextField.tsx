import { FormField } from "./FormField";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  fullWidth,
}: TextFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-blue-600"
        }`}
      />
    </FormField>
  );
}
