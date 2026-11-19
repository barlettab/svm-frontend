import type { CalculoTier, InformacoesAdicionais, InformacoesModelo } from "../types";
import { novoCalculo } from "../components/modelo/tier";

/** Exemplo de abas já preenchidas pelo analista (usado nos mocks). */
export const exemploInformacoesAdicionais: InformacoesAdicionais = {
  materialidade: "Menor que R$200.000,00.",
  impactoDecisao: "Até 24,9%.",
  complexidade: "Cálculos ou estatísticas simples ou sem cálculos com definições qualitativas.",
  novoAlgoritmo: "Não",
  novoProduto: "Não",
  implementacaoAutomatizada: "Não",
};

export const exemploInformacoesModelo: InformacoesModelo = {
  contextualizacao:
    "Modelo de score para concessão de crédito pessoal e cheque especial a clientes PF correntistas (canais agência e app). Apoia a decisão de aprovação e a definição de limite.\nJustificativa: substitui o Score PF v2 (INV-2023-004), que perdeu desempenho após a mudança do perfil da carteira em 2024.",
  metodologia:
    "Regressão logística com variáveis categorizadas (WoE). Evento: atraso acima de 90 dias em até 12 meses. Bases internas de cadastro e comportamento + bureau; 14 variáveis finais.",
  resultados:
    "Desenvolvimento (jan/2023 a jun/2024): KS 43%, AUROC 0,81.\nTeste (holdout, mesmo período): KS 42%, AUROC 0,80.\nOut-of-time (jul a dez/2024): KS 41%, AUROC 0,80, PSI 0,04.",
  monitoramento1Linha:
    "A área de Risco acompanhará mensalmente KS, AUROC e PSI do score e das variáveis. Alerta se KS < 30% ou PSI > 0,25 por dois meses seguidos.",
  monitoramento2Linha:
    "A GEVAM acompanhará trimestralmente KS, AUROC e PSI a partir das bases da 1ª linha, além da estabilidade das faixas de score.",
  observacoes: "Pouca representatividade de clientes com menos de 6 meses de relacionamento.",
};

/** Cálculo inicial do Tier feito pelo analista ao salvar as Informações Adicionais. */
export function exemploCalculos(usuario: string, data: string): CalculoTier[] {
  return [novoCalculo({ tipo: "Cálculo", parametros: exemploInformacoesAdicionais, usuario, data: `${data}T10:30:00` })];
}
