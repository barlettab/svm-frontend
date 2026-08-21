interface TabItem<T extends string> {
  key: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
}

export function Tabs<T extends string>({
  items,
  activeKey,
  onChange,
}: TabsProps<T>) {
  return (
    <div className="flex gap-6 border-b border-slate-200">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`-mb-px border-b-2 px-1 py-3 text-sm font-semibold tracking-wide transition-colors ${
              isActive
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
