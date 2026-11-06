import type { ReactNode } from "react";
import { Panel } from "../../components/ui/Panel";
import { Timeline } from "../../components/ui/Timeline";
import { Button } from "../../components/ui/Button";
import { Icon, type IconName } from "../../components/ui/Icon";
import { cx } from "../../components/ui/cx";
import type { TimelineEvent } from "../../types";
import { formatDate } from "./formatDate";

/** Partes comuns à página da solicitação e à página do modelo inventariado. */

export function Info({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cx("min-w-0", wide && "sm:col-span-2 lg:col-span-4")}>
      <dt className="text-label font-semibold uppercase tracking-[0.4px] text-ink-2">{label}</dt>
      <dd className="mt-1 text-body text-ink">{children}</dd>
    </div>
  );
}

const ICONE: Partial<Record<NonNullable<TimelineEvent["tipo"]>, IconName>> = {
  validada: "check",
  "enviada-gestor": "chev-right",
  "devolvida-analista": "arrow-left",
  "complementacao-pedida": "doc",
  "documento-adicionado": "paperclip",
  "situacao-alterada": "edit",
};

function tom(tipo: TimelineEvent["tipo"]) {
  if (tipo === "validada" || tipo === "complementacao-enviada") return "success" as const;
  if (tipo === "complementacao-pedida" || tipo === "devolvida-analista") return "warning" as const;
  return "default" as const;
}

/** Histórico (2/3) + lista de arquivos (1/3). */
export function HistoricoEArquivos({
  timeline,
  onAbrirAnexo,
}: {
  timeline: TimelineEvent[];
  onAbrirAnexo: (nome: string) => void;
}) {
  const arquivos = timeline.flatMap((e) => (e.anexos ?? []).map((nome) => ({ nome, data: e.data, autor: e.autor })));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel title="Histórico da solicitação">
        <Timeline
          items={timeline.map((e) => ({
            data: formatDate(e.data),
            descricao: e.descricao,
            autor: e.autor,
            detalhe: e.detalhe,
            anexos: e.anexos,
            onAbrirAnexo,
            icon: (e.tipo && ICONE[e.tipo]) ?? (e.anexos?.length ? "paperclip" : "clock"),
            tone: tom(e.tipo),
          }))}
        />
      </Panel>

      <Panel title={`Arquivos (${arquivos.length})`} bodyClassName="px-0 py-0">
        {arquivos.length === 0 ? (
          <p className="px-7 py-6 text-body text-ink-2">Nenhum arquivo anexado.</p>
        ) : (
          <ul>
            {arquivos.map((a, i) => (
              <li key={a.nome + i} className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-b-0">
                <Icon name="doc" size={18} className="text-ink-2" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-ink" title={a.nome}>
                    {a.nome}
                  </p>
                  <p className="text-aux text-ink-2">
                    {formatDate(a.data)}
                    {a.autor && ` · ${a.autor}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  icon="download"
                  onClick={() => onAbrirAnexo(a.nome)}
                  aria-label={`Baixar ${a.nome}`}
                  className="h-[34px] px-2"
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
