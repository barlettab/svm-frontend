# SVM — pacote de implementação visual

Código pronto para colar em `svm-frontend` (React 19 + Vite + Tailwind 4).
Aplica o design system da referência institucional sem alterar a estrutura
funcional nem a API dos componentes já existentes.

Fonte visual: `SVM Design System.dc.html` (tokens e componentes) e
`SVM Telas.dc.html` (as 5 telas do MVP).

## Como aplicar

Copie o conteúdo de `handoff/` sobre a raiz do repositório, preservando os
caminhos:

```
handoff/src/index.css                    → src/index.css        (substitui)
handoff/public/icons.svg                 → public/icons.svg     (substitui o sprite do template)
handoff/src/App.tsx                      → src/App.tsx          (substitui)
handoff/src/components/**                → src/components/**    (substitui / adiciona)
```

Nada mais precisa mudar: `main.tsx`, `types.ts`, `context/` e `data/`
seguem iguais. Não há dependência nova — só Tailwind, que já está no projeto.

### Único ajuste necessário nas páginas

`App.tsx` passa a repassar a aba selecionada na sidebar:

```tsx
<NovoModeloPage section={activeSection} />
<ConsultarModeloPage section={activeSection} />
<GestaoPage section={activeSection} />
```

Cada página deve aceitar `section?: string` e usá-la como aba inicial
(quando `undefined`, mantém o comportamento atual). É a única mudança de
assinatura; nenhuma regra de negócio muda.

## Tokens

Ficam em `src/index.css`, dentro de `@theme` — o Tailwind 4 gera os
utilitários automaticamente:

| token | utilitário | valor |
| --- | --- | --- |
| `--color-nav` | `bg-nav` | #1F6CB0 sidebar |
| `--color-nav-brand` | `bg-nav-brand` | #175C99 faixa da marca |
| `--color-nav-group` | `bg-nav-group` | #4A90C8 grupo de menu |
| `--color-nav-hover` | `hover:bg-nav-hover` | #3A83BF |
| `--color-nav-active` | `bg-nav-active` | #E9EFF3 item ativo |
| `--color-app` | `bg-app` | #EFEFEF fundo da aplicação |
| `--color-surface` | `bg-surface` | #FFFFFF |
| `--color-thead` | `bg-thead` | #F2F2F2 cabeçalho de tabela |
| `--color-line` / `-soft` / `--color-field` | `border-line` … | #E0E0E0 / #ECECEC / #C9C9C9 |
| `--color-ink` … `--color-ink-4` | `text-ink` … | #4D4D4D · #6E6E6E · #9A9A9A · #B8B8B8 |
| `--color-action` | `bg-action` | #7E7E7E botão de ação |
| `--color-success/warning/error/info` | `text-success` … | #3D7F39 · #B4801D · #AD3630 · #1F6CB0 |
| `--radius-svm` / `--radius-nav` | `rounded-svm` / `rounded-nav` | 2px / 3px |
| `--shadow-card/pop/modal` | `shadow-modal` … | plano por padrão; sombra só em flutuantes |
| `--text-page` … `--text-micro` | `text-page`, `text-body` … | 22 / 16 / 15 / 14 / 13.5 / 12 / 11.5 / 11 |

Regras que não devem ser violadas: peso máximo 600 (títulos de página usam
300), altura de controle **38px**, borda sempre **1px sólida**, raio nunca
acima de 3px, tabelas sem raio, superfícies com borda em vez de sombra.

## Componentes

**Layout** — `layout/Sidebar` (árvore de 3 níveis, filtrada por perfil em
`navConfig.ts`), `layout/Header`, `layout/PageHeader` (título +
breadcrumb + ações), `layout/AppFooter`, `ui/Panel`, `ui/FormGrid`,
`ui/FormActions`.

**Navegação e dados** — `ui/Tabs`, `ui/Table`, `ui/Pagination`,
`ui/StatCard`, `ui/Badge` + `StatusBadge`, `ui/DetailRow`,
`ui/Timeline`, `ui/Stepper`.

**Formulários** — `ui/FormField` (+ `controlClasses`), `ui/TextField`,
`ui/SelectField`, `ui/TextareaField`, `ui/DateField`,
`ui/RadioGroupField`, `ui/CheckboxField`, `ui/ReadOnlyField`,
`ui/FileUpload`, `ui/FilterBar`, `ui/FilterTextField`,
`ui/FilterSelectField`.

**Botões** — `ui/Button` com `variant`: `primary` (cinza sólido, ação
principal da referência), `secondary` (contorno), `ghost`, `danger`,
`link`; `ui/IconButton` para ações de tabela (alvo 34×34).
`PrimaryButton` e `SecondaryButton` seguem existindo como atalhos.

**Feedback** — `ui/Modal`, `ui/ConfirmDialog`, `ui/SuccessModal`,
`ui/Drawer`, `ui/Toast`, `ui/EmptyState`, `ui/LoadingState`
(`LoadingTable`, `InlineLoading`), `ui/ErrorState` + `InlineAlert`.

**Ícones** — `ui/Icon` consome `public/icons.svg` (sprite de 33 símbolos,
grid 24, traço 1.7, `currentColor`). Uso: `<Icon name="search" size={16} />`.
Não usar emoji nem ícones de outra família.

## Estados cobertos

default · hover · active · focus (anel 3px rgba(31,108,176,.35), global no
CSS) · disabled · loading (skeleton de tabela e spinner inline) · empty ·
error (tela e faixa inline) · success (modal e toast).

## Responsividade

≥1440 sidebar fixa 265px e formulário em 3 colunas · 1024–1439 formulário em
2 colunas · <1024 sidebar em overlay pelo botão do header, tabela com rolagem
horizontal · <768 formulário em 1 coluna e botões em largura total. A
identidade não muda em nenhuma faixa.
