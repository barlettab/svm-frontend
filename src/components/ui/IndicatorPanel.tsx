import { cx } from "./cx";

export interface IndicatorItem {
  key: string;
  label: string;
  count: number;
  /** Cor do marcador e do segmento da barra (token CSS ou hex). */
  color: string;
}

export interface IndicatorGroup {
  title: string;
  items: IndicatorItem[];
}

interface IndicatorPanelProps {
  totalLabel: string;
  total: number;
  groups: IndicatorGroup[];
  activeKey: string | null;
  onSelect: (key: string | null) => void;
}

/**
 * Painel de indicadores agrupados por dimensão. Cada linha é um botão que
 * filtra a lista abaixo, para que o número sempre leve aos modelos que ele conta.
 */
export function IndicatorPanel({ totalLabel, total, groups, activeKey, onSelect }: IndicatorPanelProps) {
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <section
      aria-label="Resumo"
      className="mb-5 grid grid-cols-1 rounded-svm border border-line bg-surface sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="flex flex-col gap-1.5 border-b border-line-soft px-6 py-5 sm:border-r">
        <span className="text-label font-semibold uppercase tracking-[0.5px] text-ink-2">{totalLabel}</span>
        <span className="text-[44px] font-light leading-none text-ink tabular-nums">{total}</span>
        <span className="text-aux text-ink-2">
          Clique em um indicador para ver na lista quais modelos ele representa.
        </span>
        {activeKey && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="mt-1 self-start text-body font-semibold text-primary hover:underline"
          >
            Ver todos os {total}
          </button>
        )}
      </div>

      {groups.map((group) => (
        <div key={group.title} className="flex min-w-0 flex-col gap-2.5 border-b border-line-soft px-4 py-5 sm:border-r">
          <span className="px-2.5 text-label font-semibold uppercase tracking-[0.5px] text-ink-2">
            {group.title}
          </span>
          <div aria-hidden="true" className="mx-2.5 flex h-2 overflow-hidden rounded-svm bg-line-soft">
            {group.items.map((item) => (
              <span key={item.key} style={{ width: `${pct(item.count)}%`, background: item.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = activeKey === item.key;
              const empty = item.count === 0;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={empty}
                  aria-pressed={active}
                  onClick={() => onSelect(active ? null : item.key)}
                  className={cx(
                    "group grid w-full grid-cols-[10px_1fr_auto_auto] items-center gap-x-2.5 rounded-svm border px-2.5 py-1.5 text-left text-body",
                    active ? "border-primary bg-info-bg" : "border-transparent",
                    empty ? "cursor-default opacity-60" : "hover:border-line hover:bg-surface-alt",
                  )}
                >
                  <span className="size-2.5 rounded-[2px]" style={{ background: item.color }} />
                  <span className="text-ink">{item.label}</span>
                  <span className="text-aux text-ink-2 tabular-nums">{pct(item.count)}%</span>
                  <span className="min-w-7 text-right text-[17px] font-bold text-ink tabular-nums">{item.count}</span>
                  {!empty && (
                    <span
                      className={cx(
                        "col-start-2 col-end-5 text-aux font-semibold text-primary",
                        active ? "visible" : "invisible group-hover:visible group-focus-visible:visible",
                      )}
                    >
                      {active ? "Filtrando a lista · clique para remover" : `Ver os ${item.count} na lista ↓`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
