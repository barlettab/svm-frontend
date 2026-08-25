import { controlClasses } from "./FormField";
import { Icon } from "./Icon";

interface FilterSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function FilterSelectField({ id, label, value, onChange, options }: FilterSelectFieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-label uppercase tracking-[0.4px] text-ink-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={controlClasses(undefined, "h-[38px] appearance-none pr-9")}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Icon name="chev-down" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
      </div>
    </div>
  );
}
