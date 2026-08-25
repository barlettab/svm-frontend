import type { ReactNode } from "react";
import { Button } from "./Button";

interface FilterBarProps {
  children: ReactNode;
  onSearch: () => void;
  onClear: () => void;
  searching?: boolean;
  extraActions?: ReactNode;
}

/** Bloco de pesquisa da referência: campos em grid + Limpar / Pesquisar à direita. */
export function FilterBar({ children, onSearch, onClear, searching, extraActions }: FilterBarProps) {
  return (
    <section className="mb-5 rounded-svm border border-line bg-surface px-7 py-6">
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 lg:grid-cols-4">{children}</div>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-line-soft pt-5">
        {extraActions}
        <Button variant="secondary" icon="eraser" onClick={onClear}>
          Limpar
        </Button>
        <Button variant="primary" icon="search" loading={searching} onClick={onSearch}>
          Pesquisar
        </Button>
      </div>
    </section>
  );
}
