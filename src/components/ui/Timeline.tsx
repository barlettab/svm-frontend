import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export interface TimelineItem {
  data: string;
  descricao: string;
  autor?: string;
  /** Texto citado abaixo da descrição (ex.: o pedido do analista). */
  detalhe?: string;
  /** Arquivos anexados no evento. */
  anexos?: string[];
  onAbrirAnexo?: (nome: string) => void;
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
            {item.autor && <div className="mt-0.5 text-aux text-ink-2">por {item.autor}</div>}
            {item.detalhe && (
              <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-body text-ink-2">
                {item.detalhe}
              </blockquote>
            )}
            {item.anexos && item.anexos.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {item.anexos.map((nome) => (
                  <li key={nome}>
                    <button
                      type="button"
                      onClick={() => item.onAbrirAnexo?.(nome)}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-svm border border-line bg-surface-alt px-2.5 py-1 text-aux text-ink hover:border-primary hover:text-primary"
                    >
                      <Icon name="paperclip" size={13} className="text-ink-2" />
                      <span className="truncate">{nome}</span>
                      <Icon name="download" size={13} className="text-ink-2" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
