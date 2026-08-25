import type { InputHTMLAttributes } from "react";
import { controlClasses, FormField } from "./FormField";
import { Icon, type IconName } from "./Icon";

interface TextFieldProps {
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
  icon?: IconName;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  fullWidth,
  disabled,
  icon,
  inputMode,
  maxLength,
}: TextFieldProps) {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error} hint={hint} fullWidth={fullWidth}>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={controlClasses(error, icon ? "h-[38px] pr-9" : "h-[38px]")}
        />
        {icon && (
          <Icon
            name={icon}
            size={16}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
        )}
      </div>
    </FormField>
  );
}
