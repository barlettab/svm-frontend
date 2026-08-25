import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { currentUserNameByProfile } from "../../data/currentUser";
import { PROFILE_LABELS, type ModuleKey } from "../../types";
import { cx } from "../ui/cx";
import { Icon } from "../ui/Icon";
import { isGroup, navForProfile, type NavGroup, type NavLeaf } from "./navConfig";

interface SidebarProps {
  activeModule: ModuleKey;
  onSelect: (module: ModuleKey) => void;
  /** Aba ativa dentro do módulo — opcional; sem ela o item-folha só troca de módulo. */
  activeSection?: string;
  onSelectSection?: (module: ModuleKey, section?: string) => void;
  /** Overlay em telas < 1024px. */
  open?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar da referência: 265px, fundo #1F6CB0, marca #175C99 (66px),
 * grupos em pill #4A90C8, folha ativa em pill claro #E9EFF3 com texto #2B6FA8.
 */
export function Sidebar({
  activeModule,
  onSelect,
  activeSection,
  onSelectSection,
  open = false,
  onClose,
}: SidebarProps) {
  const { profile } = useProfile();
  const tree = navForProfile(profile);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLeaf = (leaf: NavLeaf) => {
    if (onSelectSection) onSelectSection(leaf.module, leaf.section);
    else onSelect(leaf.module);
    onClose?.();
  };

  const renderItems = (items: (NavLeaf | NavGroup)[], depth: number) =>
    items.map((item) => {
      if (isGroup(item)) {
        const isOpen = !collapsed[item.key];
        return (
          <div key={item.key} className={cx("flex flex-col gap-0.5", depth > 0 && "ml-2")}>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              aria-expanded={isOpen}
              className={cx(
                "flex h-[34px] items-center justify-between gap-2 rounded-nav bg-nav-group px-3 text-left text-nav text-white transition-colors hover:bg-nav-hover",
                depth === 0 ? "pl-3" : "pl-4",
              )}
            >
              <span className="truncate">{item.label}</span>
              <Icon name={isOpen ? "chev-up" : "chev-down"} size={12} strokeWidth={2.4} />
            </button>
            {isOpen && <div className="flex flex-col gap-0.5">{renderItems(item.children, depth + 1)}</div>}
          </div>
        );
      }

      const isActive =
        item.module === activeModule &&
        (item.section === undefined || item.section === activeSection);

      return (
        <button
          key={item.key}
          type="button"
          onClick={() => handleLeaf(item)}
          aria-current={isActive ? "page" : undefined}
          className={cx(
            "ml-2 flex h-[34px] items-center rounded-svm text-left text-nav transition-colors",
            depth === 1 ? "pl-7 pr-3" : "pl-9 pr-3",
            isActive
              ? "bg-nav-active font-semibold text-nav-active-ink"
              : "text-white hover:bg-nav-hover",
          )}
        >
          <span className="truncate">{item.label}</span>
        </button>
      );
    });

  return (
    <>
      {open && <button type="button" aria-label="Fechar menu" onClick={onClose} className="fixed inset-0 z-40 bg-[rgba(45,45,45,0.4)] lg:hidden" />}

      <aside
        className={cx(
          "z-40 flex w-[265px] shrink-0 flex-col bg-nav",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:transition-transform",
          open ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        )}
      >
        <div className="flex h-[66px] shrink-0 items-center gap-3 bg-nav-brand px-[18px]">
          {/* placeholder de marca — substituir pelo logotipo institucional */}
          <span className="flex h-8 w-8 items-center justify-center rounded-svm border border-white/45 text-micro font-semibold uppercase text-white/80">
            logo
          </span>
          <span className="text-ident font-semibold text-white">SVM</span>
        </div>

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
          <button
            type="button"
            onClick={() => toggle(tree.key)}
            aria-expanded={!collapsed[tree.key]}
            className="flex h-[34px] items-center justify-between gap-2 rounded-nav bg-nav-group px-3 text-nav font-semibold text-white transition-colors hover:bg-nav-hover"
          >
            {tree.label}
            <Icon name={collapsed[tree.key] ? "chev-down" : "chev-up"} size={13} strokeWidth={2.4} />
          </button>
          {!collapsed[tree.key] && <div className="flex flex-col gap-0.5">{renderItems(tree.children, 1)}</div>}
        </nav>

      </aside>
    </>
  );
}
