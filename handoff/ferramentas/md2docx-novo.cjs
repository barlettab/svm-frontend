/**
 * Gera um .docx NOVO (do zero, sem usar arquivo modelo) a partir de um .md do handoff.
 *
 * Uso:
 *   1. Renderizar cada bloco ```mermaid do .md em fluxo1.png, fluxo2.png… numa pasta:
 *      npx -y @mermaid-js/mermaid-cli@11.4.0 -i fluxo1.mmd -o PASTA/fluxo1.png -s 3 -b white
 *   2. Instalar a biblioteca numa pasta qualquer:  npm install docx@9.5.1
 *   3. Rodar: NODE_PATH=<pasta>/node_modules node md2docx-novo.cjs ARQUIVO.md PASTA_FLUXOS SAIDA.docx
 *
 * Entende: # título, ## seção (nova página a partir da 2ª), ### subtítulo, > história,
 * listas "-" (até 3 níveis) e "1." (com recuo), tabelas "|", ![legenda](img/x.png) + *legenda*,
 * blocos ```mermaid, **negrito** e `código`. Cabeçalho com a classificação "#00 Pública".
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Header,
  AlignmentType, LevelFormat, WidthType, ShadingType, BorderStyle, PageBreak,
} = require("docx");

const [MD, FLUXOS, SAIDA] = process.argv.slice(2);
const BASE = path.dirname(MD);
const FONTE = "Calibri";
const LARG_UTIL = 8504; // A4 com margens de 3 cm (dxa)
const IMG_LARG_PX = 567; // ~15 cm
const IMG_ALT_MAX_PX = 800;

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

/** Texto com **negrito**, `código` e [link](url) → TextRuns. */
function runs(texto, extra = {}) {
  texto = texto.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return texto
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    .filter(Boolean)
    .map((p) => {
      if (p.startsWith("**")) return new TextRun({ text: p.slice(2, -2), bold: true, font: FONTE, ...extra });
      if (p.startsWith("`")) return new TextRun({ text: p.slice(1, -1), font: "Consolas", ...extra });
      return new TextRun({ text: p, font: FONTE, ...extra });
    });
}

const blocos = [];
let fluxo = 0;
let secoes = 0;

function imagem(arquivo, legenda) {
  const { w, h } = pngSize(arquivo);
  let lw = IMG_LARG_PX;
  let lh = Math.round((lw * h) / w);
  if (lh > IMG_ALT_MAX_PX) {
    lh = IMG_ALT_MAX_PX;
    lw = Math.round((lh * w) / h);
  }
  blocos.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      keepNext: true,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(arquivo), transformation: { width: lw, height: lh } })],
    }),
  );
  if (legenda)
    blocos.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: runs(legenda, { italics: true, size: 20 }) }),
    );
}

function tabela(linhas) {
  const n = linhas[0].length;
  // largura de cada coluna proporcional ao texto (mín. 900 dxa)
  const peso = Array.from({ length: n }, (_, c) =>
    Math.max(6, Math.min(60, Math.max(...linhas.map((l) => (l[c] || "").replace(/\*\*/g, "").length)))),
  );
  const soma = peso.reduce((a, b) => a + b, 0);
  let larg = peso.map((p) => Math.max(900, Math.round((p / soma) * LARG_UTIL)));
  const ajuste = LARG_UTIL - larg.reduce((a, b) => a + b, 0);
  larg[larg.indexOf(Math.max(...larg))] += ajuste;
  const borda = { style: BorderStyle.SINGLE, size: 4, color: "808080" };
  const bordas = { top: borda, bottom: borda, left: borda, right: borda };
  const tam = n > 3 ? 18 : 20;
  blocos.push(
    new Table({
      width: { size: LARG_UTIL, type: WidthType.DXA },
      columnWidths: larg,
      rows: linhas.map(
        (l, i) =>
          new TableRow({
            tableHeader: i === 0,
            cantSplit: true,
            children: l.map(
              (txt, c) =>
                new TableCell({
                  width: { size: larg[c], type: WidthType.DXA },
                  borders: bordas,
                  shading: i === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "E8E8E8" } : undefined,
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                  children: [new Paragraph({ children: runs(txt.replace(/\\\|/g, "|"), { size: tam, ...(i === 0 ? { bold: true } : {}) }) })],
                }),
            ),
          }),
      ),
    }),
  );
  blocos.push(new Paragraph({ children: [] }));
}

