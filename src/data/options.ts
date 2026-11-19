export const tipoModeloOptions = [
  "Machine Learning",
  "Inteligência Artificial",
  "Estatístico",
  "Outro",
];

export const areaGestoraOptions = [
  "Risco",
  "Financeiro",
  "Marketing",
  "Operações",
  "Recursos Humanos",
];

export const assuntoOptions = [
  "Desenvolvimento de modelo",
  "Alteração de modelo existente",
  "Revalidação",
  "Outro",
];

export const publicoOptions = ["Interno", "Externo", "Interno e externo"];

/** Situação do modelo no inventário. Todo modelo validado entra como Ativo. */
export const situacaoModeloOptions = ["Ativo", "Inativo", "Suspenso"];

/** Monitoramento pela GEVAM. Todo modelo entra no inventário como Não monitorado. */
export const monitoramentoOptions = ["Em monitoramento", "Não monitorado"];

// ── Informações Adicionais (cálculo do Tier) ─────────────────────────────
export const materialidadeOptions = [
  "Menor que R$200.000,00.",
  "Entre R$200.000,00 e R$999.999,00",
  "Maior ou igual à R$1.000.000,00.",
];

export const impactoDecisaoOptions = ["Até 24,9%.", "Entre 25% e 49,9%.", "Maior ou igual à 50%."];

export const complexidadeOptions = [
  "Cálculos ou estatísticas simples ou sem cálculos com definições qualitativas.",
  "Cálculos ou estatísticas simples associados à definições qualitativas.",
  "Cálculos ou estatísticas complexas, associados ou não à definições qualitativas.",
];

export const naoSimOptions = ["Não", "Sim"];



