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
  | "informacoes-modelo";

export const TABS_BY_PROFILE: Record<Profile, NovoModeloTab[]> = {
  solicitante: ["submeter"],
  analista: ["inventariar"],
  gestor: ["inventariar"],
};

export type ConsultarModeloTab = "em-andamento" | "inventariado" | "cancelado";

export const CONSULTAR_TABS_BY_PROFILE: Record<Profile, ConsultarModeloTab[]> = {
  solicitante: ["em-andamento", "inventariado", "cancelado"],
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
  | "Validado"
  | "Cancelado";

/** Quem pode cancelar: o analista responsável, o gestor GEVAM ou o próprio solicitante, sempre com justificativa. */
export type CanceladoPor = "analista" | "gestor" | "solicitante";

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
    | "atribuida"
    | "tap-emitido"
    | "atualizacao"
    | "cancelada"
    | "documento-adicionado"
    | "situacao-alterada";
}

/** Aba "Informações Adicionais": dados usados no cálculo do Tier. */
export interface InformacoesAdicionais {
  materialidade: string;
  impactoDecisao: string;
  complexidade: string;
  novoAlgoritmo: string;
  novoProduto: string;
  implementacaoAutomatizada: string;
}

/** Aba "Informações do Modelo": seções em texto livre preenchidas pelo analista. */
export interface InformacoesModelo {
  /** Objetivo, justificativa, público, carteira e se substitui outro modelo. */
  contextualizacao: string;
  /** Técnicas utilizadas (regressão logística, SARIMAX…). */
  metodologia: string;
  /** Indicadores de performance por período e resultados dos testes. */
  resultados: string;
  /** Monitoramento que será realizado pela área solicitante. */
  monitoramento1Linha: string;
  /** Monitoramento que será realizado pela GEVAM e com quais indicadores. */
  monitoramento2Linha: string;
  /** Opcional. */
  observacoes?: string;
}

/** Uma linha do "Histórico Cálculo e Recálculo" do Tier. */
export interface CalculoTier {
  id: string;
  tipo: "Cálculo" | "Recálculo";
  /** Parâmetros usados (mesmos campos de Informações Adicionais). */
  parametros: InformacoesAdicionais;
  /** Pontuação dos parâmetros, antes do ajuste de MRM. */
  pontuacaoBase: number;
  /** Ajuste de MRM em pontos (pode ser negativo). */
  ajusteMrm?: number;
  /** Resultado final = base + ajuste. */
  resultado: number;
  /** Tier pela pontuação, ou o tier forçado pelo override. */
  tier: string;
  override?: string;
  /** Data e hora ISO. */
  data: string;
  usuario: string;
}

/** Uma linha do "Histórico Matriz de Risco". */
export interface MatrizRisco {
  id: string;
  tipo: "Cálculo" | "Recálculo";
  /** Prazo para revalidar o modelo, em meses (opcional). */
  prazoRevalidacaoMeses?: string;
  alcadaSugerida?: string;
  tier: string;
  /** Letra da Nota de Classificação (A a E). */
  nota: string;
  classificacaoRisco: string;
  /** Data e hora ISO. */
  data: string;
  usuario: string;
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
  /** Data e hora ISO em que o analista assumiu ou foi atribuído (a mais recente). */
  dataAtribuicao?: string;
  /** Data e hora ISO em que o analista enviou ao gestor. */
  dataFinalizacaoAnalise?: string;
  /** Gestor GEVAM que atribuiu ou finalizou a validação (o mais recente). */
  gestorGevam?: string;
  status: SolicitacaoStatus;
  tipoModelo?: string;
  objetivo?: string;
  timeline: TimelineEvent[];
  /** O que o analista pediu para o solicitante complementar. */
  complementacao?: string;
  /** Arquivo de apoio enviado pelo analista junto com o pedido (opcional). */
  anexoPedidoComplementacao?: string;
  /** Envio ao gestor: o analista pede o aval (sem anexo; o gestor lê os documentos já em Arquivos). */
  encaminhamento?: {
    tipo: "enviada-gestor";
    autor: string;
    data: string;
  };
  /** Aval do gestor: toda solicitação Validado entra no inventário (Ativo, não monitorado). */
  conclusao?: {
    data: string;
    gestor: string;
    numeroInventario?: string;
  };
  /** Preenchido quando o analista ou o próprio solicitante cancela a solicitação. */
  cancelamento?: { data: string; autor: string; justificativa: string; por: CanceladoPor };
  /** Preenchidas pelo analista; obrigatórias para enviar ao gestor. */
  informacoesAdicionais?: InformacoesAdicionais;
  informacoesModelo?: InformacoesModelo;
  /** Cálculo do Tier: o primeiro é feito ao salvar Informações Adicionais; depois, recálculos do analista. */
  calculosTier?: CalculoTier[];
  /** Matriz de Risco: o primeiro registro é o cálculo; depois, recálculos do analista. */
  matrizesRisco?: MatrizRisco[];
  /** Resposta enviada pelo solicitante à última complementação. */
  respostaComplementacao?: {
    data: string;
    arquivo: string;
    observacao?: string;
  };
}

/**
 * Monitoramento pela GEVAM (toggle na página do modelo). Todo modelo entra no inventário
 * como "Não monitorado". Não existe "Resultado da validação": tudo no inventário foi validado
 * (o que não foi validado foi cancelado).
 */
export type MonitoramentoInventario = "Em monitoramento" | "Não monitorado";
export type SituacaoModeloInventario = "Ativo" | "Inativo" | "Suspenso";
/**
 * Validação GEVAM do modelo no inventário. Nem todo modelo do inventário foi validado: modelos antigos,
 * inventariados sem passar pela avaliação da GEVAM, ficam como "Não validado" (e podem ser monitorados).
 */
export type ValidacaoInventario = "Validado" | "Não validado";

export interface ModeloInventariado {
  /** Nº do modelo no inventário: é o próprio nº da solicitação (não há numeração separada). */
  numero: string;
  /** Solicitação que deu origem ao modelo (histórico e arquivos ficam nela). */
  numeroSolicitacao?: string;
  nomeModelo: string;
  tipoModelo: string;
  areaGestora: string;
  assunto: string;
  publico: string;
  monitoramento: MonitoramentoInventario;
  situacao: SituacaoModeloInventario;
  validacao: ValidacaoInventario;
  analistaResponsavel: string;
  objetivo: string;
  dataInventario: string;
  informacoesAdicionais?: InformacoesAdicionais;
  informacoesModelo?: InformacoesModelo;
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
  /** Quem cancelou (ausente nos registros antigos). */
  canceladoPor?: CanceladoPor;
}
