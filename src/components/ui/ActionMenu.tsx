import { useEffect, useId, useRef, useState } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: IconName;
  /** Linha de apoio abaixo do rótulo, para explicar quando usar a ação. */
  description?: string;
  disabled?: boolean;
  /** Motivo exibido quando a ação está indisponível. */
  disabledReason?: string;
  danger?: boolean;
  /** Separa este item dos anteriores com uma linha. */
  separated?: boolean;
}

interface ActionMenuProps {
  label?: string;
  items: ActionMenuItem[];
  onSelect: (key: string) => void;
  /** Texto acessível com o contexto (ex.: número da solicitação). */
  ariaLabel?: string;
}

/**
 * Botão "Ações ▾" com menu suspenso. Substitui a fileira de ícones da tabela:
 * cada ação aparece por extenso, com explicação quando for útil.
 * O menu usa posição fixa para não ser cortado pela rolagem da tabela.
 */
export function ActionMenu({ label = "Ações", items, onSelect, ariaLabel }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function toggle() {
    if (open) return setOpen(false);
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])");
    first?.focus();

    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const list = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
        const i = list.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === "ArrowDown" ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
        list[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        className={cx(
          "inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-svm border bg-surface px-3 text-body font-semibold text-ink transition-colors hover:border-primary hover:text-primary",
          open ? "border-primary text-primary" : "border-field",
        )}
      >
        {label}
        <Icon name={open ? "chev-up" : "chev-down"} size={14} />
      </button>

      {open && pos && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-40 w-[290px] rounded-svm border border-line bg-surface py-1.5 text-left shadow-pop"
        >
          {items.map((item) => (
            <div key={item.key} className={cx(item.separated && "mt-1.5 border-t border-line-soft pt-1.5")}>
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  onSelect(item.key);
                }}
                className={cx(
                  "flex w-full items-start gap-2.5 px-3.5 py-2 text-left focus:bg-surface-alt focus:outline-none",
                  item.disabled ? "cursor-not-allowed" : "hover:bg-surface-alt",
                )}
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size={16}
                    className={cx("mt-0.5", item.disabled ? "text-ink-4" : item.danger ? "text-error" : "text-ink-2")}
                  />
                )}
                <span className="min-w-0">
                  <span
                    className={cx(
                      "block text-body",
                      item.disabled ? "text-ink-3" : item.danger ? "text-error" : "text-ink",
                    )}
                  >
                    {item.label}
                  </span>
                  {(item.disabled ? item.disabledReason : item.description) && (
                    <span className="mt-0.5 block text-aux text-ink-2">
                      {item.disabled ? item.disabledReason : item.description}
                    </span>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
