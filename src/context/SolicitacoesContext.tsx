import { createContext, useContext, useState, type ReactNode } from "react";
import { mockSolicitacoes } from "../data/mockSolicitacoes";
import { mockInventario } from "../data/mockInventario";
import { mockSolicitacoesInventariadas } from "../data/mockSolicitacoesInventariadas";
import type { ModeloInventariado, SituacaoModeloInventario, Solicitacao } from "../types";

/**
 * Estado das solicitações em andamento e do inventário, compartilhado entre a
 * lista, a página de detalhe e a aba Inventariado. No protótipo vive em memória
 * (some ao recarregar); no sistema real cada ação abaixo é uma chamada ao servidor.
 *
 * Fluxo:
 *   Submetido / Em análise
 *     ── analista: pedir complementação ──▶ Em complementação ── solicitante envia anexo ──▶ Em análise
 *     ── analista: enviar para o gestor ──▶ Aguardando gestor
 *   Aguardando gestor
 *     ── gestor: recusar (com motivo) ──▶ Em análise (volta para o analista)
 *     ── gestor: validar (inventariar? monitorar?) ──▶ Validada (finalizada; sai de Em andamento)
 *
 * Inventário (modelo aberto em página própria, com o histórico da solicitação de origem):
 *   ── analista: adicionar documento ao histórico (ex.: recebido por Teams ou e-mail)
 *   ── gestor: alterar situação do modelo (Ativo / Inativo / Suspenso), registrada no histórico
 */
interface SolicitacoesContextValue {
  solicitacoes: Solicitacao[];
  inventario: ModeloInventariado[];
  pedirComplementacao: (numero: string, dados: { texto?: string; anexo: string; autor: string }) => void;
  enviarComplementacao: (numero: string, dados: { arquivo: string; observacao?: string; autor: string }) => void;
  enviarParaGestor: (numero: string, dados: { texto?: string; anexo: string; autor: string }) => void;
  devolverAoAnalista: (numero: string, dados: { texto?: string; anexo: string; autor: string }) => void;
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

const SolicitacoesContext = createContext<SolicitacoesContextValue | null>(null);

const hoje = () => new Date().toISOString().slice(0, 10);

export function SolicitacoesProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([
    ...mockSolicitacoes,
    ...mockSolicitacoesInventariadas,
  ]);
  const [inventario, setInventario] = useState<ModeloInventariado[]>(mockInventario);

  function atualizar(numero: string, fn: (s: Solicitacao) => Solicitacao) {
    setSolicitacoes((lista) => lista.map((s) => (s.numero === numero ? fn(s) : s)));
  }

  const value: SolicitacoesContextValue = {
    solicitacoes,
    inventario,

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
          { data: hoje(), descricao: "Solicitação retornou para análise." },
        ],
      })),

    enviarParaGestor: (numero, { texto, anexo, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        status: "Aguardando gestor",
        encaminhamento: { tipo: "enviada-gestor", texto, anexo, autor, data: hoje() },
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: "Análise concluída e enviada para o gestor.",
            detalhe: texto,
            autor,
            anexos: [anexo],
            tipo: "enviada-gestor",
          },
        ],
      })),

    devolverAoAnalista: (numero, { texto, anexo, autor }) =>
      atualizar(numero, (s) => ({
        ...s,
        status: "Em análise",
        encaminhamento: { tipo: "devolvida-analista", texto, anexo, autor, data: hoje() },
        timeline: [
          ...s.timeline,
          {
            data: hoje(),
            descricao: "Gestor recusou a validação. Solicitação voltou para análise.",
            detalhe: texto,
            autor,
            anexos: [anexo],
            tipo: "devolvida-analista",
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
        };
        setInventario((lista) => [novo, ...lista]);
      }

      const resumo = `Inventariado: ${inventariado ? "Sim" : "Não"} · Monitorado: ${monitorado ? "Sim" : "Não"}`;
      atualizar(numero, (x) => ({
        ...x,
        status: "Validada",
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
