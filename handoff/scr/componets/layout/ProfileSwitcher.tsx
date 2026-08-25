import { useProfile } from "../../context/ProfileContext";
import { PROFILE_LABELS, type Profile } from "../../types";
import { Icon } from "../ui/Icon";

const PROFILES: Profile[] = ["solicitante", "analista", "gestor"];

export function ProfileSwitcher() {
  const { profile, setProfile } = useProfile();

  return (
    <label className="flex items-center gap-2">
      <span className="hidden text-aux text-ink-3 sm:inline">Visualizar como</span>
      <span className="relative">
        <select
          value={profile}
          onChange={(e) => setProfile(e.target.value as Profile)}
          className="h-[32px] appearance-none rounded-svm border border-field bg-white pl-2.5 pr-8 text-body text-ink"
        >
          {PROFILES.map((p) => (
            <option key={p} value={p}>
              {PROFILE_LABELS[p]}
            </option>
          ))}
        </select>
        <Icon name="chev-down" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-2" />
      </span>
    </label>
  );
}
