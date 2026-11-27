import { createContext, useContext, useState, type ReactNode } from "react";
import { mockSolicitacoes } from "../data/mockSolicitacoes";
import { mockInventario } from "../data/mockInventario";
import { mockCancelados } from "../data/mockCancelados";
import { mockSolicitacoesInventariadas } from "../data/mockSolicitacoesInventariadas";
import { novoCalculo } from "../components/modelo/tier";
import { novaMatriz } from "../components/modelo/matrizRisco";
import { EDITADA_PELO_SOLICITANTE } from "../pages/ConsultarModelo/fluxo";
import type {
  CanceladoPor,
  InformacoesAdicionais,
  InformacoesModelo,
  MatrizRisco,
  ModeloInventariado,
  SituacaoModeloInventario, ValidacaoInventario,
  Solicitacao,
  SolicitacaoCancelada,
} from "../types";

/**
 * Estado das solicitações em andamento e do inventário, compartilhado entre a
 * lista, a página de detalhe e a aba Inventariado. No protótipo vive em memória
 * (some ao recarregar); no sistema real cada ação abaixo é uma chamada ao servidor.
 *
 * Fluxo (detalhes em pages/ConsultarModelo/fluxo.ts):
 *   Submetido ── analista clica em Ações > Assumir solicitação ──▶ Em análise (atribuída a ele)
 *   Submetido ── gestor atribui a um analista ou assume ele mesmo ──▶ Em análise (o gestor também pode reatribuir depois)
 *   Submetido ── solicitante: alterar os dados da solicitação ──▶ continua Submetido
 *   Qualquer status em andamento
 *     ── analista responsável, gestor ou solicitante: cancelar (justificativa) ──▶ Cancelado (aba Cancelado)
 *   Com analista responsável: abas de análise liberadas (Em análise e Em complementação)
 *   Qualquer status
 *     ── analista responsável: acrescentar documentação (TAP ou outro documento) ──▶ status não muda
 *   Em análise
 *     ── analista: pedir complementação ──▶ Em complementação ── solicitante envia anexo ──▶ Em análise
 *     ── analista: enviar para o gestor (pedido de aval, sem anexo) ──▶ Aguardando gestor
 *        (só depois de preencher Cálculo do Tier, Matriz de Risco e Informações do Modelo)
 *   Aguardando gestor
 *     ── gestor: finalizar validação ──▶ Validado (sai de Em andamento e entra no inventário:
 *        situação Ativo, não monitorado)
 *
 * Inventário (modelo aberto em página própria, com o histórico da solicitação de origem):
 *   ── analista: adicionar documento ao histórico (ex.: recebido por Teams ou e-mail)
 *   ── analista e gestor: editar situação (Ativo / Inativo / Suspenso), monitoramento pela GEVAM
 *      e textos de Informações do Modelo; cada mudança fica no histórico
 */
