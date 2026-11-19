import { Fragment, useState, type ReactNode } from "react";
import { Panel, FormActions } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Icon } from "../../components/ui/Icon";
import { ReadOnlyField } from "../../components/ui/ReadOnlyField";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { cx } from "../../components/ui/cx";
import { CamposInformacoesAdicionais } from "../../components/modelo/CamposDadosModelo";
import { ResumoInformacoesAdicionais } from "../../components/modelo/ResumoDadosModelo";
import {
  INFORMACOES_VAZIAS,
  semErros,
  validarInformacoes,
  type Erros,
} from "../../components/modelo/dadosModelo";
import { calcularPontuacao, TIERS, tierDaPontuacao, ultimos } from "../../components/modelo/tier";
import type { CalculoTier, InformacoesAdicionais } from "../../types";

const SEM_OVERRIDE = "Não";

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const formatMrm = (v?: number) => (v === undefined ? "—" : v > 0 ? `+${v}` : String(v));

/** Seção recolhível, como "Parâmetros do Cálculo" na referência. */
function Secao({
  titulo,
  aberta,
  onToggle,
  children,
}: {
  titulo: string;
  aberta: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={aberta}
        className="mb-4 flex items-center gap-2 text-section font-semibold text-ink hover:text-primary"
      >
        <Icon name={aberta ? "chev-up" : "chev-down"} size={15} />
        {titulo}
      </button>
      {aberta && children}
    </div>
  );
}

interface AbaCalculoTierProps {
  /** Parâmetros salvos (= Informações Adicionais da solicitação). */
  informacoes?: InformacoesAdicionais;
  calculos?: CalculoTier[];
  /** Analista com a solicitação em mãos pode calcular e recalcular. */
  editavel: boolean;
  /** Primeiro cálculo: salva os parâmetros e registra "Cálculo". */
  onCalcular: (parametros: InformacoesAdicionais) => void;
  /** Recálculo: parâmetros (podem mudar), ajuste de MRM e override; registra "Recálculo". */
  onRecalcular: (dados: { parametros: InformacoesAdicionais; ajusteMrm?: number; override?: string }) => void;
}

/**
 * Aba "Cálculo do Tier" (inclui o que era a aba Informações Adicionais):
 * parâmetros do cálculo → resultado do cálculo/recálculo → ajuste de MRM e override → histórico.
 */
