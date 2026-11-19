import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { FileUpload } from "../../components/ui/FileUpload";
import { relatorioAtual } from "./fluxo";
import { solicitanteOptions } from "../../data/filterOptions";
import { areaGestoraOptions, assuntoOptions, publicoOptions, tipoModeloOptions } from "../../data/options";
import type { DadosSolicitacao } from "../../context/SolicitacoesContext";
import type { Solicitacao } from "../../types";

type Campos = Required<{ [K in keyof DadosSolicitacao]: string }>;

interface FormAlterarSolicitacaoProps {
  solicitacao: Solicitacao;
  /** GEVAM (analista responsável ou gestor) edita em qualquer status em andamento, sem trocar o relatório. */
  porGevam?: boolean;
  onCancelar: () => void;
  /**
   * novoRelatorio: nome do arquivo que substitui o relatório de desenvolvimento (só solicitante).
   * solicitante: quem passa a ser o solicitante (só analista/gestor; igual ao atual se não mudou).
   */
  onConfirmar: (campos: DadosSolicitacao, novoRelatorio?: string, solicitante?: string) => void;
}

/**
 * "Editar solicitação": o solicitante corrige os dados que enviou na submissão.
 * Só existe enquanto a solicitação está Submetido (nenhum analista assumiu). Pode também
 * substituir o relatório de desenvolvimento; o arquivo anterior é descartado.
 * O analista responsável e o gestor também editam (porGevam), em qualquer status em andamento,
 * e podem trocar o solicitante aqui mesmo; para eles não há troca de relatório (documentos
 * entram por Acrescentar documentação).
 */
export function FormAlterarSolicitacao({ solicitacao: s, porGevam, onCancelar, onConfirmar }: FormAlterarSolicitacaoProps) {
  const [form, setForm] = useState<Campos>({
    nomeModelo: s.nomeModelo,
    tipoModelo: s.tipoModelo ?? "",
    areaGestora: s.areaGestora,
    assunto: s.assunto,
    publico: s.publico,
    objetivo: s.objetivo ?? "",
  });
  const [erros, setErros] = useState<Partial<Record<keyof Campos | "relatorio", string>>>({});
  const [novoRelatorio, setNovoRelatorio] = useState<File | null>(null);
  const [solicitante, setSolicitante] = useState(s.solicitante);
  const opcoesSolicitante = solicitanteOptions.includes(s.solicitante)
    ? solicitanteOptions
    : [s.solicitante, ...solicitanteOptions];
  const atual = relatorioAtual(s);

  const set = (campo: keyof Campos) => (valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  function confirmar() {
    const novos: Partial<Record<keyof Campos | "relatorio", string>> = {};
    (Object.keys(form) as (keyof Campos)[]).forEach((c) => {
      if (!form[c].trim()) novos[c] = "Campo obrigatório";
    });
    if (novoRelatorio && !/\.pdf$/i.test(novoRelatorio.name)) novos.relatorio = "O relatório deve ser um arquivo PDF.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    onConfirmar(
      { ...form, nomeModelo: form.nomeModelo.trim(), objetivo: form.objetivo.trim() },
      novoRelatorio?.name,
      porGevam ? solicitante : undefined,
    );
  }

  return (
    <Panel title="Editar solicitação" className="border-info-line">
      <div className="flex flex-col gap-5">
        <p className="text-body text-ink-2">
          {porGevam
            ? "Corrija os dados informados pelo solicitante ou troque o solicitante. O status não muda e a alteração fica registrada no histórico."
            : "Você pode alterar os dados enquanto nenhum analista assumiu a solicitação. A alteração fica registrada no histórico."}
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {porGevam && (
            <SelectField
              id="alterar-solicitante"
              label="Solicitante"
              required
              value={solicitante}
              onChange={setSolicitante}
              options={opcoesSolicitante}
            />
          )}
          <TextField
            id="alterar-nome"
            label="Nome do modelo"
            required
            value={form.nomeModelo}
            onChange={set("nomeModelo")}
            error={erros.nomeModelo}
            fullWidth
          />
          <SelectField
            id="alterar-assunto"
            label="Assunto"
            required
            value={form.assunto}
            onChange={set("assunto")}
            options={assuntoOptions}
            error={erros.assunto}
          />
          <SelectField
            id="alterar-tipo"
            label="Tipo de modelo"
            required
            value={form.tipoModelo}
            onChange={set("tipoModelo")}
            options={tipoModeloOptions}
            error={erros.tipoModelo}
          />
          <SelectField
            id="alterar-area"
            label="Área gestora"
            required
            value={form.areaGestora}
            onChange={set("areaGestora")}
            options={areaGestoraOptions}
            error={erros.areaGestora}
          />
          <SelectField
            id="alterar-publico"
            label="Público"
            required
            value={form.publico}
            onChange={set("publico")}
            options={publicoOptions}
            error={erros.publico}
          />
          <TextField
            id="alterar-objetivo"
            label="Objetivo"
            required
            value={form.objetivo}
            onChange={set("objetivo")}
            error={erros.objetivo}
            maxLength={500}
            fullWidth
          />
        </div>
        {porGevam && solicitante !== s.solicitante && (
          <p className="-mt-1 text-aux text-ink-2">
            O solicitante passa de <b className="text-ink">{s.solicitante}</b> para{" "}
            <b className="text-ink">{solicitante}</b>, que passa a acompanhar a solicitação e a responder às
            complementações.
          </p>
        )}
        {!porGevam && (
        <div className="flex flex-col gap-2">
          <FileUpload
            id="alterar-relatorio"
            label="Substituir relatório de desenvolvimento (opcional)"
            file={novoRelatorio}
            onChange={(f) => {
              setNovoRelatorio(f);
              setErros((e) => ({ ...e, relatorio: undefined }));
            }}
            error={erros.relatorio}
            accept=".pdf"
            hint="Somente PDF, até 20 MB"
            fullWidth
          />
          <p className="text-aux text-ink-2">
            Relatório atual: <b className="text-ink">{atual ?? "nenhum"}</b>.{" "}
            {novoRelatorio
              ? "Ao salvar, ele será substituído pelo novo arquivo e não ficará salvo."
              : "Envie um novo arquivo só se quiser substituí-lo; o atual não ficará salvo."}
          </p>
        </div>
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
