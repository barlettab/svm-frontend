import type { Solicitacao } from "../../types";
import { formatDate } from "../../pages/ConsultarModelo/formatDate";
import { dataFinalizacaoAnalise } from "../../pages/ConsultarModelo/fluxo";
import { rotuloNota } from "./matrizRisco";
import { SECOES_INFORMACOES_MODELO } from "./dadosModelo";
import { ultimos } from "./tier";

/**
 * "Relatório Individual de Modelo" (ficha do modelo).
 *
 * Gera um HTML com uma tabela única e estilos inline: o mesmo conteúdo serve para a
 * pré-visualização, para o Excel (o .xls abaixo é HTML, que o Excel abre com bordas,
 * cores e células mescladas, sem precisar de biblioteca) e para imprimir/salvar em PDF.
 *
 * Blocos, na ordem das abas da solicitação:
 *   Cabeçalho do modelo → Cálculo do Tier → Matriz de Risco → Informações do Modelo
 */

const VAZIO = "—";
const COLUNAS = 9;
/**
 * Largura relativa de cada coluna (mesmas larguras do modelo .xlsx em handoff/).
 * Colunas iguais faziam “Materialidade”, “Complexidade” etc. vazarem da célula.
 */
const LARGURAS = [17, 13, 20, 12, 12, 16, 9, 10, 17];

const esc = (v: string | undefined) =>
  (v?.trim() ? v : VAZIO)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");

const BORDA = "border:1px solid #000;";
const CEL = `${BORDA}padding:6px 8px;font-family:Calibri,Arial,sans-serif;font-size:11pt;vertical-align:middle;overflow-wrap:break-word;`;
const ROTULO = `${CEL}font-weight:bold;`;
const VALOR = `${CEL}font-style:italic;`;
const CABECALHO = `${CEL}font-weight:bold;text-align:center;background:#d9e1f2;`;
const COLUNA = `${CEL}font-weight:bold;font-style:italic;text-align:center;font-size:10pt;padding:6px 4px;`;

const td = (estilo: string, conteudo: string, colspan = 1) =>
  `<td style="${estilo}"${colspan > 1 ? ` colspan="${colspan}"` : ""}>${conteudo}</td>`;

const secao = (titulo: string) => `<tr>${td(CABECALHO, titulo, COLUNAS)}</tr>`;

/** Linha "rótulo | valor | rótulo | valor" do cabeçalho do modelo (4 + 5 colunas). */
const parRotulos = (r1: string, v1: string | undefined, r2?: string, v2?: string) =>
  `<tr>${td(ROTULO, r1)}${td(VALOR, esc(v1), r2 ? 3 : COLUNAS - 1)}${
    r2 ? td(ROTULO, r2, 2) + td(VALOR, esc(v2), 3) : ""
  }</tr>`;

/** Bloco de colunas: linha de títulos + linha de valores, cada item com seu colspan. */
const blocoColunas = (itens: { titulo: string; valor: string | undefined; span?: number }[]) =>
  `<tr>${itens.map((i) => td(COLUNA, esc(i.titulo), i.span)).join("")}</tr>` +
  `<tr>${itens.map((i) => td(`${CEL}text-align:center;`, esc(i.valor), i.span)).join("")}</tr>`;

function situacao(s: Solicitacao) {
  if (s.status === "Validada") return s.conclusao?.inventariado ? "Validada · inventariado" : "Validada";
  return s.status;
}

function validado(s: Solicitacao) {
  if (s.status === "Validada") return "Sim";
  if (s.status === "Cancelada") return "Não";
  return "Em validação";
}

export function fichaModeloHtml(s: Solicitacao) {
  const { calculo, recalculo } = ultimos(s.calculosTier);
  const param = (recalculo ?? calculo)?.parametros ?? s.informacoesAdicionais;
  const tier = calculo ? (recalculo ? `${calculo.tier} / ${recalculo.tier}` : calculo.tier) : undefined;
  const mrm = recalculo?.ajusteMrm;
  const matriz = s.matrizesRisco?.[s.matrizesRisco.length - 1];
  const finalizada = dataFinalizacaoAnalise(s);
  const info = s.informacoesModelo;

  const linhas = [
    `<tr><td style="${CEL}font-weight:bold;font-size:14pt;text-align:center;border:none;padding:12px 8px;" colspan="${COLUNAS}">Relatório Individual de Modelo</td></tr>`,
    `<tr>${td(`${ROTULO}background:#d9e1f2;`, "Nome do Modelo:")}${td(
      `${VALOR}font-weight:bold;background:#d9e1f2;`,
      esc(s.nomeModelo),
      COLUNAS - 1,
    )}</tr>`,
    parRotulos("Assunto:", s.assunto, "Tipo de Modelo:", s.tipoModelo),
    parRotulos("Público:", s.publico, "Situação do Modelo:", situacao(s)),
    parRotulos("Área Gestora:", s.areaGestora, "Data da Validação:", finalizada ? formatDate(finalizada) : undefined),
    parRotulos("Objetivo:", s.objetivo),

    secao("Cálculo do Tier"),
    blocoColunas([
      { titulo: "Materialidade", valor: param?.materialidade },
      { titulo: "Impacto", valor: param?.impactoDecisao },
      { titulo: "Complexidade", valor: param?.complexidade },
      { titulo: "Novo Algoritmo?", valor: param?.novoAlgoritmo },
      { titulo: "Novo Produto?", valor: param?.novoProduto },
      { titulo: "Automatizado?", valor: param?.implementacaoAutomatizada },
      { titulo: "MRM", valor: mrm === undefined ? undefined : mrm > 0 ? `+${mrm}` : String(mrm) },
      { titulo: "Override", valor: recalculo?.override ?? (calculo ? "Não" : undefined) },
      { titulo: "Tier (cálculo / recálculo)", valor: tier },
    ]),

    secao("Matriz de Risco"),
    blocoColunas([
      { titulo: "Validado", valor: validado(s) },
      { titulo: "Nota de Classificação", valor: matriz ? rotuloNota(matriz.nota) : undefined, span: 2 },
      { titulo: "Classificação de Risco", valor: matriz?.classificacaoRisco, span: 2 },
      { titulo: "Prazo de Revalidação (meses)", valor: matriz?.prazoRevalidacaoMeses },
      { titulo: "Alçada Sugerida", valor: matriz?.alcadaSugerida, span: 2 },
      { titulo: "Analista", valor: s.analistaResponsavel },
    ]),

    secao("Informações do Modelo"),
    ...SECOES_INFORMACOES_MODELO.filter((sec) => sec.obrigatorio || info?.[sec.campo]?.trim()).map(
      (sec) =>
        `<tr>${td(`${ROTULO}vertical-align:top;`, sec.titulo, 2)}${td(
          `${CEL}vertical-align:top;`,
          esc(info?.[sec.campo]),
          COLUNAS - 2,
        )}</tr>`,
    ),
  ];

  const titulo = `Ficha do modelo ${s.numero}`;
  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="utf-8">
<title>${esc(titulo)}</title>
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
<p style="font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#555;margin-top:8px;">
Solicitação ${esc(s.numero)} · gerado em ${new Date().toLocaleString("pt-BR")}
</p>
</body>
</html>`;
}

/** Baixa a ficha como .xls (HTML que o Excel abre como planilha). */
export function baixarFichaExcel(s: Solicitacao) {
  const blob = new Blob(["﻿", fichaModeloHtml(s)], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ficha_${s.numero}_${s.nomeModelo.replace(/[^\p{L}\p{N}]+/gu, "_")}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
