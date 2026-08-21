import { ProfileSwitcher } from "./ProfileSwitcher";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:px-8">
      <span className="text-sm font-semibold text-slate-900 md:hidden">
        SVM
      </span>
      <div className="ml-auto">
        <ProfileSwitcher />
      </div>
    </header>
  );
}
