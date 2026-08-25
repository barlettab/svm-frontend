import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";

export interface Crumb {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  onBack?: () => void;
}

/** Título 22/300 #555, breadcrumb 12px acima, ações à direita. */
export function PageHeader({ title, description, crumbs, actions, onBack }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Trilha de navegação" className="mb-2.5 flex flex-wrap items-center gap-1.5 text-aux text-ink-3">
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chev-right" size={11} className="text-ink-4" />}
              {crumb.onClick ? (
                <button type="button" onClick={crumb.onClick} className="text-primary hover:underline">
                  {crumb.label}
                </button>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-svm border border-line bg-white text-ink-2 hover:border-field hover:text-ink"
            >
              <Icon name="arrow-left" size={17} />
            </button>
          )}
          <div>
            <h1 className="text-page font-light text-ink-title">{title}</h1>
            {description && <p className="mt-1.5 text-body text-ink-3">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