const linhas = fs.readFileSync(MD, "utf8").split("\n");
for (let i = 0; i < linhas.length; i++) {
  const ln = linhas[i];
  const s = ln.trim();
  if (!s || s === "---") continue;
  if (s.startsWith("```mermaid")) {
    while (!linhas[i + 1].trim().startsWith("```")) i++;
    i++;
    fluxo++;
    imagem(path.join(FLUXOS, `fluxo${fluxo}.png`));
    continue;
  }
  if (s.startsWith("# ")) {
    blocos.push(new Paragraph({ spacing: { after: 240 }, children: runs(s.slice(2), { bold: true, size: 32 }) }));
    continue;
  }
  if (s.startsWith("## ")) {
    secoes++;
    blocos.push(
      new Paragraph({
        pageBreakBefore: secoes > 1,
        keepNext: true,
        spacing: { before: 120, after: 160 },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "E8E8E8" },
        children: runs(s.slice(3), { bold: true, size: 28 }),
      }),
    );
    continue;
  }
  if (s.startsWith("### ")) {
    const t = s.slice(4);
    blocos.push(
      new Paragraph({
        keepNext: true,
        alignment: t.startsWith("Fluxo") ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 280, after: 120 },
        children: runs(t, { bold: true, underline: {}, size: 24 }),
      }),
    );
    continue;
  }
  if (s.startsWith("![")) {
    const m = s.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    let legenda = m[1];
    let j = i + 1;
    while (j < linhas.length && !linhas[j].trim()) j++;
    if (j < linhas.length && /^\*[^*].*\*$/.test(linhas[j].trim())) {
      legenda = linhas[j].trim().slice(1, -1);
      i = j;
    }
    imagem(path.join(BASE, m[2]), legenda);
    continue;
  }
  if (s.startsWith("|")) {
    const tab = [];
    while (i < linhas.length && linhas[i].trim().startsWith("|")) {
      const cel = linhas[i].trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim());
      if (!cel.every((c) => /^:?-{3,}:?$/.test(c))) tab.push(cel);
      i++;
    }
    i--;
    tabela(tab);
    continue;
  }
  if (s.startsWith("> ")) {
    blocos.push(
      new Paragraph({
        spacing: { before: 60, after: 160 },
        indent: { left: 284, right: 284 },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3F6FA" },
        children: runs(s.slice(2)),
      }),
    );
    continue;
  }
  let m = ln.match(/^( *)- (.*)$/);
  if (m) {
    blocos.push(
      new Paragraph({ numbering: { reference: "marcadores", level: Math.min(Math.floor(m[1].length / 2), 2) }, spacing: { after: 40 }, children: runs(m[2]) }),
    );
    continue;
  }
  m = ln.match(/^( *)(\d+)\. (.*)$/);
  if (m) {
    const nivel = Math.floor(m[1].length / 3);
    blocos.push(
      new Paragraph({
        spacing: { after: 40 },
        indent: { left: 568 + 284 * nivel, hanging: 284 },
        children: runs(`${m[2]}. ${m[3]}`),
      }),
    );
    continue;
  }
  if (/^\*[^*].*\*$/.test(s)) {
    blocos.push(new Paragraph({ alignment: AlignmentType.CENTER, children: runs(s.slice(1, -1), { italics: true, size: 20 }) }));
    continue;
  }
  blocos.push(new Paragraph({ spacing: { after: 120 }, children: runs(s) }));
}

const cabecalho = new Header({
  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "#00 Pública", font: FONTE, size: 16, color: "808080" })] })],
});

const doc = new Document({
  creator: "SVM",
  title: "Evoluções do SVM — Fluxo do Solicitante",
  styles: { default: { document: { run: { font: FONTE, size: 22 } } } },
  numbering: {
    config: [
      {
        reference: "marcadores",
        levels: [0, 1, 2].map((lvl) => ({
          level: lvl,
          format: LevelFormat.BULLET,
          text: ["•", "◦", "▪"][lvl],
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 568 + 360 * lvl, hanging: 284 } } },
        })),
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1417, right: 1701, bottom: 1417, left: 1701, header: 708, footer: 708 } },
      },
      headers: { default: cabecalho },
      children: blocos,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(SAIDA, buf);
  console.log(`${blocos.length} blocos, ${fluxo} fluxo(s) → ${SAIDA}`);
});
