import { createContext, useContext, useState, type ReactNode } from "react";
import { mockSolicitacoes } from "../data/mockSolicitacoes";
import { mockInventario } from "../data/mockInventario";
import { mockCancelados } from "../data/mockCancelados";
import { mockSolicitacoesInventariadas } from "../data/mockSolicitacoesInventariadas";
import { novoCalculo } from "../components/modelo/tier";
import { novaMatriz } from "../components/modelo/matrizRisco";
import { relatorioAtual } from "../pages/ConsultarModelo/fluxo";
import type {
  CanceladoPor,
  InformacoesAdicionais,
  InformacoesModelo,
  MatrizRisco,
  ModeloInventariado,
  SituacaoModeloInventario,
  Solicitacao,
  SolicitacaoCancelada,
} from "../types";

/**
 * Estado das solicitações em andamento e do inventário, compartilhado entre a
 * lista, a página de detalhe e a aba Inventariado. No protótipo vive em memória
 * (some ao recarregar); no sistema real cada ação abaixo é uma chamada ao servidor.
 *
 * Fluxo (detalhes em pages/ConsultarModelo/fluxo.ts):
 *   Submetido ── analista abre ──▶ Em análise (atribuída a ele)
 *   Submetido ── gestor atribui a um analista ──▶ Em análise (o gestor também pode reatribuir depois)
 *   Submetido ── solicitante: alterar os dados da solicitação ──▶ continua Submetido
 *   Qualquer status em andamento
 *     ── analista responsável, gestor ou solicitante: cancelar (justificativa) ──▶ Cancelada (aba Cancelado)
 *   Em análise, avaliação preliminar (sem TAP)
 *     ── analista: atualizar solicitação marcando "TAP sem pendências" (anexa TAP) ──▶ fase de análise
 *   Em análise (qualquer fase)
 *     ── analista: atualizar solicitação (descrição obrigatória, anexo opcional) ──▶ só registra no histórico
 *     ── analista: pedir complementação ──▶ Em complementação ── solicitante envia anexo ──▶ Em análise
 *   Em análise, fase de análise (com TAP)
 *     ── analista: enviar para o gestor ──▶ Aguardando gestor
 *        (só depois de preencher Cálculo do Tier, Matriz de Risco e Informações do Modelo)
 *   Aguardando gestor
 *     ── gestor: validar (inventariar? monitorar?) ──▶ Validada (finalizada; sai de Em andamento)
 *
 * Inventário (modelo aberto em página própria, com o histórico da solicitação de origem):
 *   ── analista: adicionar documento ao histórico (ex.: recebido por Teams ou e-mail)
 *   ── gestor: alterar situação do modelo (Ativo / Inativo / Suspenso), registrada no histórico
 */
