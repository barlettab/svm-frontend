interface StatCardProps {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
}

export function StatCard({ label, value, active, onClick }: StatCardProps) {
  const baseClasses =
    "rounded-lg border px-5 py-4 text-left transition-colors";
  const stateClasses = active
    ? "border-blue-600 bg-blue-50"
    : "border-slate-200 bg-white";
  const interactiveClasses = onClick
    ? "hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
    : "";

  const content = (
    <>
      <span className="block text-2xl font-bold text-slate-900">{value}</span>
      <span className="mt-1 block text-sm text-slate-500">{label}</span>
    </>
  );

  if (!onClick) {
    return <div className={`${baseClasses} ${stateClasses}`}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${baseClasses} ${stateClasses} ${interactiveClasses}`}
    >
      {content}
    </button>
  );
}
