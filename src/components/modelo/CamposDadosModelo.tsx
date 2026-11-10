import { SelectField } from "../ui/SelectField";
import { FormGrid } from "../ui/Panel";
import {
  complexidadeOptions,
  impactoDecisaoOptions,
  materialidadeOptions,
  naoSimOptions,
} from "../../data/options";
import type { InformacoesAdicionais, InformacoesModelo } from "../../types";
import { SECOES_INFORMACOES_MODELO, type Erros, type ErrosInformacoesModelo } from "./dadosModelo";
import { TextareaField } from "../ui/TextareaField";

interface CamposProps<T> {
  value: T;
  onChange: (value: T) => void;
  errors: Erros<T>;
  /** Prefixo dos ids, para a mesma tela poder ter mais de um formulário. */
  idPrefix?: string;
}

/** Campos da aba "Informações Adicionais" (cálculo do Tier). */
export function CamposInformacoesAdicionais({
  value,
  onChange,
  errors,
  idPrefix = "info",
}: CamposProps<InformacoesAdicionais>) {
  const set = (k: keyof InformacoesAdicionais) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <FormGrid>
      <SelectField
        id={`${idPrefix}-materialidade`}
        label="Materialidade"
        info="Valor financeiro exposto às decisões tomadas com base no modelo."
        required
        value={value.materialidade}
        onChange={set("materialidade")}
        options={materialidadeOptions}
        error={errors.materialidade}
      />
      <SelectField
        id={`${idPrefix}-impacto`}
        label="Impacto na decisão"
        info="Quanto o resultado do modelo pesa na decisão do processo em que é usado."
        required
        value={value.impactoDecisao}
        onChange={set("impactoDecisao")}
        options={impactoDecisaoOptions}
        error={errors.impactoDecisao}
      />
      <SelectField
        id={`${idPrefix}-complexidade`}
        label="Complexidade"
        required
        value={value.complexidade}
        onChange={set("complexidade")}
        options={complexidadeOptions}
        error={errors.complexidade}
      />
      <SelectField
        id={`${idPrefix}-novo-algoritmo`}
        label="O modelo utiliza novo algoritmo?"
        info="Sim quando o algoritmo ainda não é utilizado em outros modelos da instituição."
        required
        value={value.novoAlgoritmo}
        onChange={set("novoAlgoritmo")}
        options={naoSimOptions}
        error={errors.novoAlgoritmo}
      />
      <SelectField
        id={`${idPrefix}-novo-produto`}
        label="O modelo foi desenvolvido para novo produto?"
        required
        value={value.novoProduto}
        onChange={set("novoProduto")}
        options={naoSimOptions}
        error={errors.novoProduto}
      />
      <SelectField
        id={`${idPrefix}-automatizada`}
        label="Implementação automatizada via sistema?"
        required
        value={value.implementacaoAutomatizada}
        onChange={set("implementacaoAutomatizada")}
        options={naoSimOptions}
        error={errors.implementacaoAutomatizada}
      />
    </FormGrid>
  );
}

/** Campos da aba "Informações do Modelo": uma seção de texto por item, cada uma com dica no (i). */
export function CamposInformacoesModelo({
  value,
  onChange,
  errors,
  idPrefix = "info-modelo",
}: {
  value: InformacoesModelo;
  onChange: (value: InformacoesModelo) => void;
  errors: ErrosInformacoesModelo;
  idPrefix?: string;
}) {
  return (
    <div className="flex flex-col gap-7">
      {SECOES_INFORMACOES_MODELO.map((s) => (
        <TextareaField
          key={s.campo}
          id={`${idPrefix}-${s.campo}`}
          label={s.obrigatorio ? s.titulo : `${s.titulo} (opcional)`}
          info={s.dica}
          required={s.obrigatorio}
          value={value[s.campo] ?? ""}
          onChange={(v) => onChange({ ...value, [s.campo]: v })}
          placeholder={s.placeholder}
          rows={s.obrigatorio ? 6 : 4}
          maxLength={4000}
          error={errors[s.campo]}
        />
      ))}
    </div>
  );
}
