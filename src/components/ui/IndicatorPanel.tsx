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
}

/** Painel de indicadores agrupados por dimensão. Só informativo: para filtrar, use a barra de filtros. */
export function IndicatorPanel({ totalLabel, total, groups }: IndicatorPanelProps) {
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <section
      aria-label="Resumo"
      className="mb-5 grid grid-cols-1 rounded-svm border border-line bg-surface sm:grid-cols-3"
    >
      <div className="flex flex-col gap-1.5 border-b border-line-soft px-6 py-5 sm:border-r">
        <span className="text-label font-semibold uppercase tracking-[0.5px] text-ink-2">{totalLabel}</span>
        <span className="text-[44px] font-light leading-none text-ink tabular-nums">{total}</span>
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
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li
                key={item.key}
                className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-x-2.5 px-2.5 py-1.5 text-body"
              >
                <span className="size-2.5 rounded-[2px]" style={{ background: item.color }} />
                <span className="text-ink">{item.label}</span>
                <span className="text-aux text-ink-2 tabular-nums">{pct(item.count)}%</span>
                <span className="min-w-7 text-right text-[17px] font-bold text-ink tabular-nums">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
