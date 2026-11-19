import type { ReactNode } from "react";
import type { InformacoesAdicionais, InformacoesModelo } from "../../types";
import { SECOES_INFORMACOES_MODELO } from "./dadosModelo";

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-label font-semibold uppercase tracking-[0.4px] text-ink-2">{label}</dt>
      <dd className="mt-1 text-body text-ink">{children || "—"}</dd>
    </div>
  );
}

const GRID = "grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3";

/** Leitura das Informações Adicionais (para quem não edita). */
export function ResumoInformacoesAdicionais({ dados }: { dados: InformacoesAdicionais }) {
  return (
    <dl className={GRID}>
      <Item label="Materialidade">{dados.materialidade}</Item>
      <Item label="Impacto na decisão">{dados.impactoDecisao}</Item>
      <Item label="Complexidade">{dados.complexidade}</Item>
      <Item label="O modelo utiliza novo algoritmo?">{dados.novoAlgoritmo}</Item>
      <Item label="O modelo foi desenvolvido para novo produto?">{dados.novoProduto}</Item>
      <Item label="Implementação automatizada via sistema?">{dados.implementacaoAutomatizada}</Item>
    </dl>
  );
}

/** Leitura das Informações do Modelo (para quem não edita). */
export function ResumoInformacoesModelo({ dados }: { dados: InformacoesModelo }) {
  return (
    <div className="flex flex-col divide-y divide-line-soft">
      {SECOES_INFORMACOES_MODELO.map((s) => {
        const texto = dados[s.campo]?.trim();
        if (!texto && !s.obrigatorio) return null;
        return (
          <section key={s.campo} className="py-5 first:pt-0 last:pb-0">
            <h3 className="mb-2 text-body font-semibold text-ink">{s.titulo}</h3>
            {texto ? (
              <p className="whitespace-pre-line text-body leading-relaxed text-ink">{texto}</p>
            ) : (
              <p className="text-body text-ink-3">Não preenchido.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
