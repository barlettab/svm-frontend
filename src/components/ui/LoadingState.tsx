import { Icon } from "./Icon";

const SHIMMER =
  "block h-[11px] rounded-svm bg-[linear-gradient(90deg,#f2f2f2,#e6e6e6,#f2f2f2)] bg-[length:400px_100%] animate-[svm-shimmer_1.4s_linear_infinite]";

/** Skeleton de tabela — mesma malha da tabela real. */
export function LoadingTable({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="border border-line bg-surface" aria-busy="true" aria-live="polite">
      <div className="flex gap-4 border-b border-line bg-thead px-3.5 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <span key={i} className="block h-[9px] flex-1 rounded-svm bg-line-strong" />
        ))}
      </div>
      <div className="flex flex-col gap-4 px-3.5 py-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <span key={c} className={SHIMMER + " flex-1"} />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando registros</span>
    </div>
  );
}

/** Spinner inline para blocos menores e botões. */
export function InlineLoading({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-body text-ink-2" aria-live="polite">
      <Icon name="spinner" size={17} className="animate-[svm-spin_1.1s_linear_infinite] text-primary" />
      {label}
    </div>
  );
}
