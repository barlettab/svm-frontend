import { useState, type FormEvent } from "react";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { TextareaField } from "../../components/ui/TextareaField";
import { ReadOnlyField } from "../../components/ui/ReadOnlyField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { areaGestoraOptions } from "../../data/options";
import type { SolicitacaoCancelada } from "../../types";

interface FormState {
  numero: string;
  areaGestora: string;
  nomeModelo: string;
  justificativa: string;
}

interface CancelarSolicitacaoFormProps {
  currentUser?: { nome: string; areaGestora: string };
  onSubmit: (record: SolicitacaoCancelada) => void;
  onDone: () => void;
}

export function CancelarSolicitacaoForm({
  currentUser,
  onSubmit,
  onDone,
}: CancelarSolicitacaoFormProps) {
  const initialState: FormState = {
    numero: "",
    areaGestora: currentUser?.areaGestora ?? "",
    nomeModelo: "",
    justificativa: "",
  };

  const [form, setForm] = useState<FormState>(initialState);
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

    const record: SolicitacaoCancelada = {
      numero: form.numero.trim(),
      nomeModelo: form.nomeModelo.trim(),
      areaGestora: form.areaGestora,
      solicitante: currentUser?.nome,
      dataCancelamento: new Date().toISOString().slice(0, 10),
      justificativa: form.justificativa.trim(),
    };

    onSubmit(record);
    setSuccessCode(record.numero);
  }

  function handleCloseModal() {
    setSuccessCode(null);
    setForm(initialState);
    setErrors({});
    onDone();
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm text-slate-500">
        Preencha os dados abaixo para registrar o cancelamento de uma
        solicitação.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <TextField
            id="cancel-numero"
            label="Nº da solicitação"
            required
            value={form.numero}
            onChange={(value) => updateField("numero", value)}
            placeholder="Ex.: REQ-2026-001"
            error={errors.numero}
          />

          {currentUser ? (
            <ReadOnlyField
              label="Área gestora"
              value={currentUser.areaGestora}
            />
          ) : (
            <SelectField
              id="cancel-area"
              label="Área gestora"
              required
              value={form.areaGestora}
              onChange={(value) => updateField("areaGestora", value)}
              options={areaGestoraOptions}
              error={errors.areaGestora}
            />
          )}

          <TextField
            id="cancel-nome-modelo"
            label="Nome do modelo"
            required
            value={form.nomeModelo}
            onChange={(value) => updateField("nomeModelo", value)}
            placeholder="Nome do modelo"
            error={errors.nomeModelo}
            fullWidth
          />

          <TextareaField
            id="cancel-justificativa"
            label="Justificativa de cancelamento"
            required
            value={form.justificativa}
            onChange={(value) => updateField("justificativa", value)}
            placeholder="Descreva o motivo do cancelamento"
            error={errors.justificativa}
          />
        </div>

        <div className="mt-5">
          <PrimaryButton type="submit">Confirmar cancelamento</PrimaryButton>
        </div>
      </form>

      <SuccessModal
        open={successCode !== null}
        message="Solicitação cancelada com sucesso."
        code={successCode ?? ""}
        onClose={handleCloseModal}
      />
    </div>
  );
}
