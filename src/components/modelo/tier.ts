import {
  complexidadeOptions,
  impactoDecisaoOptions,
  materialidadeOptions,
} from "../../data/options";
import type { CalculoTier, InformacoesAdicionais } from "../../types";

/**
 * Cálculo do Tier — FÓRMULA PROVISÓRIA DO PROTÓTIPO.
 * A expressão oficial fica em Gestão › Parametrização › Expr. Score Tier; quando ela
 * estiver definida, basta trocar os pontos e as faixas abaixo.
 *
 * Exemplo: Menor que R$200 mil (20) + Até 24,9% (15) + Simples associados (15)
 *          + Novo algoritmo Sim (25) = 75 → Gestão Moderada.
 */
const PONTOS = {
  materialidade: [20, 30, 40], // na ordem de materialidadeOptions
  impactoDecisao: [15, 25, 35],
  complexidade: [5, 15, 25],
  novoAlgoritmo: { Sim: 25, Não: 0 },
  novoProduto: { Sim: 10, Não: 0 },
  implementacaoAutomatizada: { Sim: 5, Não: 0 },
};

/** Faixas de pontuação → tier (limite inferior incluso). */
export const FAIXAS_TIER: { minimo: number; tier: string }[] = [
  { minimo: 100, tier: "Gestão Rigorosa" },
  { minimo: 60, tier: "Gestão Moderada" },
  { minimo: 0, tier: "Gestão Flexível" },
];

export const TIERS = FAIXAS_TIER.map((f) => f.tier).reverse();

const pontoDaLista = (lista: string[], pontos: number[], valor: string) => pontos[lista.indexOf(valor)] ?? 0;
const pontoSimNao = (pontos: { Sim: number; Não: number }, valor: string) =>
  valor === "Sim" ? pontos.Sim : valor === "Não" ? pontos.Não : 0;

export function calcularPontuacao(p: InformacoesAdicionais): number {
  return (
    pontoDaLista(materialidadeOptions, PONTOS.materialidade, p.materialidade) +
    pontoDaLista(impactoDecisaoOptions, PONTOS.impactoDecisao, p.impactoDecisao) +
    pontoDaLista(complexidadeOptions, PONTOS.complexidade, p.complexidade) +
    pontoSimNao(PONTOS.novoAlgoritmo, p.novoAlgoritmo) +
    pontoSimNao(PONTOS.novoProduto, p.novoProduto) +
    pontoSimNao(PONTOS.implementacaoAutomatizada, p.implementacaoAutomatizada)
  );
}

export function tierDaPontuacao(pontos: number): string {
  return (FAIXAS_TIER.find((f) => pontos >= f.minimo) ?? FAIXAS_TIER[FAIXAS_TIER.length - 1]).tier;
}

let sequencia = 0;

/** Monta uma linha do histórico de cálculo/recálculo. */
export function novoCalculo(dados: {
  tipo: CalculoTier["tipo"];
  parametros: InformacoesAdicionais;
  ajusteMrm?: number;
  override?: string;
  usuario: string;
  data?: string;
}): CalculoTier {
  const pontuacaoBase = calcularPontuacao(dados.parametros);
  const resultado = pontuacaoBase + (dados.ajusteMrm ?? 0);
  sequencia += 1;
  return {
    id: `calc-${Date.now()}-${sequencia}`,
    tipo: dados.tipo,
    parametros: dados.parametros,
    pontuacaoBase,
    ajusteMrm: dados.ajusteMrm,
    resultado,
    tier: dados.override || tierDaPontuacao(resultado),
    override: dados.override || undefined,
    data: dados.data ?? new Date().toISOString(),
    usuario: dados.usuario,
  };
}

/**
 * Último "Cálculo" e o "Recálculo" mais recente feito depois dele. Um novo cálculo
 * (Informações Adicionais alteradas) zera o recálculo, que usava os parâmetros antigos.
 */
export function ultimos(calculos: CalculoTier[] = []) {
  let indiceCalculo = -1;
  calculos.forEach((c, i) => {
    if (c.tipo === "Cálculo") indiceCalculo = i;
  });
  const calculo = indiceCalculo >= 0 ? calculos[indiceCalculo] : undefined;
  const recalculo = [...calculos.slice(indiceCalculo + 1)].reverse().find((c) => c.tipo === "Recálculo");
  return { calculo, recalculo };
}
