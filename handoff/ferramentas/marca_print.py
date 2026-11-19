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

    def salvar(self, nome):
        self.im.save(os.path.join(IMG, nome), optimize=True)
        print(nome, self.im.size)


# ── Novo modelo > Solicitação ────────────────────────────────────────────────
m = Marcador("00-hoje-novo-modelo-solicitacao.png")
m.sai((205, 129, 362, 146), "abas Implantação e Metodologia e Monitoramento", onde=(367, 128))
m.sai((164, 400, 1392, 576), "campo Observações", onde=(164, 377))
m.muda((164, 585, 1390, 661), "vira “Relatório de desenvolvimento do modelo” · só 1 arquivo PDF", onde=(164, 663))
m.sai((1304, 661, 1390, 682), "Incluir outro anexo", onde=(1080, 662))
m.sai((1294, 695, 1343, 719), "Cancelar", onde=(1150, 697))
m.muda((1343, 695, 1390, 719), "vira Enviar", onde=(1300, 722))
m.salvar("00-hoje-novo-modelo-solicitacao-marcado.png")

# ── Consultar modelo > Em andamento ──────────────────────────────────────────
m = Marcador("00-hoje-em-andamento.png")
m.muda((155, 244, 456, 277), "Status → “Status da solicitação”", onde=(155, 279))
m.sai((466, 243, 769, 277), "Data da submissão (filtro)", onde=(470, 279))
m.sai((160, 376, 335, 860), "coluna Detalhes (+)", onde=(160, 352))
m.sai((828, 376, 988, 860), "Objetivo modelo", onde=(760, 352))
m.sai((990, 376, 1140, 860), "Tipo modelo", onde=(990, 352))
m.muda((1290, 376, 1395, 860), "olho → botão Abrir · clipe e lixeira saem (Responder e Cancelar ficam em Ações, dentro da solicitação)", onde=(560, 328))
m.novo(560, 130, "aviso de complementação pendente no topo da lista")
m.novo(560, 152, "filtro Analista responsável · colunas Solicitante, Data da submissão e Analista")
m.salvar("00-hoje-em-andamento-marcado.png")

# ── Consultar modelo > Inventariado (o solicitante também tem esta aba, com o mesmo nome) ──
m = Marcador("00-hoje-inventariado.png")
m.novo(325, 170, "o solicitante também vê esta aba: só a área dele e só leitura")
m.muda((143, 198, 450, 246), "→ “Modelos inventariados”", onde=(230, 222))
m.sai((464, 198, 768, 246), "Total de validados", onde=(560, 222))
m.sai((781, 198, 1084, 246), "Total de não validados", onde=(870, 222))
m.muda((1099, 198, 1403, 246), "vira quadro “Monitoramento 2ª Linha (GEVAM)”", onde=(1000, 176))
m.muda((143, 254, 1403, 301), "os 3 totais viram um quadro “Situação do modelo” (Ativos, Inativos, Suspensos)", onde=(380, 270))
m.sai((781, 359, 1079, 392), "filtro Status", onde=(781, 337))
m.sai((1093, 359, 1394, 392), "filtro Data da submissão", onde=(1093, 337))
m.sai((543, 488, 640, 838), "Área gestora", onde=(470, 466))
m.sai((715, 488, 778, 838), "Público", onde=(640, 444))
m.sai((780, 488, 845, 838), "Tier", onde=(780, 466))
m.sai((850, 488, 985, 838), "Resultado da validação", onde=(850, 444))
m.muda((988, 488, 1085, 838), "→ “Monitoramento 2ª Linha (GEVAM)” · sem “Não se aplica”", onde=(900, 422))
m.muda((150, 488, 445, 838), "nº da solicitação + nome → coluna “Modelo” (nome e nº do inventário)", onde=(150, 422))
m.novo(560, 130, "filtros Monitoramento 2ª Linha (GEVAM) e Situação do modelo · coluna “Validado em”")
m.salvar("00-hoje-inventariado-marcado.png")

# ── Consultar modelo > Cancelado ─────────────────────────────────────────────
m = Marcador("00-hoje-cancelado.png")
m.sai((298, 305, 372, 330), "coluna Área gestora (para o solicitante)", onde=(240, 282))
m.muda((726, 305, 885, 330), "→ “Analista responsável”", onde=(700, 334))
m.muda((1330, 305, 1395, 330), "botão Abrir → página da solicitação", onde=(1100, 334))
m.novo(560, 130, "coluna “Cancelada por” (Analista, Gestor GEVAM ou Solicitante)")
m.salvar("00-hoje-cancelado-marcado.png")
