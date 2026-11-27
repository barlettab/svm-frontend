"""Gera o Word (Evoluções) a partir de um .md do handoff, reaproveitando cabeçalho, margens e
formatação de um .docx modelo.

Uso:
    1. Renderizar cada bloco ```mermaid do .md em fluxo1.png, fluxo2.png… (na ordem em que aparecem)
       numa pasta, por exemplo com:
       npx -y @mermaid-js/mermaid-cli@11.4.0 -i fluxo1.mmd -o PASTA/fluxo1.png -s 3 -b white
    2. Descompactar o .docx modelo:       unzip modelo.docx -d un/
    3. Rodar:                            python3 md2docx.py ARQUIVO.md un/ PASTA
    4. Recompactar:                      (cd un && zip -qXrD ../saida.docx .)

Formatos do .md entendidos: # título, ## seção (quebra de página a partir da 2ª), ### subtítulo,
> história, listas com "-" (até 3 níveis) e "1." (numeradas, com recuo), tabelas com "|",
![legenda](img/arquivo.png) seguida de *legenda*, blocos ```mermaid, **negrito** e `código`.

Padrão visual (o mesmo do "Fluxo do Solicitante.docx"), aplicado qualquer que seja o modelo:
Aptos 11 pt, texto justificado, espaçamento entre linhas 1,15 e 8 pt depois do parágrafo; título e
seções em negrito 14 pt com faixa cinza; listas e passos numerados sem espaço entre os itens;
marcadores ▪ (1º nível) e o (2º nível).
"""
import os, re, shutil, struct, sys
from xml.sax.saxutils import escape

MD, UN, FLUXOS = sys.argv[1], sys.argv[2], sys.argv[3]
TEXT_W = 5400040            # largura útil da página A4 com as margens do modelo (EMU)
MAX_H = 7800000             # altura máxima de imagem (EMU)

doc = open(os.path.join(UN, "word/document.xml"), encoding="utf8").read()
head = doc[: doc.index("<w:body>") + len("<w:body>")]
sect = re.search(r"<w:sectPr.*?</w:sectPr>", doc, flags=re.S).group(0)

# Relacionamentos: remove as imagens antigas e mantém o resto (cabeçalhos, estilos…).
rels_path = os.path.join(UN, "word/_rels/document.xml.rels")
rels = open(rels_path, encoding="utf8").read()
for m in re.findall(r'<Relationship [^>]*Target="media/([^"]+)"/>', rels):
    f = os.path.join(UN, "word/media", m)
    if os.path.exists(f):
        os.remove(f)
rels = re.sub(r'<Relationship [^>]*relationships/image"[^>]*/>', "", rels)
rels = re.sub(r'<Relationship [^>]*Target="media/[^"]*"/>', "", rels)
os.makedirs(os.path.join(UN, "word/media"), exist_ok=True)

# Comentários de revisão do modelo: o texto a que estavam ancorados é substituído, e comentários
# sem âncora fazem o Word acusar "conteúdo ilegível". Remove as partes de comentário (e pessoas).
PARTES_COMENTARIO = ("comments.xml", "commentsExtended.xml", "commentsIds.xml", "commentsExtensible.xml", "people.xml")
for parte in PARTES_COMENTARIO:
    rels = re.sub(r'<Relationship [^>]*Target="%s"[^>]*/>' % re.escape(parte), "", rels)
    f = os.path.join(UN, "word", parte)
    if os.path.exists(f):
        os.remove(f)
ct_path = os.path.join(UN, "[Content_Types].xml")
ct = open(ct_path, encoding="utf8").read()
for parte in PARTES_COMENTARIO:
    ct = re.sub(r'<Override [^>]*PartName="/word/%s"[^>]*/>' % re.escape(parte), "", ct)
open(ct_path, "w", encoding="utf8").write(ct)
new_rels = []
pic_id = [1000]

# ── Padrão visual dos documentos (igual ao "Fluxo do Solicitante.docx") ──────────────────────
# Fonte Aptos 11 pt; espaçamento entre linhas 1,15 e 8 pt depois de cada parágrafo; itens de
# lista sem espaço entre si (Parágrafo da Lista com espaçamento contextual); marcadores ▪ e o.
FONTE = "Aptos"
st_path = os.path.join(UN, "word/styles.xml")
st = open(st_path, encoding="utf8").read()
st = re.sub(
    r"<w:docDefaults>.*?</w:docDefaults>",
    '<w:docDefaults><w:rPrDefault><w:rPr>'
    f'<w:rFonts w:ascii="{FONTE}" w:hAnsi="{FONTE}" w:eastAsia="{FONTE}" w:cs="{FONTE}"/>'
    '<w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault>'
    '<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>'
    "</w:docDefaults>",
    st, flags=re.S,
)
st = re.sub(
    r'<w:style w:type="paragraph" w:styleId="ListParagraph">.*?</w:style>',
    '<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/>'
    '<w:basedOn w:val="Normal"/><w:uiPriority w:val="34"/><w:qFormat/>'
    '<w:pPr><w:ind w:left="720"/><w:contextualSpacing/></w:pPr></w:style>',
    st, flags=re.S,
)
open(st_path, "w", encoding="utf8").write(st)

