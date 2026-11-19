import type { Solicitacao } from "../../types";
import { formatDate } from "../../pages/ConsultarModelo/formatDate";
import { dataFinalizacaoAnalise } from "../../pages/ConsultarModelo/fluxo";
import { rotuloNota } from "./matrizRisco";
import { SECOES_INFORMACOES_MODELO } from "./dadosModelo";
import { ultimos } from "./tier";

/**
 * "Relatório Individual de Modelo" (ficha do modelo).
 *
 * O conteúdo (`conteudoFicha`) é montado uma vez e serve para:
 *   - a pré-visualização e a impressão/PDF (`fichaModeloHtml`, HTML com estilos inline);
 *   - o download em Excel (`baixarFichaExcel`, um .xlsx de verdade gerado com exceljs).
 *
 * Blocos, na ordem das abas da solicitação:
 *   Logo do banco + título → Cabeçalho do modelo → Cálculo do Tier → Matriz de Risco → Informações do Modelo
 */

/** Logo do BRB no topo da ficha (public/logo-brb.png, recortado de dist/brb-logo-0.png). Se faltar, a ficha sai sem logo. */
export const LOGO_FICHA = "/logo-brb.png";

const VAZIO = "—";
export const COLUNAS = 9;
/**
 * Largura de cada coluna (mesmas larguras do modelo .xlsx em handoff/; no Excel, em caracteres).
 * Colunas iguais faziam “Materialidade”, “Complexidade” etc. vazarem da célula.
 */
export const LARGURAS = [17, 13, 20, 12, 12, 16, 9, 10, 17];

export const valor = (v: string | undefined) => (v?.trim() ? v : VAZIO);

/** Rótulo e valor de uma linha do cabeçalho. Sem segundo par, o valor ocupa a linha toda. */
export interface ParCabecalho {
  r1: string;
  v1: string;
  r2?: string;
  v2?: string;
}

/** Item de um bloco em colunas (título em cima, valor embaixo), com quantas colunas ocupa. */
export interface ItemColuna {
  titulo: string;
  valor: string;
  span: number;
}

export interface ConteudoFicha {
  numero: string;
  nomeModelo: string;
  cabecalho: ParCabecalho[];
  tier: ItemColuna[];
  matriz: ItemColuna[];
  secoes: { titulo: string; texto: string }[];
  rodape: string;
}

function situacao(s: Solicitacao) {
  return s.status;
}

function validado(s: Solicitacao) {
  if (s.status === "Validado") return "Sim";
  if (s.status === "Cancelado") return "Não";
  return "Em validação";
}

export function conteudoFicha(s: Solicitacao): ConteudoFicha {
  const { calculo, recalculo } = ultimos(s.calculosTier);
  const param = (recalculo ?? calculo)?.parametros ?? s.informacoesAdicionais;
  const tier = calculo ? (recalculo ? `${calculo.tier} / ${recalculo.tier}` : calculo.tier) : undefined;
  const mrm = recalculo?.ajusteMrm;
  const matriz = s.matrizesRisco?.[s.matrizesRisco.length - 1];
  const finalizada = dataFinalizacaoAnalise(s);
  const info = s.informacoesModelo;
  const col = (titulo: string, v: string | undefined, span = 1): ItemColuna => ({ titulo, valor: valor(v), span });

  return {
    numero: s.numero,
    nomeModelo: valor(s.nomeModelo),
    cabecalho: [
      { r1: "Assunto:", v1: valor(s.assunto), r2: "Tipo de Modelo:", v2: valor(s.tipoModelo) },
      { r1: "Público:", v1: valor(s.publico), r2: "Situação do Modelo:", v2: valor(situacao(s)) },
      {
        r1: "Área Gestora:",
        v1: valor(s.areaGestora),
        r2: "Data da Validação:",
        v2: valor(finalizada ? formatDate(finalizada) : undefined),
      },
      { r1: "Objetivo:", v1: valor(s.objetivo) },
    ],
    tier: [
      col("Materialidade", param?.materialidade),
      col("Impacto", param?.impactoDecisao),
      col("Complexidade", param?.complexidade),
      col("Novo Algoritmo?", param?.novoAlgoritmo),
      col("Novo Produto?", param?.novoProduto),
      col("Automatizado?", param?.implementacaoAutomatizada),
      col("MRM", mrm === undefined ? undefined : mrm > 0 ? `+${mrm}` : String(mrm)),
      col("Override", recalculo?.override ?? (calculo ? "Não" : undefined)),
      col("Tier (cálculo / recálculo)", tier),
    ],
    matriz: [
      col("Validado", validado(s)),
      col("Nota de Classificação", matriz ? rotuloNota(matriz.nota) : undefined, 2),
      col("Classificação de Risco", matriz?.classificacaoRisco, 2),
      col("Prazo de Revalidação (meses)", matriz?.prazoRevalidacaoMeses),
      col("Alçada Sugerida", matriz?.alcadaSugerida, 2),
      col("Analista", s.analistaResponsavel),
    ],
    secoes: SECOES_INFORMACOES_MODELO.filter((sec) => sec.obrigatorio || info?.[sec.campo]?.trim()).map((sec) => ({
      titulo: sec.titulo,
      texto: valor(info?.[sec.campo]),
    })),
    rodape: `Solicitação ${s.numero} · gerado em ${new Date().toLocaleString("pt-BR")}`,
  };
}

