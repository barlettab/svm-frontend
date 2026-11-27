import { useState, type ReactNode } from "react";
import { Panel, FormActions } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { CamposInformacoesModelo } from "../../components/modelo/CamposDadosModelo";
import { ResumoInformacoesModelo } from "../../components/modelo/ResumoDadosModelo";
import {
  INFORMACOES_MODELO_VAZIAS,
  type ErrosInformacoesModelo,
} from "../../components/modelo/dadosModelo";
import type { InformacoesModelo } from "../../types";

const NAO_PREENCHIDO = "O analista ainda não preencheu esta aba.";
const DESCRICAO_PENDENTE = "Ela é preenchida pelo analista antes de enviar a solicitação ao gestor.";

/** Aba "Informações do Modelo" da solicitação. */
export function AbaInformacoesModelo({
  dados,
  editavel,
  onSalvar,
  acoes,
}: {
  /** Botões no cabeçalho do painel (ex.: Gerar ficha do modelo). */
  acoes?: ReactNode;
  dados?: InformacoesModelo;
  editavel: boolean;
  onSalvar: (dados: InformacoesModelo) => void;
}) {
  const [valor, setValor] = useState<InformacoesModelo>(dados ?? INFORMACOES_MODELO_VAZIAS);
  const [erros, setErros] = useState<ErrosInformacoesModelo>({});

  if (!editavel) {
    return (
      <Panel title="Informações do Modelo" actions={acoes}>
        {dados ? <ResumoInformacoesModelo dados={dados} /> : <EmptyState icon="clock" title={NAO_PREENCHIDO} description={DESCRICAO_PENDENTE} />}
      </Panel>
    );
  }

  /**
   * Salvar grava mesmo com seções obrigatórias vazias. A exigência vale só para
   * enviar ao gestor (pendenciasParaGestor).
   */
  function salvar() {
    setErros({});
    onSalvar(valor);
  }

  return (
    <Panel title="Informações do Modelo" actions={acoes}>
      <p className="-mt-1 mb-6 text-body text-ink-2">
        Preencha as seções abaixo. Obrigatório para enviar ao gestor.
      </p>
      <CamposInformacoesModelo
        value={valor}
        onChange={(v) => {
          setValor(v);
          setErros({});
        }}
        errors={erros}
      />
      <FormActions>
        <Button variant="primary" icon="check" onClick={salvar}>
          Salvar
        </Button>
      </FormActions>
    </Panel>
  );
}
