export type Profile = "solicitante" | "analista" | "gestor";

export const PROFILE_LABELS: Record<Profile, string> = {
  solicitante: "Solicitante",
  analista: "Analista GEVAM",
  gestor: "Gestor GEVAM",
};

export type ModuleKey = "novo-modelo" | "consultar-modelo" | "gestao";

export const MODULES_BY_PROFILE: Record<Profile, ModuleKey[]> = {
  solicitante: ["novo-modelo", "consultar-modelo"],
  analista: ["novo-modelo", "consultar-modelo", "gestao"],
  gestor: ["novo-modelo", "consultar-modelo", "gestao"],
};

export type NovoModeloTab =
  | "submeter"
  | "inventariar"
  | "informacoes-adicionais"
  | "implantacao"
  | "metodologia-monitoramento";

export const TABS_BY_PROFILE: Record<Profile, NovoModeloTab[]> = {
  solicitante: ["submeter"],
  analista: ["inventariar"],
  gestor: ["inventariar"],
};

export type ConsultarModeloTab = "em-andamento" | "inventariado" | "cancelado";

export const CONSULTAR_TABS_BY_PROFILE: Record<Profile, ConsultarModeloTab[]> = {
  solicitante: ["em-andamento"],
  analista: ["em-andamento", "inventariado", "cancelado"],
  gestor: ["em-andamento", "inventariado", "cancelado"],
};

export type ParametrizacaoTab =
  | "parametros-gerais"
  | "matriz-riscos"
  | "expr-score-tier"
  | "expr-score-monitoramento";

export const PARAMETRIZACAO_TABS: ParametrizacaoTab[] = [
  "parametros-gerais",
  "matriz-riscos",
  "expr-score-tier",
  "expr-score-monitoramento",
];

export const PARAMETRIZACAO_TAB_LABELS: Record<ParametrizacaoTab, string> = {
  "parametros-gerais": "Parâmetros Gerais",
  "matriz-riscos": "Matriz de Riscos",
  "expr-score-tier": "Expr. Score Tier",
  "expr-score-monitoramento": "Expr. Score Monitoramento",
};

/** All sub-tab keys for a module, filtered by what the profile may access. */
export function getModuleTabs(module: ModuleKey, profile: Profile): string[] {
  if (module === "novo-modelo") return TABS_BY_PROFILE[profile];
  if (module === "consultar-modelo") return CONSULTAR_TABS_BY_PROFILE[profile];
  return PARAMETRIZACAO_TABS;
}

export type SolicitacaoStatus =
  | "Submetido"
  | "Em análise"
  | "Em complementação"
  | "Aguardando gestor"
  | "Validada";

export interface TimelineEvent {
  data: string;
  descricao: string;
  /** Quem fez a ação (solicitante, analista ou gestor). */
  autor?: string;
  /** Texto complementar, ex.: o pedido do analista ou a observação do solicitante. */
  detalhe?: string;
  /** Nomes dos arquivos anexados nesse evento. */
  anexos?: string[];
  tipo?:
    | "complementacao-pedida"
    | "complementacao-enviada"
    | "enviada-gestor"
    | "devolvida-analista"
    | "validada"
    | "documento-adicionado"
    | "situacao-alterada";
}

export interface Solicitacao {
  numero: string;
  nomeModelo: string;
  areaGestora: string;
  assunto: string;
  publico: string;
  solicitante: string;
  dataSubmissao: string;
  analistaResponsavel: string;
  status: SolicitacaoStatus;
  tipoModelo?: string;
  objetivo?: string;
  timeline: TimelineEvent[];
  /** O que o analista pediu para o solicitante complementar. */
  complementacao?: string;
  /** Arquivo de apoio enviado pelo analista junto com o pedido (opcional). */
  anexoPedidoComplementacao?: string;
  /** Último encaminhamento interno da GEVAM (parecer do analista ou pedido de ajuste do gestor). */
  encaminhamento?: {
    tipo: "enviada-gestor" | "devolvida-analista";
    texto?: string;
    autor: string;
    data: string;
    anexo: string;
  };
  /** Decisão final do gestor ao validar. */
  conclusao?: {
    data: string;
    gestor: string;
    inventariado: boolean;
    monitorado: boolean;
    numeroInventario?: string;
  };
  /** Resposta enviada pelo solicitante à última complementação. */
  respostaComplementacao?: {
    data: string;
    arquivo: string;
    observacao?: string;
  };
}

export type ResultadoValidacao = "Validado" | "Não validado";
export type MonitoramentoInventario =
  | "Em monitoramento"
  | "Não monitorado"
  | "Não se aplica";
export type SituacaoModeloInventario = "Ativo" | "Inativo" | "Suspenso";

export interface ModeloInventariado {
  numero: string;
  /** Solicitação que deu origem ao modelo (histórico e arquivos ficam nela). */
  numeroSolicitacao?: string;
  nomeModelo: string;
  tipoModelo: string;
  areaGestora: string;
  assunto: string;
  publico: string;
  resultadoValidacao: ResultadoValidacao;
  monitoramento: MonitoramentoInventario;
  situacao: SituacaoModeloInventario;
  analistaResponsavel: string;
  objetivo: string;
  dataInventario: string;
}

export interface SolicitacaoCancelada {
  numero: string;
  nomeModelo: string;
  areaGestora: string;
  assunto?: string;
  solicitante?: string;
  analistaResponsavel?: string;
  dataCancelamento: string;
  justificativa: string;
}
