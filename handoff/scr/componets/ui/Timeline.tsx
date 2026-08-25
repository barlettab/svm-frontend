import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export interface TimelineItem {
  data: string;
  descricao: string;
  autor?: string;
  icon?: IconName;
  tone?: "default" | "success" | "warning" | "error";
}

const DOT_TONE: Record<string, string> = {
  default: "border-line bg-white text-ink-2",
  success: "border-success-line bg-success-bg text-success",
  warning: "border-warning-line bg-warning-bg text-warning",
  error: "border-error-line bg-error-bg text-error",
};

/** Histórico da solicitação — trilha vertical com marcador de 26px. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-[13px] border-l border-line">
      {items.map((item, index) => (
        <li key={item.data + index} className="relative pb-6 pl-6 last:pb-0">
          <span
            className={cx(
              "absolute -left-[13px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border",
              DOT_TONE[item.tone ?? "default"],
            )}
          >
            <Icon name={item.icon ?? "clock"} size={13} />
          </span>
          <div className="pt-1">
            <div className="text-aux text-ink-3">{item.data}</div>
            <div className="mt-1 text-body text-ink">{item.descricao}</div>
            {item.autor && <div className="mt-0.5 text-aux text-ink-3">{item.autor}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
