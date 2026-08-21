import { useProfile } from "../../context/ProfileContext";
import { currentUserNameByProfile } from "../../data/currentUser";
import { PROFILE_LABELS, type ModuleKey } from "../../types";

const ALL_NAV_ITEMS: { key: ModuleKey; label: string }[] = [
  { key: "novo-modelo", label: "Novo modelo" },
  { key: "consultar-modelo", label: "Consultar modelo" },
  { key: "gestao", label: "Gestão" },
];

interface SidebarProps {
  activeModule: ModuleKey;
  onSelect: (module: ModuleKey) => void;
}

export function Sidebar({ activeModule, onSelect }: SidebarProps) {
  const { profile } = useProfile();
  const navItems = ALL_NAV_ITEMS.filter(
    (item) => item.key !== "gestao" || profile !== "solicitante",
  );

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:h-full md:w-60 md:border-b-0 md:border-r">
      <div className="hidden border-b border-slate-200 px-5 py-5 md:block">
        <span className="text-sm font-bold tracking-wide text-slate-900">
          SVM
        </span>
        <p className="mt-0.5 text-xs text-slate-500">
          Sistema de Validação de Modelos
        </p>
      </div>
      <nav className="flex overflow-x-auto md:block md:flex-1 md:overflow-visible md:p-2">
        {navItems.map((item) => {
          const isActive = item.key === activeModule;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`shrink-0 whitespace-nowrap px-4 py-3 text-left text-sm font-medium transition-colors md:w-full md:rounded-md md:px-3 md:py-2.5 ${
                isActive
                  ? "border-b-2 border-blue-700 text-blue-700 md:border-b-0 md:bg-blue-50"
                  : "border-b-2 border-transparent text-slate-600 hover:text-slate-900 md:hover:bg-slate-50"
              }`}
            >
              {item.label.toUpperCase()}
            </button>
          );
        })}
      </nav>
      <div className="hidden border-t border-slate-200 px-5 py-4 md:block">
        <p className="text-sm font-semibold text-slate-900">
          {currentUserNameByProfile[profile]}
        </p>
        <p className="text-xs text-slate-500">{PROFILE_LABELS[profile]}</p>
      </div>
    </aside>
  );
}