nb_path = os.path.join(UN, "word/numbering.xml")
nb = open(nb_path, encoding="utf8").read()
MARCADOR = {0: ("\uf0a7", "Wingdings"), 1: ("o", "Courier New"), 2: ("\uf0a7", "Wingdings")}  # ▪, o, ▪


def _nivel(m):
    """Troca o marcador de um nível de lista (grupo 1 = nível, 2 = atributos, 3 = conteúdo)."""
    lvl = int(m.group(1))
    txt, fonte = MARCADOR[lvl % 3]
    corpo = re.sub(r'<w:lvlText w:val="[^"]*"/>', f'<w:lvlText w:val="{txt}"/>', m.group(3))
    corpo = re.sub(r"<w:rPr>.*?</w:rPr>", "", corpo, flags=re.S)
    corpo = corpo.replace("</w:pPr>", f'</w:pPr><w:rPr><w:rFonts w:ascii="{fonte}" w:hAnsi="{fonte}" w:hint="default"/></w:rPr>', 1)
    return f'<w:lvl w:ilvl="{lvl}"{m.group(2)}>{corpo}</w:lvl>'


nb = re.sub(r'<w:lvl w:ilvl="(\d)"([^>]*)>(.*?)</w:lvl>', _nivel, nb, flags=re.S)
open(nb_path, "w", encoding="utf8").write(nb)


def png_size(path):
    b = open(path, "rb").read(24)
    return struct.unpack(">II", b[16:24])


