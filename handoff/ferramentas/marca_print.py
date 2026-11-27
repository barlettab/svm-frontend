"""Marca prints da tela atual: X vermelho = sai · quadro laranja = muda · etiqueta verde = novo.

Uso: python3 marca_print.py   (gera os arquivos *-marcado.png em handoff/img)
Requer Pillow. As coordenadas são do print original (antes da ampliação 2×).
"""
import os
from PIL import Image, ImageDraw, ImageFont

IMG = os.path.join(os.path.dirname(__file__), "..", "img")
FONTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
K = 2
VERM, LARANJA, VERDE = (211, 47, 47), (230, 120, 0), (46, 125, 50)


class Marcador:
    def __init__(self, nome):
        im = Image.open(os.path.join(IMG, nome)).convert("RGB")
        self.im = im.resize((im.width * K, im.height * K), Image.LANCZOS)
        self.d = ImageDraw.Draw(self.im)
        self.f = ImageFont.truetype(FONTE, 22)

    def _b(self, x0, y0, x1, y1):
        return [v * K for v in (x0, y0, x1, y1)]

    def etiqueta(self, x, y, texto, cor):
        """Etiqueta com o canto superior esquerdo em (x, y) — coordenadas do print original."""
        x, y = x * K, y * K
        pad, h = 8, 22 + 16
        tw = self.d.textlength(texto, font=self.f)
        x = max(4, min(x, self.im.width - tw - 2 * pad - 4))
        self.d.rectangle([x, y, x + tw + 2 * pad, y + h], fill=cor)
        self.d.text((x + pad, y + pad - 2), texto, fill="white", font=self.f)

    def sai(self, caixa, texto=None, onde=None):
        b = self._b(*caixa)
        self.d.rectangle(b, outline=VERM, width=5)
        self.d.line([(b[0], b[1]), (b[2], b[3])], fill=VERM, width=5)
        self.d.line([(b[0], b[3]), (b[2], b[1])], fill=VERM, width=5)
        if texto:
            self.etiqueta(*(onde or (caixa[0], caixa[1] - 22)), "SAI: " + texto, VERM)

    def muda(self, caixa, texto=None, onde=None):
        self.d.rectangle(self._b(*caixa), outline=LARANJA, width=5)
        if texto:
            self.etiqueta(*(onde or (caixa[0], caixa[1] - 22)), "MUDA: " + texto, LARANJA)

    def novo(self, x, y, texto):
        self.etiqueta(x, y, "NOVO: " + texto, VERDE)

    def substituida(self, texto):
        """Tela inteira sai: X vermelho de canto a canto e uma faixa central com o aviso."""
        w, h = self.im.size
        véu = Image.new("RGBA", (w, h), (255, 255, 255, 110))
        self.im = Image.alpha_composite(self.im.convert("RGBA"), véu).convert("RGB")
        self.d = ImageDraw.Draw(self.im)
        self.d.rectangle([0, 0, w - 1, h - 1], outline=VERM, width=10)
        self.d.line([(0, 0), (w, h)], fill=VERM, width=12)
        self.d.line([(0, h), (w, 0)], fill=VERM, width=12)
        f = ImageFont.truetype(FONTE, 44)
        linhas = texto.split("\n")
        alt = 60
        larg = max(self.d.textlength(l, font=f) for l in linhas) + 80
        x0, y0 = (w - larg) / 2, (h - alt * len(linhas) - 40) / 2
        self.d.rectangle([x0, y0, x0 + larg, y0 + alt * len(linhas) + 40], fill=VERM)
        for i, l in enumerate(linhas):
            tw = self.d.textlength(l, font=f)
            self.d.text(((w - tw) / 2, y0 + 20 + i * alt), l, fill="white", font=f)

    def salvar(self, nome):
        self.im.save(os.path.join(IMG, nome), optimize=True)
        print(nome, self.im.size)


