import type { Profile, Solicitacao, SolicitacaoStatus } from "../../types";

/**
 * Regras do fluxo da Validação Independente (processo 15.11.02):
 *
 *   Solicitante envia → Submetido
 *   Analista abre uma Submetido → atribuída a ele, Em análise
 *   Gestor pode atribuir/reatribuir a um analista (Submetido → Em análise)
 *   Solicitante pode alterar os dados enquanto Submetido
 *   Analista responsável, gestor ou solicitante podem cancelar a qualquer momento, com justificativa
 *   Com analista responsável, as abas Cálculo do Tier, Matriz de Risco e Informações do Modelo
 *     já podem ser preenchidas (Em análise e Em complementação)
 *   Acrescentar documentação (TAP ou qualquer outro documento): analista responsável, em qualquer
 *     status; nunca muda o status
 *   Pedir complementação (inclusive com o TAP com pendências) → Em complementação → solicitante responde → Em análise
 *   Enviar para o gestor: só Em análise e com as três abas preenchidas (pedido de aval, sem anexo)
 *   Gestor → Finalizar validação (aval) → Validado; o modelo entra no inventário (Ativo, não monitorado)
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

/** Validado e Cancelado encerram a solicitação. */
export const finalizada = (s: Solicitacao) => s.status === "Validado" || s.status === "Cancelado";

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

/**
 * Analista responsável e gestor editam os dados da solicitação e trocam o solicitante
 * em qualquer status em andamento (o status não muda).
 */
export function gevamPodeEditar(s: Solicitacao, profile: Profile, usuario: string) {
  if (finalizada(s)) return false;
  if (profile === "gestor") return true;
  return profile === "analista" && s.analistaResponsavel === usuario;
}

/** Gestor atribui ou reatribui qualquer solicitação em andamento. */
export const gestorPodeAtribuir = (s: Solicitacao) => !finalizada(s);

/**
 * Analista responsável pode preencher Cálculo do Tier, Matriz de Risco e Informações do Modelo
 * desde a atribuição, enquanto a solicitação está Em análise ou Em complementação.
 */
export function analistaPodeEditarAbas(s: Solicitacao, analista: string) {
  return s.analistaResponsavel === analista && (s.status === "Em análise" || s.status === "Em complementação");
}

/** Acrescentar documentação: analista responsável, em qualquer status (o status não muda). */
export const analistaPodeAcrescentarDoc = (s: Solicitacao, analista: string) => s.analistaResponsavel === analista;


// ── Dados derivados para o painel "Informações da solicitação" ──────────────

const ultimoEvento = (s: Solicitacao, tipo: NonNullable<Solicitacao["timeline"][number]["tipo"]>) =>
  [...s.timeline].reverse().find((e) => e.tipo === tipo);

/** Quando o analista assumiu (registros antigos: data do evento de atribuição). */
export const dataAtribuicao = (s: Solicitacao) => s.dataAtribuicao ?? ultimoEvento(s, "atribuida")?.data;

/** Quando o analista enviou ao gestor. */
export function dataFinalizacaoAnalise(s: Solicitacao) {
  if (s.dataFinalizacaoAnalise) return s.dataFinalizacaoAnalise;
  if (s.status !== "Aguardando gestor" && s.status !== "Validado") return undefined;
  return ultimoEvento(s, "enviada-gestor")?.data;
}

/** Dia (meia-noite UTC) de uma data ISO, lida como dia local ("2026-05-10" via new Date viraria UTC e mudaria o dia). */
const diaIso = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const DIA = 86_400_000;

/**
 * Dias corridos em que a solicitação ficou Em complementação (aguardando o solicitante),
 * somando todas as rodadas. Uma rodada ainda aberta conta até `fim`.
 */
export function diasEmComplementacao(s: Solicitacao, fim: number) {
  let total = 0;
  let inicio: number | undefined;
  for (const e of s.timeline) {
    if (e.tipo === "complementacao-pedida" && inicio === undefined) inicio = diaIso(e.data);
    if (e.tipo === "complementacao-enviada" && inicio !== undefined) {
      total += diaIso(e.data) - inicio;
      inicio = undefined;
    }
  }
  if (inicio !== undefined && s.status === "Em complementação") total += fim - inicio;
  return Math.max(0, Math.round(total / DIA));
}

/**
 * Tempo de análise: dias corridos da atribuição até a finalização da análise (envio ao gestor),
 * **descontando o tempo Em complementação** — o relógio pausa quando o analista pede um complemento
 * e volta a contar quando o solicitante o envia. Enquanto a análise não termina, conta até hoje.
 */
export function tempoAnaliseDias(s: Solicitacao, hoje = new Date()) {
  const inicio = dataAtribuicao(s);
  if (!inicio) return undefined;
  const fimIso = dataFinalizacaoAnalise(s);
  const fim = fimIso ? diaIso(fimIso) : Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const corridos = Math.round((fim - diaIso(inicio)) / DIA);
  return Math.max(0, corridos - diasEmComplementacao(s, fim));
}

export const gestorGevam = (s: Solicitacao) => s.gestorGevam ?? s.conclusao?.gestor;