def add_image(src):
    n = len(new_rels) + 1
    name = f"img{n:02d}.png"
    shutil.copy(src, os.path.join(UN, "word/media", name))
    rid = f"rIdImg{n}"
    new_rels.append(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{name}"/>')
    w, h = png_size(src)
    cx = TEXT_W
    cy = int(cx * h / w)
    if cy > MAX_H:
        cy = MAX_H
        cx = int(cy * w / h)
    pic_id[0] += 1
    pid = pic_id[0]
    return (
        f'<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">'
        f'<wp:extent cx="{cx}" cy="{cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'
        f'<wp:docPr id="{pid}" name="Imagem {pid}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>'
        f'<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        f'<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="{pid}" name="{name}"/><pic:cNvPicPr/></pic:nvPicPr>'
        f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>'
        f"</a:graphicData></a:graphic></wp:inline></w:drawing></w:r>"
    )


def runs(text, base="", sz=None):
    """Texto com **negrito**, `código` e [links](url) → runs do Word."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    out = []
    for part in re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text):
        if not part:
            continue
        rpr = base
        if part.startswith("**"):
            part = part[2:-2]
            rpr += "<w:b/><w:bCs/>"
        elif part.startswith("`"):
            part = part[1:-1]
            rpr += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>'
        if sz:
            rpr += f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>'
        rpr = f"<w:rPr>{rpr}</w:rPr>" if rpr else ""
        out.append(f'<w:r>{rpr}<w:t xml:space="preserve">{escape(part)}</w:t></w:r>')
    return "".join(out)


def para(content, ppr="", jc="both"):
    return f'<w:p><w:pPr>{ppr}<w:jc w:val="{jc}"/></w:pPr>{content}</w:p>'


B = "<w:b/><w:bCs/>"
BU = '<w:b/><w:bCs/><w:u w:val="single"/>'
body = []


def section(t, quebra=True):
    pb = "<w:pageBreakBefore/>" if quebra else ""
    body.append(f'<w:p><w:pPr><w:keepNext/>{pb}<w:shd w:val="clear" w:color="auto" w:fill="E8E8E8" w:themeFill="background2"/><w:jc w:val="both"/></w:pPr>{runs(t, B, 28)}</w:p>')


def subsection(t, center=False):
    body.append(f'<w:p><w:pPr><w:keepNext/><w:spacing w:before="240"/><w:jc w:val="{"center" if center else "both"}"/></w:pPr>{runs(t, BU)}</w:p>')


def bullet(t, lvl):
    body.append(f'<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="{lvl}"/><w:numId w:val="2"/></w:numPr><w:jc w:val="both"/></w:pPr>{runs(t)}</w:p>')


def cell(t, header, sz):
    mar = '<w:tcMar><w:top w:w="75" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="75" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>'
    shd = '<w:shd w:val="clear" w:color="auto" w:fill="E8E8E8"/>' if header else ""
    t = t.replace("\\|", "|")
    return (f'<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/>{shd}{mar}<w:vAlign w:val="center"/></w:tcPr>'
            f'<w:p><w:pPr><w:spacing w:after="0"/></w:pPr>{runs(t, B if header else "", sz)}</w:p></w:tc>')


def table(rows):
    ncols = len(rows[0])
    sz = 18 if ncols > 3 else 20
    tblpr = ('<w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>'
             + "".join(f'<w:{s} w:val="single" w:sz="4" w:space="0" w:color="auto"/>' for s in ("top", "left", "bottom", "right", "insideH", "insideV"))
             + '</w:tblBorders><w:tblLayout w:type="autofit"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>')
    grid = "<w:tblGrid>" + "".join(f'<w:gridCol w:w="{8504 // ncols}"/>' for _ in range(ncols)) + "</w:tblGrid>"
    trs = []
    for i, r in enumerate(rows):
        trpr = "<w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>" if i == 0 else "<w:trPr><w:cantSplit/></w:trPr>"
        trs.append(f"<w:tr>{trpr}" + "".join(cell(c, i == 0, sz) for c in r) + "</w:tr>")
    body.append(f"<w:tbl>{tblpr}{grid}{''.join(trs)}</w:tbl>")
    body.append(para("", '<w:spacing w:after="0"/>'))


def image(src, caption=None):
    body.append(para(add_image(src), '<w:keepNext/><w:spacing w:before="120" w:after="60"/>', "center"))
    if caption:
        body.append(para(runs(caption, "<w:i/><w:iCs/>", 20), '<w:spacing w:after="240"/>', "center"))


def split_row(line):
    line = line.strip().strip("|")
    return [c.strip() for c in re.split(r"(?<!\\)\|", line)]


lines = open(MD, encoding="utf8").read().split("\n")
i = fluxo_n = sec_count = 0
while i < len(lines):
    ln = lines[i]
    s = ln.strip()
    if not s or s == "---":
        i += 1; continue
    if s.startswith("```mermaid"):
        fluxo_n += 1
        while not lines[i + 1].strip().startswith("```"):
            i += 1
        i += 2
        image(os.path.join(FLUXOS, f"fluxo{fluxo_n}.png"))
        continue
    if s.startswith("# "):
        section(s[2:], quebra=False); i += 1; continue
    if s.startswith("## "):
        sec_count += 1
        section(s[3:], quebra=sec_count > 1); i += 1; continue
    if s.startswith("### "):
        t = s[4:]
        subsection(t, center=t.startswith("Fluxo")); i += 1; continue
    if s.startswith("!["):
        m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", s)
        cap = None
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j < len(lines) and re.match(r"^\*[^*].*\*$", lines[j].strip()):
            cap = lines[j].strip()[1:-1]
            i = j
        image(os.path.join(os.path.dirname(MD), m.group(2)), cap or m.group(1))
        i += 1; continue
    if s.startswith("|"):
        rows = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            r = split_row(lines[i])
            if not all(re.fullmatch(r":?-{3,}:?", c) for c in r):
                rows.append(r)
            i += 1
        table(rows); continue
    if s.startswith("> "):
        body.append(para(runs(s[2:]), '<w:shd w:val="clear" w:color="auto" w:fill="F3F6FA"/><w:ind w:left="284" w:right="284"/>'))
        i += 1; continue
    m = re.match(r"^( *)- (.*)$", ln)
    if m:
        bullet(m.group(2), min(len(m.group(1)) // 2, 2)); i += 1; continue
    m = re.match(r"^( *)(\d+)\. \[( |x)\] (.*)$", ln)
    if m:
        box = "☑" if m.group(3) == "x" else "☐"
        body.append(para(runs(f"{m.group(2)}. {box} {m.group(4)}"), '<w:spacing w:after="80"/><w:ind w:left="284" w:hanging="284"/>'))
        i += 1; continue
    m = re.match(r"^( *)(\d+)\. (.*)$", ln)
    if m:
        ind = 284 + 284 * (len(m.group(1)) // 3)
        body.append(para(runs(f"{m.group(2)}. {m.group(3)}"), f'<w:pStyle w:val="ListParagraph"/><w:ind w:left="{ind + 284}" w:hanging="284"/>'))
        i += 1; continue
    if re.match(r"^\*[^*].*\*$", s):
        body.append(para(runs(s[1:-1], "<w:i/><w:iCs/>", 20), "", "center")); i += 1; continue
    body.append(para(runs(s)))
    i += 1

xml = head + "".join(body) + sect + "</w:body></w:document>"
open(os.path.join(UN, "word/document.xml"), "w", encoding="utf8").write(xml)
rels = rels.replace("</Relationships>", "".join(new_rels) + "</Relationships>")
open(rels_path, "w", encoding="utf8").write(rels)
print(f"{len(body)} blocos, {len(new_rels)} imagens, {fluxo_n} fluxos")
