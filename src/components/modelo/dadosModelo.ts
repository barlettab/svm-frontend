import type { InformacoesAdicionais, InformacoesModelo } from "../../types";

/** Campos das abas "Informações Adicionais" e "Informações do Modelo": vazios e validação. */

export type Erros<T> = Partial<Record<keyof T, string>>;

export const INFORMACOES_VAZIAS: InformacoesAdicionais = {
  materialidade: "",
  impactoDecisao: "",
  complexidade: "",
  novoAlgoritmo: "",
  novoProduto: "",
  implementacaoAutomatizada: "",
};

const OBRIGATORIO = "Campo obrigatório";

export function validarInformacoes(d: InformacoesAdicionais): Erros<InformacoesAdicionais> {
  const erros: Erros<InformacoesAdicionais> = {};
  (Object.keys(d) as (keyof InformacoesAdicionais)[]).forEach((k) => {
    if (!d[k]) erros[k] = OBRIGATORIO;
  });
  return erros;
}

export const INFORMACOES_MODELO_VAZIAS: InformacoesModelo = {
  contextualizacao: "",
  metodologia: "",
  resultados: "",
  monitoramento1Linha: "",
  monitoramento2Linha: "",
  observacoes: "",
};

type CampoTexto = keyof InformacoesModelo;

/**
 * Seções da aba "Informações do Modelo", na ordem da tela. A `dica` aparece no
 * tooltip (i) do campo para orientar o que o analista deve escrever.
 */
export const SECOES_INFORMACOES_MODELO: {
  campo: CampoTexto;
  titulo: string;
  dica: string;
  placeholder: string;
  obrigatorio: boolean;
}[] = [
  {
    campo: "contextualizacao",
    titulo: "Contextualização",
    dica: "Qual o objetivo do modelo e a justificativa para ele existir, o público e a carteira em que é aplicado, e se substitui outro modelo (qual e por quê).",
    placeholder: "Ex.: Modelo de score para concessão de crédito pessoal PF, desenvolvido para substituir o Score PF v2…",
    obrigatorio: true,
  },
  {
    campo: "metodologia",
    titulo: "Metodologia",
    dica: "Quais técnicas foram utilizadas (regressão logística, SARIMAX, árvore de decisão, XGBoost, redes neurais…), a variável resposta ou evento e o horizonte.",
    placeholder: "Ex.: Regressão logística. Evento: atraso acima de 90 dias em 12 meses…",
    obrigatorio: true,
  },
  {
    campo: "resultados",
    titulo: "Resultados",
    dica: "Valores dos indicadores de performance (KS, AUROC, acurácia, MAPE…) associados a cada período (desenvolvimento, teste, out-of-time) e os valores dos testes realizados.",
    placeholder: "Ex.: Desenvolvimento (jan/23–jun/24): KS 43%, AUROC 0,81. Out-of-time (jul–dez/24): KS 41%…",
    obrigatorio: true,
  },
  {
    campo: "monitoramento1Linha",
    titulo: "Monitoramento da 1ª linha",
    dica: "Qual monitoramento será realizado pela área solicitante: indicadores acompanhados, periodicidade e limites de alerta.",
    placeholder: "Ex.: A área de Risco acompanhará KS e PSI mensalmente, com alerta se o KS ficar abaixo de 30%…",
    obrigatorio: true,
  },
  {
    campo: "monitoramento2Linha",
    titulo: "Monitoramento da 2ª linha",
    dica: "Qual monitoramento será realizado pela GEVAM e com quais indicadores (e com que periodicidade).",
    placeholder: "Ex.: A GEVAM acompanhará trimestralmente KS, AUROC e PSI…",
    obrigatorio: true,
  },
  {
    campo: "observacoes",
    titulo: "Observações",
    dica: "Informações complementares que não se encaixam nas seções anteriores (opcional).",
    placeholder: "",
    obrigatorio: false,
  },
];

export type ErrosInformacoesModelo = Erros<InformacoesModelo>;

export function validarInformacoesModelo(d: InformacoesModelo): ErrosInformacoesModelo {
  const erros: ErrosInformacoesModelo = {};
  for (const s of SECOES_INFORMACOES_MODELO) {
    if (s.obrigatorio && !d[s.campo]?.trim()) erros[s.campo] = OBRIGATORIO;
  }
  return erros;
}

export const semErros = (e: object) => Object.keys(e).length === 0;

/** O que ainda falta para o analista poder enviar ao gestor. */
export function pendenciasParaGestor(s: {
  informacoesAdicionais?: InformacoesAdicionais;
  informacoesModelo?: InformacoesModelo;
  matrizesRisco?: unknown[];
}): string[] {
  // Na ordem das abas: Cálculo do Tier, Matriz de Risco, Informações do Modelo.
  const faltando: string[] = [];
  if (!s.informacoesAdicionais || !semErros(validarInformacoes(s.informacoesAdicionais)))
    faltando.push("Cálculo do Tier");
  if (!s.matrizesRisco?.length) faltando.push("Matriz de Risco");
  if (!s.informacoesModelo || !semErros(validarInformacoesModelo(s.informacoesModelo))) faltando.push("Informações do Modelo");
  return faltando;
}
