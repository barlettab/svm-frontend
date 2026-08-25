import { cx } from "./cx";

interface TabItem<T extends string> {
  key: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
}

/**
 * Abas da referência: fundo cinza claro, aba ativa branca "levantada"
 * sobre a linha inferior. Contador em pill.
 */
export function Tabs<T extends string>({ items, activeKey, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="flex items-end gap-0.5 border-b border-line">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onChange(item.key)}
            className={cx(
              "-mb-px flex h-[38px] items-center gap-2 rounded-t-svm border border-b-0 px-5 text-body transition-colors",
              isActive
                ? "border-line bg-surface font-semibold text-primary"
                : "border-transparent bg-transparent text-ink-2 hover:bg-surface-alt hover:text-ink",
              item.disabled && "cursor-not-allowed text-ink-4 hover:bg-transparent hover:text-ink-4",
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cx(
                  "rounded-full px-1.5 py-px text-micro font-semibold",
                  isActive ? "bg-info-bg text-primary" : "bg-line-soft text-ink-2",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
