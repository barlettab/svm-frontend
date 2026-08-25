import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";

const BASE =
  "inline-flex h-[38px] items-center justify-center gap-2 rounded-svm px-6 text-body font-normal whitespace-nowrap transition-colors disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  // ação padrão da referência: cinza sólido (Pesquisar, Salvar, Confirmar)
  primary:
    "bg-action text-white hover:bg-action-hover disabled:bg-[#c4c4c4] disabled:text-white/80",
  // contorno cinza (Limpar, Cancelar, Voltar)
  secondary:
    "border border-[#9a9a9a] bg-white text-ink-2 hover:bg-surface-alt hover:text-ink disabled:border-line disabled:text-ink-4 disabled:bg-white",
  // sem moldura, apenas texto
  ghost:
    "px-3 text-ink-2 hover:bg-surface-alt hover:text-ink disabled:text-ink-4",
  // destrutivo — só quando a ação é irreversível
  danger:
    "bg-error text-white hover:bg-[#95302a] disabled:bg-[#d3a9a6]",
  // ação inline em tabela / texto
  link: "h-auto px-0 text-body text-primary underline-offset-2 hover:underline disabled:text-ink-4 disabled:no-underline",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  block?: boolean;
}

export function Button({
  variant = "primary",
  icon,
  iconRight,
  loading,
  block,
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(BASE, VARIANTS[variant], block && "w-full", className)}
      {...rest}
    >
      {loading ? (
        <Icon name="spinner" size={15} className="animate-[svm-spin_1.1s_linear_infinite]" />
      ) : (
        icon && <Icon name={icon} size={15} />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={15} />}
    </button>
  );
}

/** Botão só-ícone, usado na coluna de ações das tabelas. Alvo de 34×34. */
export function IconButton({
  icon,
  label,
  className,
  ...rest
}: { icon: IconName; label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cx(
        "inline-flex h-[34px] w-[34px] items-center justify-center rounded-svm text-ink-2 transition-colors hover:bg-surface-alt hover:text-primary disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:bg-transparent",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}