export function AbaCalculoTier({ informacoes, calculos = [], editavel, onCalcular, onRecalcular }: AbaCalculoTierProps) {
  const { calculo, recalculo } = ultimos(calculos);

  const [parametros, setParametros] = useState<InformacoesAdicionais>(informacoes ?? INFORMACOES_VAZIAS);
  const [erros, setErros] = useState<Erros<InformacoesAdicionais>>({});
  const [mrm, setMrm] = useState(recalculo?.ajusteMrm !== undefined ? String(recalculo.ajusteMrm) : "");
  const [mrmErro, setMrmErro] = useState<string>();
  const [override, setOverride] = useState(recalculo?.override ?? SEM_OVERRIDE);
  const [parametrosAbertos, setParametrosAbertos] = useState(true);
  const [historicoAberto, setHistoricoAberto] = useState(true);
  const [expandida, setExpandida] = useState<string | null>(null);

  const mrmNumero = mrm.trim() === "" ? undefined : Number(mrm.trim().replace(",", "."));
  const mrmValido = mrmNumero === undefined || Number.isInteger(mrmNumero);
  const parametrosCompletos = semErros(validarInformacoes(parametros));
  const previa = parametrosCompletos && mrmValido ? calcularPontuacao(parametros) + (mrmNumero ?? 0) : undefined;

  function validarParametros() {
    const e = validarInformacoes(parametros);
    setErros(e);
    return semErros(e);
  }

  function calcular() {
    if (validarParametros()) onCalcular(parametros);
  }

  function recalcular() {
    const okParametros = validarParametros();
    setMrmErro(mrmValido ? undefined : "Informe um número inteiro de pontos (ex.: 5 ou -10).");
    if (!okParametros || !mrmValido) return;
    onRecalcular({ parametros, ajusteMrm: mrmNumero, override: override === SEM_OVERRIDE ? undefined : override });
  }

  // Quem não edita e ainda não há cálculo: nada a mostrar.
  if (!editavel && !calculo) {
    return (
      <Panel title="Resultado do cálculo">
        <EmptyState
          icon="clock"
          title="O Tier ainda não foi calculado."
          description="O analista preenche os parâmetros e calcula o Tier antes de enviar a solicitação ao gestor."
        />
      </Panel>
    );
  }

  const historico = [...calculos].reverse();

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Resultado do cálculo">
        <div className="flex flex-col gap-6">
          <Secao titulo="Parâmetros do cálculo" aberta={parametrosAbertos} onToggle={() => setParametrosAbertos((v) => !v)}>
            {editavel ? (
              <>
                {!calculo && (
                  <p className="-mt-1 mb-5 text-body text-ink-2">
                    Informações utilizadas no cálculo do Tier. Obrigatório para enviar ao gestor.
                  </p>
                )}
                <CamposInformacoesAdicionais
                  idPrefix="tier"
                  value={parametros}
                  onChange={(v) => {
                    setParametros(v);
                    setErros({});
                  }}
                  errors={erros}
                />
              </>
            ) : (
              <ResumoInformacoesAdicionais dados={(recalculo ?? calculo)!.parametros} />
            )}
          </Secao>

          {calculo && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 border-t border-line-soft pt-6 md:grid-cols-2">
              <ReadOnlyField label="Resultado do cálculo" value={String(calculo.resultado)} />
              <ReadOnlyField label="Resultado do recálculo" value={recalculo ? String(recalculo.resultado) : ""} />
              <ReadOnlyField label="Tier cálculo" value={calculo.tier} />
              <ReadOnlyField label="Tier recálculo" value={recalculo?.tier ?? ""} />

              {editavel && (
                <>
                  <TextField
                    id="tier-mrm"
                    label="Ajustes de MRM"
                    inputMode="numeric"
                    value={mrm}
                    onChange={(v) => {
                      setMrm(v);
                      setMrmErro(undefined);
                    }}
                    placeholder="Ex.: 5 ou -10"
                    hint="Pontos somados ao resultado. Use número negativo para reduzir."
                    error={mrmErro}
                  />
                  <SelectField
                    id="tier-override"
                    label="Override"
                    value={override}
                    onChange={setOverride}
                    options={[SEM_OVERRIDE, ...TIERS]}
                  />
                </>
              )}
            </div>
          )}

          {editavel && (
            <FormActions align="between">
              <p className="text-aux text-ink-2">
                {previa !== undefined ? (
                  <>
                    Prévia: <b className="text-ink">{previa} pontos</b> ·{" "}
                    <b className="text-ink">
                      {calculo && override !== SEM_OVERRIDE ? `${override} (override)` : tierDaPontuacao(previa)}
                    </b>
                  </>
                ) : (
                  "Preencha todos os parâmetros para ver a prévia."
                )}
              </p>
              {calculo ? (
                <Button variant="primary" icon="history" onClick={recalcular}>
                  Recalcular
                </Button>
              ) : (
                <Button variant="primary" icon="check" onClick={calcular}>
                  Calcular Tier
                </Button>
              )}
            </FormActions>
          )}
        </div>
      </Panel>

      {historico.length > 0 && (
        <Panel>
          <Secao
            titulo="Histórico cálculo e recálculo"
            aberta={historicoAberto}
            onToggle={() => setHistoricoAberto((v) => !v)}
          >
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="bg-thead">
                    {["Detalhes", "Descrição", "Resultado", "Tier", "MRM", "Override", "Data", "Usuário"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-line px-3.5 py-2.5 text-micro font-semibold uppercase tracking-[0.5px] text-ink-2"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map((c, i) => {
                    const aberta = expandida === c.id;
                    return (
                      <Fragment key={c.id}>
                        <tr className={cx("border-b border-line-soft", i === 0 && "bg-info-bg")}>
                          <td className="px-3.5 py-3">
                            <button
                              type="button"
                              onClick={() => setExpandida(aberta ? null : c.id)}
                              aria-expanded={aberta}
                              aria-label={aberta ? "Ocultar parâmetros" : "Ver parâmetros"}
                              className="inline-flex size-8 items-center justify-center rounded-svm text-primary hover:bg-surface-alt"
                            >
                              <Icon name={aberta ? "chev-up" : "plus"} size={15} />
                            </button>
                          </td>
                          <td className="px-3.5 py-3 text-body text-ink">{c.tipo}</td>
                          <td className="px-3.5 py-3 text-body text-ink">{c.resultado}</td>
                          <td className="px-3.5 py-3 text-body text-ink">{c.tier}</td>
                          <td className="px-3.5 py-3 text-body text-ink">{formatMrm(c.ajusteMrm)}</td>
                          <td className="px-3.5 py-3 text-body text-ink">{c.override ?? "Não"}</td>
                          <td className="whitespace-nowrap px-3.5 py-3 text-body text-ink">{formatDateTime(c.data)}</td>
                          <td className="px-3.5 py-3 text-body text-ink">{c.usuario}</td>
                        </tr>
                        {aberta && (
                          <tr className="border-b border-line-soft bg-surface-alt">
                            <td colSpan={8} className="px-6 py-5">
                              <p className="mb-4 text-aux text-ink-2">
                                Pontuação dos parâmetros: <b className="text-ink">{c.pontuacaoBase}</b> · Ajuste de MRM:{" "}
                                <b className="text-ink">{formatMrm(c.ajusteMrm)}</b> · Resultado:{" "}
                                <b className="text-ink">{c.resultado}</b>
                              </p>
                              <ResumoInformacoesAdicionais dados={c.parametros} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-aux text-ink-3">
              {historico.length} {historico.length === 1 ? "registro" : "registros"} · o mais recente aparece primeiro.
            </p>
          </Secao>
        </Panel>
      )}
    </div>
  );
}
