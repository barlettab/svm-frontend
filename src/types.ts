export type Profile = "solicitante" | "analista" | "gestor";

export const PROFILE_LABELS: Record<Profile, string> = {
  solicitante: "Solicitante",
  analista: "Analista GEVAM",
  gestor: "Gestor GEVAM",
};

export type ModuleKey = "novo-modelo" | "consultar-modelo" | "gestao";

export type NovoModeloTab = "submeter" | "inventariar";

export const TABS_BY_PROFILE: Record<Profile, NovoModeloTab[]> = {
  solicitante: ["submeter"],
  analista: ["inventariar"],
  gestor: ["inventariar"],
};

export type ConsultarModeloTab = "em-andamento" | "inventariado" | "cancelado";

export const CONSULTAR_TAB_LABELS: Record<ConsultarModeloTab, string> = {
  "em-andamento": "Em andamento",
  inventariado: "Inventariado",
  cancelado: "Cancelado",
};

export const CONSULTAR_TABS_BY_PROFILE: Record<Profile, ConsultarModeloTab[]> = {
  solicitante: ["em-andamento", "cancelado"],
  analista: ["em-andamento", "inventariado", "cancelado"],
  gestor: ["em-andamento", "inventariado", "cancelado"],
};

export type ParametrizacaoTab =
  | "parametros-gerais"
  | "matriz-riscos"
  | "expr-score-tier"
  | "expr-score-monitoramento";

export const PARAMETRIZACAO_TAB_LABELS: Record<ParametrizacaoTab, string> = {
  "parametros-gerais": "Parâmetros gerais",
  "matriz-riscos": "Matriz de riscos",
  "expr-score-tier": "Expr. score tier",
  "expr-score-monitoramento": "Expr. score monitoramento",
};

export type SolicitacaoStatus = "Submetido" | "Em análise" | "Em complementação";

export interface TimelineEvent {
  data: string;
  descricao: string;
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
  timeline: TimelineEvent[];
  complementacao?: string;
}

export type ResultadoValidacao = "Validado" | "Não validado";
export type MonitoramentoInventario =
  | "Em monitoramento"
  | "Não monitorado"
  | "Não se aplica";
export type SituacaoModeloInventario = "Ativo" | "Inativo" | "Suspenso";

export interface ModeloInventariado {
  numero: string;
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