interface SolicitacoesContextValue {
  solicitacoes: Solicitacao[];
  inventario: ModeloInventariado[];
  /** Aba Cancelado: histórico fixo + solicitações canceladas nesta sessão. */
  cancelados: SolicitacaoCancelada[];
  /** Analista abriu uma Submetido: fica atribuída a ele e passa para Em análise. */
  assumirAnalise: (numero: string, analista: string) => void;
  /**
   * Analista registra uma atualização (descrição obrigatória, anexo opcional).
   * Se for o TAP sem pendências, conclui a avaliação preliminar.
   */
  atualizarSolicitacao: (
    numero: string,
    dados: { descricao: string; anexo?: string; tapSemPendencias: boolean; autor: string },
  ) => void;
  /** Gestor atribui (ou reatribui) a solicitação a um analista. Se estava Submetido, passa para Em análise. */
  atribuirAnalista: (numero: string, dados: { analista: string; autor: string }) => void;
  /** Solicitante altera os dados enquanto a solicitação está Submetido (nenhum analista assumiu). */
  /**
   * Com novoRelatorio, o relatório de desenvolvimento é substituído: o arquivo anterior sai do
   * histórico e dos Arquivos (não fica salvo) e o novo entra no evento da edição.
   */
  alterarSolicitacao: (
    numero: string,
    dados: { campos: DadosSolicitacao; novoRelatorio?: string; autor: string },
  ) => void;
  /** Analista responsável, gestor ou solicitante cancela, em qualquer status em andamento, com justificativa. */
  cancelar: (numero: string, dados: { justificativa: string; autor: string; por: CanceladoPor }) => void;
  /** Na avaliação preliminar, o anexo do primeiro pedido é o TAP com pendências (tapComPendencias). */
  pedirComplementacao: (
    numero: string,
    dados: { texto?: string; anexo: string; autor: string; tapComPendencias?: boolean },
  ) => void;
  enviarComplementacao: (numero: string, dados: { arquivo: string; observacao?: string; autor: string }) => void;
  /** Primeiro cálculo do Tier: salva os parâmetros (Informações Adicionais) e registra "Cálculo". */
  calcularTier: (numero: string, dados: { parametros: InformacoesAdicionais; autor: string }) => void;
  recalcularTier: (
    numero: string,
    dados: { parametros: InformacoesAdicionais; ajusteMrm?: number; override?: string; autor: string },
  ) => void;
  salvarInformacoesModelo: (numero: string, dados: InformacoesModelo) => void;
  /** Registra a Matriz de Risco: "Cálculo" na primeira vez, "Recálculo" depois. */
  registrarMatrizRisco: (
    numero: string,
    dados: Pick<MatrizRisco, "prazoRevalidacaoMeses" | "alcadaSugerida" | "tier" | "nota"> & { autor: string },
  ) => void;
  /** Analista pede o aval do gestor. Não há anexo: o gestor lê os documentos já em Arquivos. */
  enviarParaGestor: (numero: string, dados: { autor: string }) => void;
  /** Retorna o número do inventário quando o modelo é inventariado. */
  validar: (numero: string, dados: { inventariado: boolean; monitorado: boolean; autor: string }) => string | undefined;
  /** Gestor altera a situação de um modelo inventariado (numero = nº do inventário). */
  alterarSituacao: (numero: string, situacao: SituacaoModeloInventario, autor: string) => void;
  /** Analista inclui no histórico um documento que chegou por fora do sistema. */
  adicionarDocumento: (
    numeroSolicitacao: string,
    dados: { anexo: string; origem: string; texto?: string; autor: string },
  ) => void;
}

/** Campos da solicitação que o solicitante preenche ao submeter e pode alterar enquanto Submetido. */
export type DadosSolicitacao = Pick<
  Solicitacao,
  "nomeModelo" | "tipoModelo" | "areaGestora" | "assunto" | "publico" | "objetivo"
>;

const SolicitacoesContext = createContext<SolicitacoesContextValue | null>(null);

