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
  solicitante: [
    "submeter",
    "informacoes-adicionais",
    "implantacao",
    "metodologia-monitoramento",
  ],
  analista: [
    "inventariar",
    "informacoes-adicionais",
    "implantacao",
    "metodologia-monitoramento",
  ],
  gestor: [
    "inventariar",
    "informacoes-adicionais",
    "implantacao",
    "metodologia-monitoramento",
  ],
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
