import { cx } from "./cx";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "warning" | "error" | "success";
  active?: boolean;
  onClick?: () => void;
}

const TONE_VALUE: Record<string, string> = {
  default: "text-ink",
  warning: "text-warning",
  error: "text-error",
  success: "text-success",
};

/** Card de resumo: número 26/300, rótulo maiúsculo 11.5, borda 1px. */
export function StatCard({ label, value, hint, tone = "default", active, onClick }: StatCardProps) {
  const classes = cx(
    "block min-w-0 rounded-svm border bg-surface px-5 py-4 text-left transition-colors",
    active ? "border-primary bg-info-bg" : "border-line",
    onClick && "hover:border-field",
  );

  const content = (
    <>
      <span className="block text-label uppercase tracking-[0.4px] text-ink-2">{label}</span>
      <span className={cx("mt-2 block text-[26px] font-light leading-none", TONE_VALUE[tone])}>{value}</span>
      {hint && <span className="mt-2 block text-aux text-ink-3">{hint}</span>}
    </>
  );

  if (!onClick) return <div className={classes}>{content}</div>;

  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={classes}>
      {content}
    </button>
  );
}
