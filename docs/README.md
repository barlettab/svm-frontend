# SVM — Design System em HTML/CSS

Referência de implementação sem framework. Três arquivos:

```
index.html   página de referência: todos os tokens, componentes e estados
svm.css      a folha de estilo do design system (o entregável)
icons.svg    sprite de ícones (38 símbolos, grade 24)
```

Abra `index.html` no navegador. Nenhum build, nenhuma dependência além da
fonte Open Sans, importada no topo do CSS.

## Como usar

```html
<link rel="stylesheet" href="svm.css">
...
<svg width="16" height="16" viewBox="0 0 24 24"><use href="icons.svg#svm-search"/></svg>
```

Os estilos dentro da tag `<style>` de `index.html` (prefixo `.sg-`) servem
apenas à página de referência e **não** fazem parte do design system — não
copie para o produto.

## Convenção de classe

`.svm-<componente>` · `.svm-<componente>--<variante>` ·
`.svm-<componente>__<parte>`

Estados vêm de atributos reais do HTML, não de classes: `:disabled`,
`[aria-selected="true"]`, `[aria-current="page"]`, `[aria-invalid="true"]`,
`:hover`, `:focus-visible`. Isso mantém marcação e acessibilidade alinhadas.

## Sumário do CSS

| bloco | conteúdo |
| --- | --- |
| 1 | tokens (`:root`) — cor, tipografia, espaçamento, borda, sombra, medidas |
| 2 | reset e foco global |
| 3–5 | layout, sidebar, header, rodapé |
| 6–7 | cabeçalho de página, breadcrumb, painel |
| 8–9 | grid de formulário e campos |
| 10 | botões e ações de linha |
| 11–13 | filtros, abas, trilha de etapas |
| 14–19 | tabela, paginação, badge, card de resumo, detalhe, timeline |
| 20–21 | estados de tela, skeleton, alerta |
| 22 | modal, drawer, toast |
| 23 | responsividade (1440 / 1024 / 768) |
| 24 | impressão |

## Regras que não devem ser violadas

Altura de controle 38px · borda sempre 1px sólida · raio máximo 3px (tabela
sem raio) · peso máximo 600, com 300 reservado a título de página e números
grandes · azul apenas em navegação, link e seleção — a ação principal é cinza
· superfície delimitada por borda, não por sombra · sombra só em elemento
flutuante · status sempre com rótulo textual · foco nunca suprimido.

## Responsividade

≥1440 formulário em 3 colunas · 1024–1439 em 2 colunas · <1024 sidebar em
overlay pelo botão do header e tabela com rolagem horizontal · <768 uma
coluna e botões em largura total. A identidade visual não muda em nenhuma
faixa.
