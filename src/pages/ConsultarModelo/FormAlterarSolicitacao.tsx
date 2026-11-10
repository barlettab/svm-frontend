import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { FileUpload } from "../../components/ui/FileUpload";
import { relatorioAtual } from "./fluxo";
import { areaGestoraOptions, assuntoOptions, publicoOptions, tipoModeloOptions } from "../../data/options";
import type { DadosSolicitacao } from "../../context/SolicitacoesContext";
import type { Solicitacao } from "../../types";

type Campos = Required<{ [K in keyof DadosSolicitacao]: string }>;

interface FormAlterarSolicitacaoProps {
  solicitacao: Solicitacao;
  onCancelar: () => void;
  /** novoRelatorio: nome do arquivo que substitui o relatório de desenvolvimento (opcional). */
  onConfirmar: (campos: DadosSolicitacao, novoRelatorio?: string) => void;
}

/**
 * "Editar solicitação": o solicitante corrige os dados que enviou na submissão.
 * Só existe enquanto a solicitação está Submetido (nenhum analista assumiu). Pode também
 * substituir o relatório de desenvolvimento; o arquivo anterior é descartado.
 */
export function FormAlterarSolicitacao({ solicitacao: s, onCancelar, onConfirmar }: FormAlterarSolicitacaoProps) {
  const [form, setForm] = useState<Campos>({
    nomeModelo: s.nomeModelo,
    tipoModelo: s.tipoModelo ?? "",
    areaGestora: s.areaGestora,
    assunto: s.assunto,
    publico: s.publico,
    objetivo: s.objetivo ?? "",
  });
  const [erros, setErros] = useState<Partial<Record<keyof Campos, string>>>({});
  const [novoRelatorio, setNovoRelatorio] = useState<File | null>(null);
  const atual = relatorioAtual(s);

  const set = (campo: keyof Campos) => (valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  function confirmar() {
    const novos: Partial<Record<keyof Campos, string>> = {};
    (Object.keys(form) as (keyof Campos)[]).forEach((c) => {
      if (!form[c].trim()) novos[c] = "Campo obrigatório";
    });
    setErros(novos);
    if (Object.keys(novos).length) return;
    onConfirmar({ ...form, nomeModelo: form.nomeModelo.trim(), objetivo: form.objetivo.trim() }, novoRelatorio?.name);
  }

  return (
    <Panel title="Editar solicitação" className="border-info-line">
      <div className="flex flex-col gap-5">
        <p className="text-body text-ink-2">
          Você pode alterar os dados enquanto nenhum analista assumiu a solicitação. A alteração fica registrada no
          histórico.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
        <div className="flex flex-col gap-2">
          <FileUpload
            id="alterar-relatorio"
            label="Substituir relatório de desenvolvimento (opcional)"
            file={novoRelatorio}
            onChange={setNovoRelatorio}
            hint="PDF, DOC, XLSX ou CSV até 20 MB"
            fullWidth
          />
          <p className="text-aux text-ink-2">
            Relatório atual: <b className="text-ink">{atual ?? "nenhum"}</b>.{" "}
            {novoRelatorio
              ? "Ao salvar, ele será substituído pelo novo arquivo e não ficará salvo."
              : "Envie um novo arquivo só se quiser substituí-lo; o atual não ficará salvo."}
          </p>
        </div>
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
