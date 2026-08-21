import { useState, type FormEvent } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { RadioGroupField } from "../../components/ui/RadioGroupField";
import { TextareaField } from "../../components/ui/TextareaField";
import { FileUpload } from "../../components/ui/FileUpload";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  areaGestoraOptions,
  monitoramentoOptions,
  publicoOptions,
  situacaoModeloOptions,
  tipoModeloOptions,
  validadoOptions,
} from "../../data/options";

interface FormState {
  situacaoModelo: string;
  validado: string;
  monitoramento: string;
  nomeModelo: string;
  tipoModelo: string;
  publico: string;
  areaGestora: string;
  objetivo: string;
}

const INITIAL_STATE: FormState = {
  situacaoModelo: "",
  validado: "",
  monitoramento: "",
  nomeModelo: "",
  tipoModelo: "",
  publico: "",
  areaGestora: "",
  objetivo: "",
};

function generateInventoryCode() {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 900) + 100).padStart(
    3,
    "0",
  );
  return `INV-${year}-${sequence}`;
}

export function InventariarForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [successCode, setSuccessCode] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    setSuccessCode(generateInventoryCode());
  }

  function handleCloseModal() {
    setSuccessCode(null);
    setForm(INITIAL_STATE);
    setFile(null);
    setErrors({});
  }

  return (
    <div>
      <PageHeader
        title="Inventariar modelo"
        description="Registre um modelo existente no inventário corporativo."
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <SelectField
            id="situacaoModelo"
            label="Situação do modelo"
            required
            value={form.situacaoModelo}
            onChange={(value) => updateField("situacaoModelo", value)}
            options={situacaoModeloOptions}
            error={errors.situacaoModelo}
          />

          <RadioGroupField
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

          <FileUpload id="anexo" file={file} onChange={setFile} fullWidth />
        </div>

        <div className="mt-8">
          <PrimaryButton type="submit">Enviar</PrimaryButton>
        </div>
      </form>

      <SuccessModal
        open={successCode !== null}
        message="Modelo inventariado com sucesso."
        code={successCode ?? ""}
        onClose={handleCloseModal}
      />
    </div>
  );
}
