import { ProfileSwitcher } from "./ProfileSwitcher";
import { IconButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useProfile } from "../../context/ProfileContext";
import { currentUserNameByProfile } from "../../data/currentUser";

/** Header 56px, branco, borda inferior 1px, ações à direita. */
export function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { profile } = useProfile();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 md:px-7">
      {onOpenMenu && (
        <IconButton icon="menu" label="Abrir menu" onClick={onOpenMenu} className="lg:hidden" />
      )}

      <span className="text-ident text-ink md:hidden">SVM</span>

      <div className="ml-auto flex items-center gap-1.5">
        <ProfileSwitcher />
        <span className="mx-1 hidden h-6 w-px bg-line md:block" />
        <IconButton icon="bell" label="Notificações" />
        <IconButton icon="help" label="Ajuda" />
        <span className="hidden items-center gap-2 pl-1.5 md:flex">
          <Icon name="user" size={17} className="text-ink-2" />
          <span className="text-body text-ink">{currentUserNameByProfile[profile]}</span>
        </span>
      </div>
    </header>
  );
}
