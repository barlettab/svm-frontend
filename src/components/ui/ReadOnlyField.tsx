interface ReadOnlyFieldProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

export function ReadOnlyField({ label, value, fullWidth }: ReadOnlyFieldProps) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        {value}
      </div>
    </div>
  );
}
