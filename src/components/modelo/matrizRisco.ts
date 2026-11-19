import type { MatrizRisco } from "../../types";
import { TIERS } from "./tier";

/**
 * Matriz de Risco — PARÂMETROS PROVISÓRIOS DO PROTÓTIPO.
 * As notas são as oficiais. A tabela Tier × Nota → Classificação de Risco é um EXEMPLO
 * (só "Gestão Moderada + A = Baixo" foi confirmado). A tabela oficial deve vir de
 * Gestão › Parametrização › Matriz de Riscos; quando definida, basta trocar CLASSIFICACAO abaixo.
 */

export const NOTAS_CLASSIFICACAO: { nota: string; descricao: string }[] = [
  { nota: "A", descricao: "O modelo e o seu entorno atendem plenamente aos seus objetivos em todos os aspectos avaliados." },
  {
    nota: "B",
    descricao:
      "O modelo e o seu entorno atendem aos seus objetivos com oportunidades de melhorias em alguns de seus componentes ou critérios avaliados.",
  },
  {
    nota: "C",
    descricao:
      "O modelo e o seu entorno atendem aos seus objetivos com falhas mínimas em alguns de seus componentes ou critérios avaliados.",
  },
  {
    nota: "D",
    descricao:
      "O modelo e/ou seu entorno atendem parcialmente a seus objetivos com falhas importantes em componente central que demandam ação corretiva tempestiva.",
  },
  {
    nota: "E",
    descricao:
      "O modelo e/ou seu entorno não atendem aos seus objetivos com falhas cuja somatória compromete as suas estimativas, sendo recomendado sua desativação a uso.",
  },
];

/** Texto da opção no select: "A - O modelo e o seu entorno…". */
export const rotuloNota = (nota: string) => {
  const n = NOTAS_CLASSIFICACAO.find((x) => x.nota === nota);
  return n ? `${n.nota} - ${n.descricao}` : "";
};
export const notaDoRotulo = (rotulo: string) => rotulo.split(" - ")[0];
export const notaOptions = NOTAS_CLASSIFICACAO.map((n) => rotuloNota(n.nota));

export const tierOptions = TIERS;

/** Exemplo: Tier (linha) × Nota A–E (coluna). */
const CLASSIFICACAO: Record<string, string[]> = {
  "Gestão Flexível": ["Baixo", "Baixo", "Médio", "Alto", "Crítico"],
  "Gestão Moderada": ["Baixo", "Médio", "Médio", "Alto", "Crítico"],
  "Gestão Rigorosa": ["Médio", "Médio", "Alto", "Crítico", "Crítico"],
};

export function classificacaoRisco(tier: string, nota: string): string | undefined {
  const i = NOTAS_CLASSIFICACAO.findIndex((n) => n.nota === nota);
  return i >= 0 ? CLASSIFICACAO[tier]?.[i] : undefined;
}

/** Monta uma linha do Histórico Matriz de Risco ("Cálculo" se for a primeira, senão "Recálculo"). */
export function novaMatriz(
  anteriores: MatrizRisco[] | undefined,
  dados: Pick<MatrizRisco, "prazoRevalidacaoMeses" | "alcadaSugerida" | "tier" | "nota">,
  usuario: string,
): MatrizRisco {
  return {
    ...dados,
    id: `matriz-${Date.now()}`,
    tipo: anteriores?.length ? "Recálculo" : "Cálculo",
    classificacaoRisco: classificacaoRisco(dados.tier, dados.nota) ?? "—",
    data: new Date().toISOString(),
    usuario,
  };
}
