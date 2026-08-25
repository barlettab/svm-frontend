import { controlClasses } from "./FormField";
import { Icon, type IconName } from "./Icon";

interface FilterTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: IconName;
}

/** Campo da barra de filtros — mesma altura e borda do form, label maiúsculo. */
export function FilterTextField({ id, label, value, onChange, placeholder, icon }: FilterTextFieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-label uppercase tracking-[0.4px] text-ink-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={controlClasses(undefined, icon ? "h-[38px] pr-9" : "h-[38px]")}
        />
        {icon && (
          <Icon name={icon} size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
        )}
      </div>
    </div>
  );
}