const hoje = () => new Date().toISOString().slice(0, 10);
/** Data e hora local ISO, sem fuso (ex.: 2026-11-09T14:32). */
const agora = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function SolicitacoesProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([
    ...mockSolicitacoes,
    ...mockSolicitacoesInventariadas,
  ]);
  const [inventario, setInventario] = useState<ModeloInventariado[]>(mockInventario);

  function atualizar(numero: string, fn: (s: Solicitacao) => Solicitacao) {
    setSolicitacoes((lista) => lista.map((s) => (s.numero === numero ? fn(s) : s)));
  }

  const cancelados: SolicitacaoCancelada[] = [
    ...solicitacoes
      .filter((s) => s.status === "Cancelada" && s.cancelamento)
      .map((s) => ({
        numero: s.numero,
        nomeModelo: s.nomeModelo,
        areaGestora: s.areaGestora,
        assunto: s.assunto,
        solicitante: s.solicitante,
        analistaResponsavel: s.analistaResponsavel,
        dataCancelamento: s.cancelamento!.data,
        justificativa: s.cancelamento!.justificativa,
        canceladoPor: s.cancelamento!.por,
      }))
      .reverse(),
    ...mockCancelados,
  ];

  const value: SolicitacoesContextValue = {
    solicitacoes,
    inventario,
    cancelados,

    assumirAnalise: (numero, analista) =>
      atualizar(numero, (s) =>
        // idempotente: o StrictMode chama o efeito da página duas vezes
        s.status !== "Submetido"
          ? s
          : {
              ...s,
              status: "Em análise",
              analistaResponsavel: analista,
              dataAtribuicao: agora(),
              timeline: [
                ...s.timeline,
                {
                  data: hoje(),
                  descricao: `Solicitação atribuída a ${analista}. Avaliação preliminar da documentação iniciada.`,
                  autor: analista,
                  tipo: "atribuida",
                },
              ],
            },
      ),

    atualizarSolicitacao: (numero, { descricao, anexo, tapSemPendencias, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        tap: tapSemPendencias && anexo ? { anexo, data: hoje(), autor, observacao: descricao } : s.tap,
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao:
              tapSemPendencias && anexo
                ? "Solicitação atualizada: TAP emitido sem pendências. Solicitação seguiu para análise."
                : "Solicitação atualizada pelo analista.",
            detalhe: descricao,
            autor,
            anexos: anexo ? [anexo] : undefined,
            tipo: tapSemPendencias && anexo ? "tap-emitido" : "atualizacao",
          },
        ],
      })),

    atribuirAnalista: (numero, { analista, autor }) =>
      atualizar(numero, (s) =>
        s.status === "Validada" || s.status === "Cancelada" || s.analistaResponsavel === analista
          ? s
          : {
              ...s,
              status: s.status === "Submetido" ? "Em análise" : s.status,
              analistaResponsavel: analista,
              dataAtribuicao: agora(),
              gestorGevam: autor,
              timeline: [
                ...s.timeline,
                {
                  data: hoje(),
                  descricao:
                    s.status === "Submetido"
                      ? `Solicitação atribuída a ${analista} pelo gestor. Avaliação preliminar da documentação iniciada.`
                      : `Solicitação reatribuída de ${s.analistaResponsavel} para ${analista} pelo gestor.`,
                  autor,
                  tipo: "atribuida",
                },
              ],
            },
      ),

    alterarSolicitacao: (numero, { campos, novoRelatorio, autor }) =>
      atualizar(numero, (s) => {
        if (s.status !== "Submetido") return s;
        const anterior = relatorioAtual(s);
        // O relatório substituído é descartado: some de todos os eventos (e, portanto, de Arquivos).
        const timeline =
          novoRelatorio && anterior
            ? s.timeline.map((e) =>
                e.anexos?.includes(anterior) ? { ...e, anexos: e.anexos.filter((a) => a !== anterior) } : e,
              )
            : s.timeline;
        return {
          ...s,
          ...campos,
          relatorioDesenvolvimento: novoRelatorio ?? s.relatorioDesenvolvimento,
          timeline: [
            ...timeline,
            {
              data: hoje(),
              descricao: novoRelatorio
                ? "Dados da solicitação editados pelo solicitante. Relatório de desenvolvimento substituído (o arquivo anterior foi descartado)."
                : "Dados da solicitação editados pelo solicitante.",
              autor,
              anexos: novoRelatorio ? [novoRelatorio] : undefined,
              tipo: "atualizacao",
            },
          ],
        };
      }),

    cancelar: (numero, { justificativa, autor, por }) =>
      atualizar(numero, (s) =>
        s.status === "Validada" || s.status === "Cancelada"
          ? s
          : {
              ...s,
              status: "Cancelada",
              cancelamento: { data: hoje(), autor, justificativa, por },
              timeline: [
                ...s.timeline,
                {
                  data: hoje(),
                  descricao: `Solicitação cancelada pelo ${por === "gestor" ? "gestor GEVAM" : por}.`,
                  detalhe: justificativa,
                  autor,
                  tipo: "cancelada",
                },
              ],
            },
      ),

    pedirComplementacao: (numero, { texto, anexo, autor, tapComPendencias }) =>
      atualizar(numero, (s) => ({
        ...s,
        status: "Em complementação",
        tap: tapComPendencias && !s.tap ? { anexo, data: hoje(), autor, observacao: texto, comPendencias: true } : s.tap,
        complementacao: texto,
        anexoPedidoComplementacao: anexo,
        respostaComplementacao: undefined,
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao:
              tapComPendencias && !s.tap
                ? "TAP emitido com pendências. Complementação solicitada ao solicitante."
                : "Complementação solicitada ao solicitante.",
            detalhe: texto,
            autor,
            anexos: [anexo],
            tipo: "complementacao-pedida",
          },
        ],
      })),

    enviarComplementacao: (numero, { arquivo, observacao, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        status: "Em análise",
        respostaComplementacao: { data: hoje(), arquivo, observacao },
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: "Complementação enviada pelo solicitante.",
            detalhe: observacao,
            autor,
            anexos: [arquivo],
            tipo: "complementacao-enviada",
          },
          { data: hoje(), descricao: "Solicitação retornou para análise." },
        ],
      })),

    calcularTier: (numero, { parametros, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        informacoesAdicionais: parametros,
        calculosTier: [...(s.calculosTier ?? []), novoCalculo({ tipo: "Cálculo", parametros, usuario: autor })],
      })),

    recalcularTier: (numero, { parametros, ajusteMrm, override, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        informacoesAdicionais: parametros,
        calculosTier: [
          ...(s.calculosTier ?? []),
          novoCalculo({ tipo: "Recálculo", parametros, ajusteMrm, override, usuario: autor }),
        ],
      })),

    registrarMatrizRisco: (numero, { autor, ...dados }) =>
      atualizar(numero, (s) => ({
        ...s,
        matrizesRisco: [...(s.matrizesRisco ?? []), novaMatriz(s.matrizesRisco, dados, autor)],
      })),

    salvarInformacoesModelo: (numero, dados) => atualizar(numero, (s) => ({ ...s, informacoesModelo: dados })),

    enviarParaGestor: (numero, { autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        status: "Aguardando gestor",
        dataFinalizacaoAnalise: agora(),
        encaminhamento: { tipo: "enviada-gestor", autor, data: hoje() },
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: "Análise concluída e enviada para o gestor. Aval solicitado.",
            autor,
            tipo: "enviada-gestor",
          },
        ],
      })),

    validar: (numero, { inventariado, monitorado, autor }) => {
      const s = solicitacoes.find((x) => x.numero === numero);
      if (!s) return undefined;
      const data = hoje();
      let numeroInventario: string | undefined;

      if (inventariado) {
        numeroInventario = `INV-${data.slice(0, 4)}-${String(inventario.length + 1).padStart(3, "0")}`;
        const novo: ModeloInventariado = {
          numero: numeroInventario,
          numeroSolicitacao: s.numero,
          nomeModelo: s.nomeModelo,
          tipoModelo: s.tipoModelo ?? "Não informado",
          areaGestora: s.areaGestora,
          assunto: s.assunto,
          publico: s.publico,
          resultadoValidacao: "Validado",
          monitoramento: monitorado ? "Em monitoramento" : "Não monitorado",
          situacao: "Ativo",
          analistaResponsavel: s.analistaResponsavel,
          objetivo: s.objetivo ?? "Não informado",
          dataInventario: data,
          informacoesAdicionais: s.informacoesAdicionais,
          informacoesModelo: s.informacoesModelo,
        };
        setInventario((lista) => [novo, ...lista]);
      }

      const resumo = `Inventariado: ${inventariado ? "Sim" : "Não"} · Monitorado: ${monitorado ? "Sim" : "Não"}`;
      atualizar(numero, (x) => ({
        ...x,
        status: "Validada",
        gestorGevam: autor,
        conclusao: { data, gestor: autor, inventariado, monitorado, numeroInventario },
        timeline: [
          ...x.timeline,
          {
            data,
            descricao: numeroInventario
              ? `Solicitação validada e finalizada. Modelo incluído no inventário (${numeroInventario}).`
              : "Solicitação validada e finalizada. Modelo não inventariado.",
            detalhe: resumo,
            autor,
            tipo: "validada",
          },
        ],
      }));
      return numeroInventario;
    },

    alterarSituacao: (numero, situacao, autor) => {
      const modelo = inventario.find((m) => m.numero === numero);
      if (!modelo || modelo.situacao === situacao) return;
      setInventario((lista) => lista.map((m) => (m.numero === numero ? { ...m, situacao } : m)));
      if (modelo.numeroSolicitacao) {
        atualizar(modelo.numeroSolicitacao, (s) => ({
          ...s,
          timeline: [
            ...s.timeline,
            {
              data: hoje(),
              descricao: `Situação do modelo alterada de ${modelo.situacao} para ${situacao}.`,
              autor,
              tipo: "situacao-alterada",
            },
          ],
        }));
      }
    },

    adicionarDocumento: (numeroSolicitacao, { anexo, origem, texto, autor }) =>
      atualizar(numeroSolicitacao, (s) => ({
        ...s,
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: `Documento adicionado ao histórico pelo analista (recebido por ${origem}).`,
            detalhe: texto,
            autor,
            anexos: [anexo],
            tipo: "documento-adicionado",
          },
        ],
      })),
  };

  return <SolicitacoesContext.Provider value={value}>{children}</SolicitacoesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSolicitacoes() {
  const ctx = useContext(SolicitacoesContext);
  if (!ctx) throw new Error("useSolicitacoes precisa estar dentro de <SolicitacoesProvider>");
  return ctx;
}
