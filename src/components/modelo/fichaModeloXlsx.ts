import ExcelJS from "exceljs";
import type { Solicitacao } from "../../types";
import { COLUNAS, LARGURAS, LOGO_FICHA, conteudoFicha, type ItemColuna, type ParCabecalho } from "./fichaModelo";

/**
 * Ficha do modelo em .xlsx (planilha de verdade, sem o aviso de formato do Excel).
 * Mesmo layout da pré-visualização: 9 colunas, logo do banco no topo, células mescladas,
 * bordas finas, títulos de seção em azul-claro e texto com quebra de linha.
 */

const AZUL = "FFD9E1F2";
const FONTE = "Calibri";
const BORDA: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

/** Busca o logo em public/. Sem o arquivo, a ficha sai sem logo (não quebra o download). */
async function carregarLogo(): Promise<{ buffer: ArrayBuffer; largura: number; altura: number } | null> {
  try {
    const resp = await fetch(LOGO_FICHA);
    if (!resp.ok || !resp.headers.get("content-type")?.startsWith("image/")) return null;
    const blob = await resp.blob();
    const bmp = await createImageBitmap(blob);
    return { buffer: await blob.arrayBuffer(), largura: bmp.width, altura: bmp.height };
  } catch {
    return null;
  }
}

/** Largura (em caracteres) das colunas de `inicio` a `inicio + span - 1`. */
const larguraDe = (inicio: number, span: number) => LARGURAS.slice(inicio - 1, inicio - 1 + span).reduce((a, b) => a + b, 0);

/** O Excel não ajusta a altura de células mescladas: estima pelas linhas de texto. */
function alturaPara(texto: string, larguraChars: number, tamanho = 11) {
  const porLinha = Math.max(8, Math.floor(larguraChars * 1.1 * (11 / tamanho)));
  const linhas = texto.split("\n").reduce((n, p) => n + Math.max(1, Math.ceil(p.length / porLinha)), 0);
  return Math.max(20, linhas * 15 + 6);
}

export async function fichaModeloXlsx(s: Solicitacao): Promise<Blob> {
  const c = conteudoFicha(s);
  const wb = new ExcelJS.Workbook();
  wb.creator = "SVM";
  wb.created = new Date();
  const ws = wb.addWorksheet("Ficha do modelo", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ showGridLines: false }],
  });
  ws.columns = LARGURAS.map((width) => ({ width }));

  let r = 0;
  /** Escreve um valor mesclando `span` colunas a partir de `col` e aplica o estilo. */
  function celula(
    col: number,
    span: number,
    texto: string,
    estilo: { negrito?: boolean; italico?: boolean; centro?: boolean; topo?: boolean; fundo?: string; tamanho?: number; borda?: boolean } = {},
  ) {
    if (span > 1) ws.mergeCells(r, col, r, col + span - 1);
    const cel = ws.getCell(r, col);
    cel.value = texto;
    cel.font = { name: FONTE, size: estilo.tamanho ?? 11, bold: estilo.negrito, italic: estilo.italico };
    cel.alignment = {
      wrapText: true,
      vertical: estilo.topo ? "top" : "middle",
      horizontal: estilo.centro ? "center" : "left",
    };
    for (let k = col; k < col + span; k++) {
      const c2 = ws.getCell(r, k);
      if (estilo.borda !== false) c2.border = BORDA;
      if (estilo.fundo) c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: estilo.fundo } };
    }
  }
  const novaLinha = (altura = 20) => {
    r += 1;
    ws.getRow(r).height = altura;
  };

  // ── Logo + título ──
  novaLinha(48);
  const logo = await carregarLogo();
  if (logo) {
    const id = wb.addImage({ buffer: logo.buffer, extension: "png" });
    const altura = 44;
    ws.addImage(id, { tl: { col: 0.1, row: 0.1 }, ext: { width: (logo.largura / logo.altura) * altura, height: altura } });
  }
  celula(3, COLUNAS - 2, "Relatório Individual de Modelo", { negrito: true, centro: true, tamanho: 14, borda: false });

  // ── Cabeçalho do modelo ──
  novaLinha(alturaPara(c.nomeModelo, larguraDe(2, COLUNAS - 1)));
  celula(1, 1, "Nome do Modelo:", { negrito: true, fundo: AZUL });
  celula(2, COLUNAS - 1, c.nomeModelo, { negrito: true, italico: true, fundo: AZUL });
  for (const p of c.cabecalho as ParCabecalho[]) {
    const larguraV1 = p.r2 ? larguraDe(2, 3) : larguraDe(2, COLUNAS - 1);
    novaLinha(Math.max(alturaPara(p.v1, larguraV1), p.v2 ? alturaPara(p.v2, larguraDe(7, 3)) : 20));
    celula(1, 1, p.r1, { negrito: true });
    if (p.r2) {
      celula(2, 3, p.v1, { italico: true });
      celula(5, 2, p.r2, { negrito: true });
      celula(7, 3, p.v2 ?? "—", { italico: true });
    } else {
      celula(2, COLUNAS - 1, p.v1, { italico: true });
    }
  }

  // ── Blocos em colunas ──
  const secao = (titulo: string) => {
    novaLinha(22);
    celula(1, COLUNAS, titulo, { negrito: true, centro: true, fundo: AZUL });
  };
  const blocoColunas = (itens: ItemColuna[]) => {
    let col = 1;
    const posicoes = itens.map((i) => {
      const p = { ...i, col };
      col += i.span;
      return p;
    });
    novaLinha(Math.max(...posicoes.map((p) => alturaPara(p.titulo, larguraDe(p.col, p.span), 10))));
    posicoes.forEach((p) => celula(p.col, p.span, p.titulo, { negrito: true, italico: true, centro: true, tamanho: 10 }));
    novaLinha(Math.max(...posicoes.map((p) => alturaPara(p.valor, larguraDe(p.col, p.span)))));
    posicoes.forEach((p) => celula(p.col, p.span, p.valor, { centro: true }));
  };

  secao("Cálculo do Tier");
  blocoColunas(c.tier);
  secao("Matriz de Risco");
  blocoColunas(c.matriz);

  // ── Informações do Modelo ──
  secao("Informações do Modelo");
  for (const sec of c.secoes) {
    novaLinha(alturaPara(sec.texto, larguraDe(3, COLUNAS - 2)));
    celula(1, 2, sec.titulo, { negrito: true, topo: true });
    celula(3, COLUNAS - 2, sec.texto, { topo: true });
  }

  // ── Rodapé ──
  novaLinha(8);
  novaLinha(16);
  celula(1, COLUNAS, c.rodape, { tamanho: 9, borda: false });
  ws.getCell(r, 1).font = { name: FONTE, size: 9, color: { argb: "FF555555" } };

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
