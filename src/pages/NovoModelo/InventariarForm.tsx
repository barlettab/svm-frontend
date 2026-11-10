import { useState, type FormEvent } from "react";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { TextareaField } from "../../components/ui/TextareaField";
import { FileUpload } from "../../components/ui/FileUpload";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Panel, FormGrid, FormActions } from "../../components/ui/Panel";
import {
  areaGestoraOptions,
  monitoramentoOptions,
  publicoOptions,
  situacaoModeloOptions,
  tipoModeloOptions,
  validadoOptions,
} from "../../data/options";

export interface InventariarDados {
  situacaoModelo: string;
  validado: string;
  monitoramento: string;
  nomeModelo: string;
  tipoModelo: string;
  publico: string;
  areaGestora: string;
  objetivo: string;
}

type FormState = InventariarDados;

interface InventariarFormProps {
  form: InventariarDados;
  onChange: (form: InventariarDados) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Chamado com o formulário válido (botão Avançar). */
  onAvancar: () => void;
}

/** Passo 1 do inventário: dados do modelo. Estado fica no InventariarWizard. */
export function InventariarForm({ form, onChange, file, onFileChange, onAvancar }: InventariarFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function updateField(field: keyof FormState, value: string) {
    onChange({ ...form, [field]: value });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = "Campo obrigatório";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    onAvancar();
  }

  return (
    <div>
      <Panel title="Dados do modelo">
        <form onSubmit={handleSubmit} noValidate>
          <FormGrid>
            <SelectField
              id="situacaoModelo"
              label="Situação do modelo"
              required
              value={form.situacaoModelo}
              onChange={(value) => updateField("situacaoModelo", value)}
              options={situacaoModeloOptions}
              error={errors.situacaoModelo}
            />

            <SelectField
              id="validado"
              label="Validado?"
              required
              value={form.validado}
              onChange={(value) => updateField("validado", value)}
              options={validadoOptions}
              error={errors.validado}
            />

            <SelectField
              id="monitoramento"
              label="Monitoramento"
              required
              value={form.monitoramento}
              onChange={(value) => updateField("monitoramento", value)}
              options={monitoramentoOptions}
              error={errors.monitoramento}
            />

            <TextField
              id="nomeModelo"
              label="Nome do modelo"
              required
              value={form.nomeModelo}
              onChange={(value) => updateField("nomeModelo", value)}
              error={errors.nomeModelo}
            />

            <SelectField
              id="tipoModelo"
              label="Tipo de modelo"
              required
              value={form.tipoModelo}
              onChange={(value) => updateField("tipoModelo", value)}
              options={tipoModeloOptions}
              error={errors.tipoModelo}
            />

            <SelectField
              id="publico"
              label="Público"
              required
              value={form.publico}
              onChange={(value) => updateField("publico", value)}
              options={publicoOptions}
              error={errors.publico}
            />

            <SelectField
              id="areaGestora"
              label="Área gestora"
              required
              value={form.areaGestora}
              onChange={(value) => updateField("areaGestora", value)}
              options={areaGestoraOptions}
              error={errors.areaGestora}
            />

            <TextareaField
              id="objetivo"
              label="Objetivo"
              required
              value={form.objetivo}
              onChange={(value) => updateField("objetivo", value)}
              placeholder="Descreva brevemente o objetivo do modelo"
              error={errors.objetivo}
            />

            <FileUpload id="anexo" file={file} onChange={onFileChange} fullWidth />
          </FormGrid>

          <FormActions>
            <PrimaryButton type="submit" iconRight="chev-right">Avançar</PrimaryButton>
          </FormActions>
        </form>
      </Panel>

    </div>
  );
}