// ── HTML (pré-visualização e impressão/PDF) ──────────────────────────────────

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");

const BORDA = "border:1px solid #000;";
const CEL = `${BORDA}padding:6px 8px;font-family:Calibri,Arial,sans-serif;font-size:11pt;vertical-align:middle;overflow-wrap:break-word;`;
const ROTULO = `${CEL}font-weight:bold;`;
const VALOR = `${CEL}font-style:italic;`;
const CABECALHO = `${CEL}font-weight:bold;text-align:center;background:#d9e1f2;`;
const COLUNA = `${CEL}font-weight:bold;font-style:italic;text-align:center;font-size:10pt;padding:6px 4px;`;

const td = (estilo: string, conteudo: string, colspan = 1) =>
  `<td style="${estilo}"${colspan > 1 ? ` colspan="${colspan}"` : ""}>${conteudo}</td>`;

const secao = (titulo: string) => `<tr>${td(CABECALHO, titulo, COLUNAS)}</tr>`;

const linhaPar = (p: ParCabecalho) =>
  `<tr>${td(ROTULO, p.r1)}${td(VALOR, esc(p.v1), p.r2 ? 3 : COLUNAS - 1)}${
    p.r2 ? td(ROTULO, p.r2, 2) + td(VALOR, esc(p.v2 ?? VAZIO), 3) : ""
  }</tr>`;

const blocoColunas = (itens: ItemColuna[]) =>
  `<tr>${itens.map((i) => td(COLUNA, esc(i.titulo), i.span)).join("")}</tr>` +
  `<tr>${itens.map((i) => td(`${CEL}text-align:center;`, esc(i.valor), i.span)).join("")}</tr>`;

export function fichaModeloHtml(s: Solicitacao) {
  const c = conteudoFicha(s);
  const semBorda = "border:none;font-family:Calibri,Arial,sans-serif;";
  const linhas = [
    `<tr><td style="${semBorda}padding:4px 0;vertical-align:middle;" colspan="2"><img src="${LOGO_FICHA}" alt="" style="height:44px;display:block;" onerror="this.remove()"></td>` +
      `<td style="${semBorda}font-weight:bold;font-size:14pt;text-align:center;padding:12px 8px;" colspan="${COLUNAS - 2}">Relatório Individual de Modelo</td></tr>`,
    `<tr>${td(`${ROTULO}background:#d9e1f2;`, "Nome do Modelo:")}${td(
      `${VALOR}font-weight:bold;background:#d9e1f2;`,
      esc(c.nomeModelo),
      COLUNAS - 1,
    )}</tr>`,
    ...c.cabecalho.map(linhaPar),
    secao("Cálculo do Tier"),
    blocoColunas(c.tier),
    secao("Matriz de Risco"),
    blocoColunas(c.matriz),
    secao("Informações do Modelo"),
    ...c.secoes.map(
      (sec) =>
        `<tr>${td(`${ROTULO}vertical-align:top;`, sec.titulo, 2)}${td(`${CEL}vertical-align:top;`, esc(sec.texto), COLUNAS - 2)}</tr>`,
    ),
  ];

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(`Ficha do modelo ${s.numero}`)}</title>
<style>
  body { margin: 16px; background: #fff; color: #000; }
  table { border-collapse: collapse; width: 100%; max-width: 980px; table-layout: fixed; }
  @media print { body { margin: 0; } @page { size: A4 landscape; margin: 12mm; } }
</style>
</head>
<body>
<table>
<colgroup>${LARGURAS.map((l) => `<col style="width:${((l / LARGURAS.reduce((a, b) => a + b, 0)) * 100).toFixed(2)}%">`).join("")}</colgroup>
${linhas.join("\n")}
</table>
<p style="font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#555;margin-top:8px;">${esc(c.rodape)}</p>
</body>
</html>`;
}

/** Baixa a ficha como .xlsx. A biblioteca de planilha só é carregada no clique. */
export async function baixarFichaExcel(s: Solicitacao) {
  const { fichaModeloXlsx } = await import("./fichaModeloXlsx");
  const blob = await fichaModeloXlsx(s);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ficha_${s.numero}_${s.nomeModelo.replace(/[^\p{L}\p{N}]+/gu, "_")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
