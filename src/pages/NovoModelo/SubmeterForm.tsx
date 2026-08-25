import { useState, type FormEvent } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { FileUpload } from "../../components/ui/FileUpload";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { Panel, FormGrid, FormActions } from "../../components/ui/Panel";
import {
  areaGestoraOptions,
  assuntoOptions,
  publicoOptions,
  tipoModeloOptions,
} from "../../data/options";

interface FormState {
  nomeModelo: string;
  tipoModelo: string;
  areaGestora: string;
  assunto: string;
  publico: string;
}

const INITIAL_STATE: FormState = {
  nomeModelo: "",
  tipoModelo: "",
  areaGestora: "",
  assunto: "",
  publico: "",
};

function generateRequestCode() {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 900) + 100);
  return `REQ-${year}-${sequence}`;
}

export function SubmeterForm() {
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
    setSuccessCode(generateRequestCode());
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
        title="Submeter novo modelo"
        description="Preencha as informações abaixo para iniciar uma nova solicitação de validação."
      />

      <Panel>
        <form onSubmit={handleSubmit} noValidate>
          <FormGrid>
            <TextField
              id="nomeModelo"
              label="Nome do modelo"
              required
              value={form.nomeModelo}
              onChange={(value) => updateField("nomeModelo", value)}
              placeholder="Digite o nome do modelo"
              error={errors.nomeModelo}
              fullWidth
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
              id="areaGestora"
              label="Área gestora"
              required
              value={form.areaGestora}
              onChange={(value) => updateField("areaGestora", value)}
              options={areaGestoraOptions}
              error={errors.areaGestora}
            />

            <SelectField
              id="assunto"
              label="Assunto"
              required
              value={form.assunto}
              onChange={(value) => updateField("assunto", value)}
              options={assuntoOptions}
              error={errors.assunto}
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

            <FileUpload id="anexo" file={file} onChange={setFile} fullWidth />
          </FormGrid>

          <FormActions>
            <PrimaryButton type="submit">Enviar</PrimaryButton>
          </FormActions>
        </form>
      </Panel>

      <SuccessModal
        open={successCode !== null}
        message="Solicitação enviada com sucesso."
        code={successCode ?? ""}
        onClose={handleCloseModal}
      />
    </div>
  );
}
