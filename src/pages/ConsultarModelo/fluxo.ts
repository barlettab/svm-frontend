import type { Profile, Solicitacao, SolicitacaoStatus } from "../../types";

/**
 * Regras do fluxo da Validação Independente (processo 15.11.02):
 *
 *   Solicitante envia → Submetido
 *   Analista abre uma Submetido → atribuída a ele, Em análise
 *   Gestor pode atribuir/reatribuir a um analista (Submetido → Em análise)
 *   Solicitante pode alterar os dados enquanto Submetido
 *   Analista responsável, gestor ou solicitante podem cancelar a qualquer momento, com justificativa
 *   Avaliação preliminar (um único TAP):
 *     sem pendências → "Atualizar solicitação" (anexa o TAP) → fase de análise
 *     com pendências → "Pedir complementação" com o TAP de pendências anexado → fase de análise
 *       liberada; o solicitante resolve as pendências; novas rodadas são só complementação
 *   Fase de análise → abas Cálculo do Tier, Matriz de Risco e Informações do Modelo → Enviar para o gestor
 *   Gestor → Finalizar validação (aval + inventariar? monitorar?) → Validada
 */

export const NAO_ATRIBUIDO = "Não atribuído";

/** Status em que o analista age sobre a solicitação. */
export const ANALISTA_PODE_AGIR: SolicitacaoStatus[] = ["Submetido", "Em análise"];

/** Submetido: qualquer analista pode assumir. Em análise: só o responsável. */
export function analistaPodeAgir(s: Solicitacao, analista: string) {
  if (s.status === "Submetido") return true;
  return s.status === "Em análise" && s.analistaResponsavel === analista;
}

/** Relatório de desenvolvimento em vigor (o anexo da submissão, ou o que o substituiu na edição). */
export const relatorioAtual = (s: Solicitacao) => s.relatorioDesenvolvimento ?? s.timeline[0]?.anexos?.[0];

/** Validada e Cancelada encerram a solicitação. */
export const finalizada = (s: Solicitacao) => s.status === "Validada" || s.status === "Cancelada";

/** Analista cancela qualquer solicitação em andamento que seja dele (ou ainda sem analista). */
export function analistaPodeCancelar(s: Solicitacao, analista: string) {
  if (finalizada(s)) return false;
  return s.status === "Submetido" || s.analistaResponsavel === analista;
}

/** Solicitante cancela em qualquer status em andamento. */
export const solicitantePodeCancelar = (s: Solicitacao) => !finalizada(s);

/** Gestor GEVAM cancela em qualquer status em andamento. */
export const gestorPodeCancelar = (s: Solicitacao) => !finalizada(s);

/** Solicitante altera os dados só enquanto nenhum analista assumiu. */
export const solicitantePodeAlterar = (s: Solicitacao) => s.status === "Submetido";

/** Gestor atribui ou reatribui qualquer solicitação em andamento. */
export const gestorPodeAtribuir = (s: Solicitacao) => !finalizada(s);

/**
 * Sem TAP emitido a solicitação ainda está na avaliação preliminar. O TAP é emitido uma
 * única vez: sem pendências (Atualizar solicitação) ou com pendências (junto do primeiro
 * pedido de complementação). Depois dele, as abas de análise ficam liberadas e qualquer
 * nova necessidade é tratada como complementação.
 */
export const emAvaliacaoPreliminar = (s: Solicitacao) => !s.tap;

/** Status internos da GEVAM aparecem como "Em análise" para o solicitante. */
export function statusParaPerfil(status: SolicitacaoStatus, profile: Profile): SolicitacaoStatus {
  if (profile === "solicitante" && status === "Aguardando gestor") return "Em análise";
  return status;
}

// ── Dados derivados para o painel "Informações da solicitação" ──────────────

const ultimoEvento = (s: Solicitacao, tipo: NonNullable<Solicitacao["timeline"][number]["tipo"]>) =>
  [...s.timeline].reverse().find((e) => e.tipo === tipo);

/** Quando o analista assumiu (registros antigos: data do evento de atribuição). */
export const dataAtribuicao = (s: Solicitacao) => s.dataAtribuicao ?? ultimoEvento(s, "atribuida")?.data;

/** Quando o analista enviou ao gestor. */
export function dataFinalizacaoAnalise(s: Solicitacao) {
  if (s.dataFinalizacaoAnalise) return s.dataFinalizacaoAnalise;
  if (s.status !== "Aguardando gestor" && s.status !== "Validada") return undefined;
  return ultimoEvento(s, "enviada-gestor")?.data;
}

/**
 * Dias corridos da atribuição até a finalização da análise. Enquanto a análise
 * não termina, conta até hoje (inclui o tempo em complementação).
 */
export function tempoAnaliseDias(s: Solicitacao, hoje = new Date()) {
  const inicio = dataAtribuicao(s);
  if (!inicio) return undefined;
  const fimIso = dataFinalizacaoAnalise(s);
  // Só a parte da data, lida como dia local ("2026-05-10" via new Date viraria UTC e mudaria o dia).
  const diaIso = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const fim = fimIso ? diaIso(fimIso) : Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.max(0, Math.round((fim - diaIso(inicio)) / 86_400_000));
}

export const gestorGevam = (s: Solicitacao) => s.gestorGevam ?? s.conclusao?.gestor;
