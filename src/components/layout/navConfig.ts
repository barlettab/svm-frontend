import type { ModuleKey, Profile } from "../../types";

/**
 * Estrutura funcional do SVM — NÃO alterar.
 * Espelha a árvore definida no projeto:
 *   SVM > Novo modelo        (abas superiores: Submeter | Inventariar)
 *       > Consultar modelo   (abas superiores: Em andamento | Inventariado | Cancelado)
 *       > Gestão > Parametrização (4 itens — sub-abas laterais)
 *
 * "Novo modelo" e "Consultar modelo" são itens únicos na sidebar; suas
 * sub-telas aparecem como abas superiores dentro da própria página
 * (ver NovoModeloPage/ConsultarModeloPage), não como sub-itens laterais.
 */
export interface NavLeaf {
  key: string;
  label: string;
  module: ModuleKey;
  /** Aba a ativar dentro da página do módulo. */
  section?: string;
  profiles?: Profile[];
}

export interface NavGroup {
  key: string;
  label: string;
  module?: ModuleKey;
  profiles?: Profile[];
  children: (NavLeaf | NavGroup)[];
}

export const isGroup = (item: NavLeaf | NavGroup): item is NavGroup =>
  Object.prototype.hasOwnProperty.call(item, "children");

export const NAV_TREE: NavGroup = {
  key: "svm",
  label: "Módulo - SVM",
  children: [
    { key: "novo-modelo", label: "Novo modelo", module: "novo-modelo" },
    { key: "consultar-modelo", label: "Consultar modelo", module: "consultar-modelo" },
    {
      key: "gestao",
      label: "Gestão",
      module: "gestao",
      profiles: ["analista", "gestor"],
      children: [
        {
          key: "parametrizacao",
          label: "Parametrização",
          module: "gestao",
          profiles: ["analista", "gestor"],
          children: [
            { key: "parametros-gerais", label: "Parâmetros Gerais", module: "gestao", section: "parametros-gerais" },
            { key: "matriz-riscos", label: "Matriz de Riscos", module: "gestao", section: "matriz-riscos" },
            { key: "expr-score-tier", label: "Expr. Score Tier", module: "gestao", section: "expr-score-tier" },
            {
              key: "expr-score-monitoramento",
              label: "Expr. Score Monitoramento",
              module: "gestao",
              section: "expr-score-monitoramento",
            },
          ],
        },
      ],
    },
  ],
};

/** Filtra a árvore pelo perfil: item sem permissão não é exibido. */
export function navForProfile(profile: Profile, node: NavGroup = NAV_TREE): NavGroup {
  const allowed = (item: NavLeaf | NavGroup) => !item.profiles || item.profiles.includes(profile);
  const walk = (items: (NavLeaf | NavGroup)[]): (NavLeaf | NavGroup)[] =>
    items.filter(allowed).map((item) => (isGroup(item) ? { ...item, children: walk(item.children) } : item));
  return { ...node, children: walk(node.children) };
}
