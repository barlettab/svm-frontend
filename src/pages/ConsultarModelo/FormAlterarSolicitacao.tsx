import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { MultiFileUpload, INFO_ANEXOS } from "../../components/ui/MultiFileUpload";
import { anexosDaSolicitacao } from "./fluxo";
import { areaGestoraOptions, assuntoOptions, publicoOptions, tipoModeloOptions } from "../../data/options";
import type { DadosSolicitacao } from "../../context/SolicitacoesContext";
import type { Solicitacao } from "../../types";

type Campos = Required<{ [K in keyof DadosSolicitacao]: string }>;

interface FormAlterarSolicitacaoProps {
  solicitacao: Solicitacao;
  /** GEVAM (analista responsável ou gestor) edita em qualquer status em andamento, sem mexer nos anexos. */
  porGevam?: boolean;
  /**
   * GEVAM (analista e gestor): só troca o solicitante. Os dados informados pelo solicitante aparecem
   * só para leitura (a GEVAM edita o que ela mesma inseriu nas abas de análise).
   */
  soSolicitante?: boolean;
  onCancelar: () => void;
  /**
   * anexos: anexos já enviados que o solicitante removeu e os novos que incluiu (só solicitante).
   * solicitante: quem passa a ser o solicitante (só analista/gestor; igual ao atual se não mudou).
   */
  onConfirmar: (
    campos: DadosSolicitacao,
    anexos?: { removidos: string[]; novos: string[] },
    solicitante?: string,
  ) => void;
}

/**
 * "Editar solicitação": o solicitante corrige os dados que enviou na submissão.
 * Só existe enquanto a solicitação está Submetido (nenhum analista assumiu). Pode também
 * remover anexos já enviados (são descartados) e incluir quantos novos precisar; precisa
 * sobrar pelo menos um anexo.
 * O analista responsável e o gestor também editam (porGevam), em qualquer status em andamento,
 * e podem trocar o solicitante aqui mesmo; para eles não há o campo Anexo(s) (documentos
 * entram por Acrescentar documentação).
 */
export function FormAlterarSolicitacao({ solicitacao: s, porGevam, soSolicitante, onCancelar, onConfirmar }: FormAlterarSolicitacaoProps) {
  const [form, setForm] = useState<Campos>({
    nomeModelo: s.nomeModelo,
    tipoModelo: s.tipoModelo ?? "",
    areaGestora: s.areaGestora,
    assunto: s.assunto,
    publico: s.publico,
    objetivo: s.objetivo ?? "",
  });
  const [erros, setErros] = useState<Partial<Record<keyof Campos | "anexos" | "solicitante", string>>>({});
  const [novosAnexos, setNovosAnexos] = useState<File[]>([]);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [solicitante, setSolicitante] = useState(s.solicitante);
  const mantidos = anexosDaSolicitacao(s).filter((a) => !removidos.includes(a));

  const set = (campo: keyof Campos) => (valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  function confirmar() {
    const novos: Partial<Record<keyof Campos | "anexos" | "solicitante", string>> = {};
    (Object.keys(form) as (keyof Campos)[]).forEach((c) => {
      if (!form[c].trim()) novos[c] = "Campo obrigatório";
    });
    if (!porGevam && mantidos.length + novosAnexos.length === 0) novos.anexos = "Campo obrigatório";
    if (porGevam && !solicitante.trim()) novos.solicitante = "Campo obrigatório";
    setErros(novos);
    if (Object.keys(novos).length) return;
    onConfirmar(
      { ...form, nomeModelo: form.nomeModelo.trim(), objetivo: form.objetivo.trim() },
      porGevam ? undefined : { removidos, novos: novosAnexos.map((f) => f.name) },
      porGevam ? solicitante.trim() : undefined,
    );
  }

  return (
    <Panel title="Editar solicitação" className="border-info-line">
      <div className="flex flex-col gap-5">
        <p className="text-body text-ink-2">
          {soSolicitante
            ? "Você pode trocar o solicitante. Os dados abaixo foram informados pelo solicitante e não podem ser alterados pela GEVAM. O status não muda e a alteração fica registrada no histórico."
            : porGevam
            ? "Corrija os dados informados pelo solicitante ou troque o solicitante. O status não muda e a alteração fica registrada no histórico."
            : "Você pode alterar os dados enquanto nenhum analista assumiu a solicitação. A alteração fica registrada no histórico."}
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {porGevam && (
            <TextField
              id="alterar-solicitante"
              label="Solicitante"
              required
              value={solicitante}
              onChange={(v) => {
                setSolicitante(v);
                setErros((e) => ({ ...e, solicitante: undefined }));
              }}
              placeholder="Nome do novo solicitante"
              error={erros.solicitante}
            />
          )}
          <TextField
            id="alterar-nome"
            disabled={soSolicitante}
            label="Nome do modelo"
            required
            value={form.nomeModelo}
            onChange={set("nomeModelo")}
            error={erros.nomeModelo}
            fullWidth
          />
          <SelectField
            id="alterar-assunto"
            disabled={soSolicitante}
            label="Assunto"
            required
            value={form.assunto}
            onChange={set("assunto")}
            options={assuntoOptions}
            error={erros.assunto}
          />
          <SelectField
            id="alterar-tipo"
            disabled={soSolicitante}
            label="Tipo de modelo"
            required
            value={form.tipoModelo}
            onChange={set("tipoModelo")}
            options={tipoModeloOptions}
            error={erros.tipoModelo}
          />
          <SelectField
            id="alterar-area"
            disabled={soSolicitante}
            label="Área gestora"
            required
            value={form.areaGestora}
            onChange={set("areaGestora")}
            options={areaGestoraOptions}
            error={erros.areaGestora}
          />
          <SelectField
            id="alterar-publico"
            disabled={soSolicitante}
            label="Público"
            required
            value={form.publico}
            onChange={set("publico")}
            options={publicoOptions}
            error={erros.publico}
          />
          <TextField
            id="alterar-objetivo"
            disabled={soSolicitante}
            label="Objetivo"
            required
            value={form.objetivo}
            onChange={set("objetivo")}
            error={erros.objetivo}
            maxLength={500}
            fullWidth
          />
        </div>
        {porGevam && solicitante.trim() && solicitante.trim() !== s.solicitante && (
          <p className="-mt-1 text-aux text-ink-2">
            O solicitante passa de <b className="text-ink">{s.solicitante}</b> para{" "}
            <b className="text-ink">{solicitante.trim()}</b>, que passa a acompanhar a solicitação e a responder às
            complementações.
          </p>
        )}
        {!porGevam && (
          <MultiFileUpload
            id="alterar-anexos"
            label="Anexo(s)"
            info={INFO_ANEXOS}
            required
            existentes={mantidos}
            onRemoverExistente={(nome) => {
              setRemovidos((r) => [...r, nome]);
            }}
            files={novosAnexos}
            onChange={(fs) => {
              setNovosAnexos(fs);
              setErros((e) => ({ ...e, anexos: undefined }));
            }}
            error={erros.anexos}
            hint="Remova o que não vale mais e inclua quantos arquivos precisar. O que for removido não fica salvo."
          />
        )}
        <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="primary" icon="check" onClick={confirmar}>
            Salvar alterações
          </Button>
        </div>
      </div>
    </Panel>
  );
}
