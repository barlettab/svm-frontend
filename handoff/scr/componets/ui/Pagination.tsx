import { cx } from "./cx";
import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const SIZES = [10, 25, 50, 100];

/** Paginação da referência: "X a Y de Z" à esquerda, controles à direita. */
export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const btn =
    "inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-svm border border-line bg-white px-2 text-aux text-ink-2 transition-colors hover:border-field hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:border-line";

  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  for (let i = start; i <= Math.min(pageCount, start + 4); i += 1) pages.push(i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-aux text-ink-3">
        {from} a {to} de {total} registros
      </span>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-aux text-ink-3">
            Itens por página
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-[30px] rounded-svm border border-line bg-white px-1.5 text-aux text-ink"
            >
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-1">
          <button type="button" className={btn} disabled={page === 1} onClick={() => onPageChange(1)} aria-label="Primeira página">
            <Icon name="chev-first" size={13} />
          </button>
          <button type="button" className={btn} disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">
            <Icon name="chev-left" size={13} />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cx(btn, p === page && "border-primary bg-info-bg font-semibold text-primary")}
            >
              {p}
            </button>
          ))}
          <button type="button" className={btn} disabled={page === pageCount} onClick={() => onPageChange(page + 1)} aria-label="Próxima página">
            <Icon name="chev-right" size={13} />
          </button>
          <button type="button" className={btn} disabled={page === pageCount} onClick={() => onPageChange(pageCount)} aria-label="Última página">
            <Icon name="chev-last" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
