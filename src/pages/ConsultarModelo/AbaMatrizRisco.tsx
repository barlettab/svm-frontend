import { useState } from "react";
import { Panel, FormActions } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ReadOnlyField } from "../../components/ui/ReadOnlyField";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { cx } from "../../components/ui/cx";
import {
  classificacaoRisco,
  notaDoRotulo,
  notaOptions,
  rotuloNota,
  tierOptions,
} from "../../components/modelo/matrizRisco";
import type { MatrizRisco } from "../../types";
import { formatDateTime } from "./AbaCalculoTier";

type Dados = Pick<MatrizRisco, "prazoRevalidacaoMeses" | "alcadaSugerida" | "tier" | "nota">;

interface AbaMatrizRiscoProps {
  registros?: MatrizRisco[];
  /** Tier vindo do Cálculo do Tier; sugerido no primeiro preenchimento. */
  tierCalculado?: string;
  editavel: boolean;
  onRegistrar: (dados: Dados) => void;
}

const VAZIO = "—";

function inicial(ultimo: MatrizRisco | undefined, tierCalculado?: string) {
  return {
    prazo: ultimo?.prazoRevalidacaoMeses ?? "",
    alcada: ultimo?.alcadaSugerida ?? "",
    tier: ultimo?.tier ?? tierCalculado ?? "",
    nota: ultimo ? rotuloNota(ultimo.nota) : "",
  };
}

/**
 * Aba "Matriz de Risco": prazo de revalidação, alçada sugerida, Tier e Nota de Classificação.
 * A Classificação de Risco sai de Tier × Nota. Cada cálculo/recálculo fica no histórico.
 */
export function AbaMatrizRisco({ registros = [], tierCalculado, editavel, onRegistrar }: AbaMatrizRiscoProps) {
  const ultimo = registros[registros.length - 1];
  const [form, setForm] = useState(() => inicial(ultimo, tierCalculado));
  const [erros, setErros] = useState<{ prazo?: string; tier?: string; nota?: string }>({});

  const set = (campo: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [campo]: v }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const nota = form.nota ? notaDoRotulo(form.nota) : "";
  const classificacao = form.tier && nota ? classificacaoRisco(form.tier, nota) : undefined;
  const alterado = JSON.stringify(form) !== JSON.stringify(inicial(ultimo, tierCalculado));

  function registrar() {
    const e = {
      prazo: form.prazo.trim() && !/^\d+$/.test(form.prazo.trim()) ? "Informe a quantidade de meses." : undefined,
      tier: form.tier ? undefined : "Campo obrigatório",
      nota: form.nota ? undefined : "Campo obrigatório",
    };
    setErros(e);
    if (e.prazo || e.tier || e.nota) return;
    onRegistrar({
      prazoRevalidacaoMeses: form.prazo.trim() || undefined,
      alcadaSugerida: form.alcada.trim() || undefined,
      tier: form.tier,
      nota,
    });
  }

  if (!editavel && !ultimo) {
    return (
      <Panel title="Matriz de Risco">
        <EmptyState
          icon="clock"
          title="A Matriz de Risco ainda não foi preenchida."
          description="O analista preenche a matriz antes de enviar a solicitação ao gestor."
        />
      </Panel>
    );
  }

  const historico = [...registros].reverse();

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Matriz de Risco">
        {editavel ? (
          <>
            {!ultimo && (
              <p className="-mt-1 mb-6 text-body text-ink-2">
                {tierCalculado
                  ? `O Tier já vem do Cálculo do Tier (${tierCalculado}); altere se necessário. Obrigatório para enviar ao gestor.`
                  : "Obrigatório para enviar ao gestor."}
              </p>
            )}
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-4">
              <TextField
                id="matriz-prazo"
                label="Prazo de revalidação (meses)"
                inputMode="numeric"
                value={form.prazo}
                onChange={set("prazo")}
                placeholder="Ex.: 12"
                error={erros.prazo}
              />
              <div className="md:col-span-3">
                <TextField
                  id="matriz-alcada"
                  label="Alçada sugerida"
                  value={form.alcada}
                  onChange={set("alcada")}
                  maxLength={200}
                />
              </div>
              <SelectField
                id="matriz-tier"
                label="Tier"
                required
                value={form.tier}
                onChange={set("tier")}
                options={tierOptions}
                error={erros.tier}
              />
              <div className="md:col-span-2">
                <SelectField
                  id="matriz-nota"
                  label="Nota de classificação"
                  required
                  value={form.nota}
                  onChange={set("nota")}
                  options={notaOptions}
                  error={erros.nota}
                />
              </div>
              <ReadOnlyField label="Classificação de risco" value={classificacao ?? ""} />
            </div>
            <FormActions>
              {ultimo && (
                <Button
                  variant="secondary"
                  disabled={!alterado}
                  onClick={() => {
                    setForm(inicial(ultimo, tierCalculado));
                    setErros({});
                  }}
                >
                  Cancelar
                </Button>
              )}
              {ultimo ? (
                <Button variant="primary" icon="history" disabled={!alterado} onClick={registrar}>
                  Recalcular
                </Button>
              ) : (
                <Button variant="primary" icon="check" onClick={registrar}>
                  Calcular
                </Button>
              )}
            </FormActions>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-4">
            <ReadOnlyField label="Prazo de revalidação (meses)" value={ultimo.prazoRevalidacaoMeses ?? VAZIO} />
            <div className="md:col-span-3">
              <ReadOnlyField label="Alçada sugerida" value={ultimo.alcadaSugerida ?? VAZIO} />
            </div>
            <ReadOnlyField label="Tier" value={ultimo.tier} />
            <div className="md:col-span-2">
              <ReadOnlyField label="Nota de classificação" value={rotuloNota(ultimo.nota)} />
            </div>
            <ReadOnlyField label="Classificação de risco" value={ultimo.classificacaoRisco} />
          </div>
        )}
      </Panel>

      {historico.length > 0 && (
        <Panel title="Histórico Matriz de Risco">
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-thead">
                  {["Descrição", "Tier", "Nota", "Classificação de risco", "Prazo (meses)", "Alçada sugerida", "Data", "Usuário"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-line px-3.5 py-2.5 text-micro font-semibold uppercase tracking-[0.5px] text-ink-2"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {historico.map((r, i) => (
                  <tr key={r.id} className={cx("border-b border-line-soft", i === 0 && "bg-info-bg")}>
                    <td className="px-3.5 py-3 text-body text-ink">{r.tipo}</td>
                    <td className="px-3.5 py-3 text-body text-ink">{r.tier}</td>
                    <td className="px-3.5 py-3 text-body text-ink" title={rotuloNota(r.nota)}>
                      {r.nota}
                    </td>
                    <td className="px-3.5 py-3 text-body text-ink">{r.classificacaoRisco}</td>
                    <td className="px-3.5 py-3 text-body text-ink">{r.prazoRevalidacaoMeses ?? VAZIO}</td>
                    <td className="px-3.5 py-3 text-body text-ink">{r.alcadaSugerida ?? VAZIO}</td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-body text-ink">{formatDateTime(r.data)}</td>
                    <td className="px-3.5 py-3 text-body text-ink">{r.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-aux text-ink-3">
            {historico.length} {historico.length === 1 ? "registro" : "registros"} · o mais recente aparece primeiro.
          </p>
        </Panel>
      )}
    </div>
  );
}
