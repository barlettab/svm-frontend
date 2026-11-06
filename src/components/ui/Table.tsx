import type { ReactNode } from "react";
import { cx } from "./cx";
import { EmptyState } from "./EmptyState";
import { LoadingTable } from "./LoadingState";
import { Icon } from "./Icon";

export interface TableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  /** Destaca a coluna (ex.: dimensão do indicador que está filtrando a lista). */
  highlight?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle: string;
  emptyDescription: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onSort?: (header: string) => void;
  minWidth?: number;
  footer?: ReactNode;
}

/**
 * Tabela institucional: sem raio, cabeçalho #F2F2F2 com texto 11/600
 * maiúsculo, linhas separadas por #ECECEC, hover #F7F7F7.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  emptyTitle,
  emptyDescription,
  loading,
  onRowClick,
  onSort,
  minWidth = 900,
  footer,
}: TableProps<T>) {
  if (loading) return <LoadingTable columns={columns.length} />;
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth }}>
          <thead>
            <tr className="bg-thead">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cx(
                    "border-b border-line px-3.5 py-2.5 text-micro font-semibold uppercase tracking-[0.5px] text-ink-2",
                    column.highlight && "bg-info-bg text-primary shadow-[inset_0_-2px_0_var(--color-primary)]",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                  )}
                >
                  {column.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.header)}
                      className="inline-flex items-center gap-1.5 uppercase hover:text-primary"
                    >
                      {column.header}
                      <Icon name="sort" size={12} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cx(
                  "border-b border-line-soft last:border-b-0",
                  onRowClick ? "cursor-pointer hover:bg-surface-alt" : "hover:bg-surface-alt",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cx(
                      "px-3.5 py-3 text-body text-ink align-middle",
                      column.highlight && "bg-[#f5f9fc]",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className="border-t border-line bg-surface px-3.5 py-2.5">{footer}</div>}
    </div>
  );
}