interface SolicitacoesContextValue {
  solicitacoes: Solicitacao[];
  inventario: ModeloInventariado[];
  /** Aba Cancelado: todas as solicitações com status Cancelada, da mais recente para a mais antiga. */
  cancelados: SolicitacaoCancelada[];
  /** Analista clicou em Ações > Assumir solicitação numa Submetido: fica atribuída a ele e passa para Em análise. */
  assumirAnalise: (numero: string, analista: string) => void;
  /**
   * Analista acrescenta um documento (ex.: TAP sem pendências, documento recebido por e-mail).
   * O status da solicitação não muda, inclusive se já estiver finalizada.
   */
  acrescentarDocumentacao: (numero: string, dados: { anexo: string; descricao?: string; autor: string }) => void;
  /** Gestor atribui (ou reatribui) a solicitação a um analista. Se estava Submetido, passa para Em análise. */
  atribuirAnalista: (numero: string, dados: { analista: string; autor: string }) => void;
  /** Solicitante altera os dados enquanto a solicitação está Submetido (nenhum analista assumiu). */
  /**
   * Anexos: os removidos saem do histórico e dos Arquivos (não ficam salvos); os novos entram no
   * evento da edição.
   */
  /**
   * Editar solicitação. Solicitante: só em Submetido (pode remover e incluir anexos).
   * Analista responsável ou gestor (`perfil`): em qualquer status em andamento, sem mexer nos anexos.
   */
  alterarSolicitacao: (
    numero: string,
    dados: {
      campos: DadosSolicitacao;
      /** Solicitante: anexos já enviados que ele removeu. */
      anexosRemovidos?: string[];
      /** Solicitante: anexos novos. */
      novosAnexos?: string[];
      /** GEVAM: novo solicitante (a troca entra no mesmo registro do histórico). */
      solicitante?: string;
      autor: string;
      perfil?: "analista" | "gestor";
    },
  ) => void;
  /** Analista responsável, gestor ou solicitante cancela, em qualquer status em andamento, com justificativa. */
  cancelar: (numero: string, dados: { justificativa: string; autor: string; por: CanceladoPor }) => void;
  /** O anexo pode ser, por exemplo, o TAP com as pendências do relatório de desenvolvimento. */
  pedirComplementacao: (numero: string, dados: { texto?: string; anexo: string; autor: string }) => void;
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
  /** Gestor finaliza: status Validado e o modelo entra no inventário (Ativo, não monitorado). Retorna o nº do inventário. */
  validar: (numero: string, dados: { autor: string }) => string | undefined;
  /**
   * Analista ou gestor edita um modelo inventariado (numero = nº do inventário): situação,
   * monitoramento pela GEVAM e textos de Informações do Modelo. Só o que mudou vai para o histórico.
   */
  editarModelo: (
    numero: string,
    dados: {
      situacao: SituacaoModeloInventario;
      monitorado: boolean;
      validacao: ValidacaoInventario;
      informacoesModelo?: InformacoesModelo;
      autor: string;
    },
  ) => void;
  /** Analista inclui no histórico um documento que chegou por fora do sistema. */
  adicionarDocumento: (
    numeroSolicitacao: string,
    dados: { anexo: string; origem: string; texto?: string; autor: string; perfil?: "analista" | "gestor" },
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
    ...mockCancelados,
  ]);
  const [inventario, setInventario] = useState<ModeloInventariado[]>(mockInventario);

  function atualizar(numero: string, fn: (s: Solicitacao) => Solicitacao) {
    setSolicitacoes((lista) => lista.map((s) => (s.numero === numero ? fn(s) : s)));
  }

  const cancelados: SolicitacaoCancelada[] = [
    ...solicitacoes
      .filter((s) => s.status === "Cancelado" && s.cancelamento)
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
      .sort((a, b) => b.dataCancelamento.localeCompare(a.dataCancelamento)),
  ];

  const value: SolicitacoesContextValue = {
    solicitacoes,
    inventario,
    cancelados,

    assumirAnalise: (numero, analista) =>
      atualizar(numero, (s) =>
        // idempotente: só assume se ainda estiver Submetido
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
                  descricao: `Solicitação atribuída a ${analista}.`,
                  autor: analista,
                  tipo: "atribuida",
                },
              ],
            },
      ),

    acrescentarDocumentacao: (numero, { anexo, descricao, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: "Documentação acrescentada pelo analista.",
            detalhe: descricao,
            autor,
            anexos: [anexo],
            tipo: "documento-adicionado",
          },
        ],
      })),

    atribuirAnalista: (numero, { analista, autor }) =>
      atualizar(numero, (s) =>
        s.status === "Validado" || s.status === "Cancelado" || s.analistaResponsavel === analista
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
                      ? `Solicitação atribuída a ${analista} pelo gestor.`
                      : `Solicitação reatribuída de ${s.analistaResponsavel} para ${analista} pelo gestor.`,
                  autor,
                  tipo: "atribuida",
                },
              ],
            },
      ),

    // Regra: cada ação gera um único registro no histórico, sem detalhar o que foi alterado.
    alterarSolicitacao: (numero, { campos, anexosRemovidos = [], novosAnexos = [], solicitante, autor, perfil }) =>
      atualizar(numero, (s) => {
        if (perfil) {
          if (s.status === "Validado" || s.status === "Cancelado") return s;
          const mudouDados = (Object.keys(campos) as (keyof typeof campos)[]).some((k) => (s[k] ?? "") !== (campos[k] ?? ""));
          const novoSolicitante = solicitante && solicitante !== s.solicitante ? solicitante : undefined;
          if (!mudouDados && !novoSolicitante) return s;
          return {
            ...s,
            ...campos,
            solicitante: novoSolicitante ?? s.solicitante,
            timeline: [
              ...s.timeline,
              {
                data: hoje(),
                descricao: `Solicitação editada pelo ${perfil === "gestor" ? "gestor GEVAM" : "analista"}.`,
                detalhe: novoSolicitante ? `Solicitante: ${s.solicitante} → ${novoSolicitante}.` : undefined,
                autor,
                tipo: "atualizacao",
              },
            ],
          };
        }
        if (s.status !== "Submetido") return s;
        // Anexo removido é descartado: some de todos os eventos (e, portanto, de Arquivos).
        const timeline = anexosRemovidos.length
          ? s.timeline.map((e) =>
              e.anexos?.some((a) => anexosRemovidos.includes(a))
                ? { ...e, anexos: e.anexos.filter((a) => !anexosRemovidos.includes(a)) }
                : e,
            )
          : s.timeline;
        return {
          ...s,
          ...campos,
          timeline: [
            ...timeline,
            {
              data: hoje(),
              descricao: EDITADA_PELO_SOLICITANTE,
              autor,
              anexos: novosAnexos.length ? novosAnexos : undefined,
              tipo: "atualizacao",
            },
          ],
        };
      }),

    cancelar: (numero, { justificativa, autor, por }) =>
      atualizar(numero, (s) =>
        s.status === "Validado" || s.status === "Cancelado"
          ? s
          : {
              ...s,
              status: "Cancelado",
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

    pedirComplementacao: (numero, { texto, anexo, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        status: "Em complementação",
        complementacao: texto,
        anexoPedidoComplementacao: anexo,
        respostaComplementacao: undefined,
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: "Complementação solicitada ao solicitante.",
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

    validar: (numero, { autor }) => {
      const s = solicitacoes.find((x) => x.numero === numero);
      if (!s) return undefined;
      const data = hoje();
      // O nº do inventário é o próprio nº da solicitação.
      const numeroInventario = s.numero;
      const novo: ModeloInventariado = {
        numero: numeroInventario,
        numeroSolicitacao: s.numero,
        nomeModelo: s.nomeModelo,
        tipoModelo: s.tipoModelo ?? "Não informado",
        areaGestora: s.areaGestora,
        assunto: s.assunto,
        publico: s.publico,
        monitoramento: "Não monitorado",
        validacao: "Validado",
        situacao: "Ativo",
        analistaResponsavel: s.analistaResponsavel,
        objetivo: s.objetivo ?? "Não informado",
        dataInventario: data,
        informacoesAdicionais: s.informacoesAdicionais,
        informacoesModelo: s.informacoesModelo,
      };
      setInventario((lista) => [novo, ...lista]);

      atualizar(numero, (x) => ({
        ...x,
        status: "Validado",
        gestorGevam: autor,
        conclusao: { data, gestor: autor, numeroInventario },
        timeline: [
          ...x.timeline,
          {
            data,
            descricao: "Solicitação validada pelo gestor. Modelo incluído no inventário.",
            detalhe: "Situação: Ativo · Monitoramento 2ª Linha (GEVAM): Não",
            autor,
            tipo: "validada",
          },
        ],
      }));
      return numeroInventario;
    },

    editarModelo: (numero, { situacao, monitorado, validacao, informacoesModelo, autor }) => {
      const modelo = inventario.find((m) => m.numero === numero);
      if (!modelo) return;
      const monitoramento: ModeloInventariado["monitoramento"] = monitorado ? "Em monitoramento" : "Não monitorado";
      const textosMudaram =
        informacoesModelo !== undefined &&
        JSON.stringify(informacoesModelo) !== JSON.stringify(modelo.informacoesModelo ?? {});
      const mudancas: string[] = [];
      if (situacao !== modelo.situacao) mudancas.push(`Situação: ${modelo.situacao} → ${situacao}`);
      if (validacao !== modelo.validacao) mudancas.push(`Validação GEVAM: ${modelo.validacao} → ${validacao}`);
      if (monitoramento !== modelo.monitoramento)
        mudancas.push(`Monitoramento 2ª Linha (GEVAM): ${monitorado ? "Não → Sim" : "Sim → Não"}`);
      if (textosMudaram) mudancas.push("Informações do Modelo atualizadas");
      if (!mudancas.length) return;
      const evento: Solicitacao["timeline"][number] = {
        data: hoje(),
        descricao: "Modelo editado no inventário.",
        detalhe: mudancas.join(" · "),
        autor,
        tipo: "situacao-alterada",
      };

      setInventario((lista) =>
        lista.map((m) =>
          m.numero === numero
            ? { ...m, situacao, monitoramento, validacao, informacoesModelo: textosMudaram ? informacoesModelo : m.informacoesModelo }
            : m,
        ),
      );
      if (modelo.numeroSolicitacao) {
        atualizar(modelo.numeroSolicitacao, (s) => ({ ...s, timeline: [...s.timeline, evento] }));
      }
    },

    adicionarDocumento: (numeroSolicitacao, { anexo, origem, texto, autor, perfil = "analista" }) =>
      atualizar(numeroSolicitacao, (s) => ({
        ...s,
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: `Documentação acrescentada pelo ${perfil === "gestor" ? "gestor GEVAM" : "analista"} (recebida por ${origem}).`,
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
