# SVM — atualização dos ícones de ação

Três arquivos. Nada mais no repositório muda.

## 1. `public/icons.svg` — substituir o arquivo

Use o `public/icons.svg` desta pasta (sprite completo, 38 símbolos).

Se preferir não substituir o sprite inteiro, cole os dois símbolos abaixo
imediatamente antes do `</svg>` de fecho do seu `public/icons.svg`:

```svg
<symbol id="svm-atribuir-analista" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="12" cy="4.1" r="2.7"></circle>
    <path d="M12 8.9 3.7 11.3a1 1 0 0 0-.7 1.2 1 1 0 0 0 1.2.7L10 11.7v2l-1.1 8.2a1 1 0 0 0 .9 1.1 1 1 0 0 0 1.1-.8l1.1-5.4 1.1 5.4a1 1 0 0 0 1.1.8 1 1 0 0 0 .9-1.1L14 13.7v-2l5.8 1.5a1 1 0 0 0 1.2-.7 1 1 0 0 0-.7-1.2z"></path>
  </symbol>
<symbol id="svm-alterar-solicitante" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="16.1" cy="6.9" r="2.4"></circle>
    <path d="M12.2 12.6c.2-2.4 1.8-3.6 3.9-3.6s3.7 1.2 3.9 3.6z"></path>
    <circle cx="7.9" cy="15.1" r="2.4"></circle>
    <path d="M4 20.8c.2-2.4 1.8-3.6 3.9-3.6s3.7 1.2 3.9 3.6z"></path>
    <path d="M4.2 14.4A8.3 8.3 0 0 1 10.6 4.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
    <polygon points="10.2,2.5 13.4,4.3 10.4,6.2"></polygon>
    <path d="M19.8 9.6a8.3 8.3 0 0 1-6.4 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
    <polygon points="13.8,17.8 10.6,19.7 13.6,21.5"></polygon>
  </symbol>
```

São sólidos (`fill="currentColor"`), diferente do resto do sprite que é de
traço — é assim na referência.

## 2. `src/components/ui/Icon.tsx` — uma linha

No union `IconName`, troque:

```ts
  | "bell" | "user" | "help" | "logout"
```

por:

```ts
  | "bell" | "user" | "help" | "logout"
  | "atribuir-analista" | "alterar-solicitante"
```

## 3. `src/components/ui/RowActions.tsx` — arquivo novo

Copie `src/components/ui/RowActions.tsx` desta pasta para o mesmo caminho
no repositório. Ele depende apenas de `./Button` (IconButton) e `./Icon`,
que já existem.

### Uso na tabela de solicitações

```tsx
import { RowActions } from "../../components/ui/RowActions";

// dentro das colunas da Table:
{
  header: "Ações",
  align: "right",
  width: "180px",
  render: (row) => (
    <RowActions
      actions={["visualizar", "alterar", "atribuir-analista", "alterar-solicitante", "cancelar"]}
      disabled={row.status === "Cancelado" ? ["alterar", "cancelar"] : []}
      onAction={(action) => handleAction(action, row)}
    />
  ),
}
```

Ordem das ações, conforme definido: Visualizar solicitação (`eye`) ·
Alterar solicitação (`edit`) · Atribuir solicitação p/ Analista
(`atribuir-analista`) · Alterar solicitante (`alterar-solicitante`) ·
Cancelar solicitação (`trash`).

Cada botão tem 34×34 de área clicável, `aria-label` e `title` com o rótulo
completo; o de cancelar fica vermelho no hover; `onAction` recebe
`stopPropagation` para não disparar o clique da linha.