# ── Novo modelo > Solicitação ────────────────────────────────────────────────
m = Marcador("00-hoje-novo-modelo-solicitacao.png")
m.sai((205, 129, 362, 146), "abas Implantação e Metodologia e Monitoramento", onde=(367, 128))
m.sai((164, 400, 1392, 576), "campo Observações", onde=(164, 377))
m.muda((164, 585, 1390, 661), "vira “Anexo(s)” com ícone (i) · vários arquivos, qualquer tipo", onde=(164, 663))
m.sai((1304, 661, 1390, 682), "Incluir outro anexo", onde=(1080, 662))
m.sai((1294, 695, 1343, 719), "Cancelar", onde=(1150, 697))
m.muda((1343, 695, 1390, 719), "vira Enviar", onde=(1300, 722))
m.salvar("00-hoje-novo-modelo-solicitacao-marcado.png")

# ── Consultar modelo > Em andamento ──────────────────────────────────────────
m = Marcador("00-hoje-em-andamento.png")
# Quase tudo muda: em vez de marcar item a item, a tela inteira é substituída pela Figura 7.
m.substituida("TELA SUBSTITUÍDA POR COMPLETO\nConstruir como na Figura 7.")
m.salvar("00-hoje-em-andamento-marcado.png")

# ── Consultar modelo > Inventariado (o solicitante também tem esta aba, com o mesmo nome) ──
m = Marcador("00-hoje-inventariado.png")
# Quase tudo muda: a tela inteira é substituída pela Figura 22.
m.substituida("TELA SUBSTITUÍDA POR COMPLETO\nConstruir como na Figura 22.")
m.salvar("00-hoje-inventariado-marcado.png")

# ── Consultar modelo > Cancelado ─────────────────────────────────────────────
m = Marcador("00-hoje-cancelado.png")
m.sai((298, 305, 372, 330), "coluna Área gestora (para o solicitante)", onde=(240, 282))
m.muda((726, 305, 885, 330), "→ “Analista responsável”", onde=(700, 334))
m.muda((1330, 305, 1395, 330), "botão Abrir → página da solicitação", onde=(1100, 334))
m.novo(560, 130, "coluna “Cancelada por” (Analista, Gestor GEVAM ou Solicitante)")
m.salvar("00-hoje-cancelado-marcado.png")

# ══ Documento do analista (EVOLUCOES-ANALISTA.md) ═══════════════════════════════

# ── Consultar modelo > Em andamento (analista): tela inteira substituída pela Figura 2 ──
m = Marcador("00-hoje-analista-em-andamento.png")
m.substituida("TELA SUBSTITUÍDA POR COMPLETO\nConstruir como na Figura 2.")
m.salvar("00-hoje-analista-em-andamento-marcado.png")

# ── Consultar modelo > Inventariado (GEVAM): tela inteira substituída pela Figura 28 ──
m = Marcador("00-hoje-inventariado.png")
m.substituida("TELA SUBSTITUÍDA POR COMPLETO\nConstruir como na Figura 28.")
m.salvar("00-hoje-analista-inventariado-marcado.png")

# ── Consultar modelo > Cancelado (GEVAM): muda pouco ──
m = Marcador("00-hoje-cancelado.png")
m.muda((726, 305, 885, 330), "→ “Analista responsável”", onde=(700, 334))
m.muda((1330, 305, 1395, 330), "botão Abrir → página da solicitação", onde=(1100, 334))
m.novo(560, 130, "coluna “Cancelada por” (Analista, Gestor GEVAM ou Solicitante)")
m.salvar("00-hoje-analista-cancelado-marcado.png")

# ── Novo modelo > Inventariar (analista): tela inteira substituída pela Figura 35 ──
m = Marcador("00-hoje-analista-inventariar.png")
m.substituida("TELA SUBSTITUÍDA POR COMPLETO\nConstruir como na Figura 35.")
m.salvar("00-hoje-analista-inventariar-marcado.png")
