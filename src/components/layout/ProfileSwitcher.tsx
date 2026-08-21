import { useProfile } from "../../context/ProfileContext";
import { PROFILE_LABELS, type Profile } from "../../types";

const PROFILES: Profile[] = ["solicitante", "analista", "gestor"];

export function ProfileSwitcher() {
  const { profile, setProfile } = useProfile();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-slate-500 sm:inline">Visualizar como</span>
      <select
        value={profile}
        onChange={(e) => setProfile(e.target.value as Profile)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
      >
        {PROFILES.map((p) => (
          <option key={p} value={p}>
            {PROFILE_LABELS[p]}
          </option>
        ))}
      </select>
    </label>
  );
}
