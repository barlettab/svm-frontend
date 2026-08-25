import type { ModuleKey, Profile } from "../../types";

/**
 * Estrutura funcional do SVM — NÃO alterar.
 * Espelha a árvore definida no projeto:
 *   SVM > Novo modelo (Submeter | Inventariar)
 *       > Consultar modelo (Em andamento | Inventariado | Cancelado)
 *       > Gestão > Parametrização (4 itens)
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
    {
      key: "novo-modelo",
      label: "Novo modelo",
      module: "novo-modelo",
      children: [
        { key: "submeter", label: "Submeter", module: "novo-modelo", section: "submeter", profiles: ["solicitante"] },
        { key: "inventariar", label: "Inventariar", module: "novo-modelo", section: "inventariar" },
      ],
    },
    {
      key: "consultar-modelo",
      label: "Consultar modelo",
      module: "consultar-modelo",
      children: [
        { key: "em-andamento", label: "Em andamento", module: "consultar-modelo", section: "em-andamento" },
        {
          key: "inventariado",
          label: "Inventariado",
          module: "consultar-modelo",
          section: "inventariado",
          profiles: ["analista", "gestor"],
        },
        { key: "cancelado", label: "Cancelado", module: "consultar-modelo", section: "cancelado" },
      ],
    },
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
