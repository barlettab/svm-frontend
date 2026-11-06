# SVM — Alterações para o desenvolvimento

05/11/2026 · Barbara Barletta

Este documento lista as mudanças de interface e de fluxo que devem ser feitas no módulo SVM. O protótipo de referência está no repositório `svm-frontend`, e cada item indica os arquivos onde o comportamento pode ser conferido.

## Resumo

São seis alterações. As de maior impacto são o fluxo de complementação e a nova página da solicitação, porque mudam status e exigem back-end.

| # | Tela | Perfis | O que muda | Back-end |
| --- | --- | --- | --- | --- |
| 1 | Consultar modelos › Inventariado | Analista, Gestor | Indicadores agrupados que filtram a lista | Não |
| 2 | Novo modelo | Solicitante | Remover abas Informações Adicionais, Implantação, Metodologia e Monitoramento | Não |
| 3 | Submeter novo modelo | Solicitante | Novo campo Objetivo e nova ordem dos campos | Sim (novo campo) |
| 4 | Consultar modelos › Em andamento | Todos | Botão Abrir + menu Ações no lugar da fileira de ícones | Não |
| 5 | Página da solicitação (nova) | Todos | Página própria no lugar do painel lateral, com histórico e arquivos | Sim (leitura) |
| 6 | Fluxo de complementação | Todos | Analista/Gestor pede, Solicitante responde com anexo, status muda | Sim |

## 1. Consultar modelos › Inventariado: indicadores que filtram a lista

Hoje os 7 cards mostram apenas números, e não há como ver quais modelos estão em cada um. Cada indicador deve filtrar a tabela e mostrar exatamente os modelos que ele conta.

**Indicadores**

- Trocar os 7 cards por um painel único com 4 blocos: Total de inventariados · Resultado da validação (Validados, Não validados) · Monitoramento (Monitorados, Não monitorados, Não se aplica) · Situação (Ativos, Inativos, Suspensos).
- Cada bloco tem uma barra de proporção e, em cada linha, cor, rótulo, percentual sobre o total e quantidade.
- Cada linha é um botão. Ao passar o mouse aparece "Ver os N na lista ↓".
- Linha com quantidade 0 fica desabilitada.

**Ao clicar em um indicador**

1. A tabela é filtrada pelo campo e valor do indicador (ex.: Resultado da validação = Validado).
2. A página rola até a tabela.
3. O indicador fica marcado (borda e fundo azuis) e mostra "Filtrando a lista · clique para remover".
4. Acima da tabela aparece o título "N modelos — validados, de 28 inventariados" e um chip removível com o filtro.
5. A coluna correspondente na tabela fica destacada.
6. Clicar de novo no indicador, no chip ou em "Ver todos" remove o filtro.

O filtro do indicador soma com os filtros do formulário, e o botão Limpar remove os dois.

**Tabela**

- Remover a caixa "Pesquisar" do canto da tabela: ela duplica a busca do formulário.
- Nome do modelo e número da solicitação na mesma célula (nome em negrito, número abaixo).
- Colunas: Modelo · Tipo de modelo · Assunto · Validação · Monitoramento · Situação · Analista · Inventariado em (dd/mm/aaaa) · Ação.
- Área gestora e Público saem da tabela e ficam no detalhe.
- A rolagem horizontal fica só dentro da tabela, nunca na página.

Arquivos de referência: `src/components/ui/IndicatorPanel.tsx`, `src/pages/ConsultarModelo/InventariadoTab.tsx` e a opção `highlight` em `src/components/ui/Table.tsx`.

## 2. Novo modelo: abas do Solicitante

O perfil Solicitante deve ver apenas o formulário "Submeter novo modelo".

- Remover para o Solicitante as abas Informações Adicionais, Implantação e Metodologia e Monitoramento.
- Com uma única aba, não exibir a barra de abas: o título "Submeter novo modelo" já identifica a tela.
- Analista e Gestor continuam com as abas atuais.

Arquivos de referência: `TABS_BY_PROFILE` em `src/types.ts` e `src/pages/NovoModelo/NovoModeloPage.tsx`.

## 3. Submeter novo modelo: campo Objetivo e ordem dos campos

Incluir o campo Objetivo, obrigatório, e reorganizar os campos nesta ordem:

| Linha | Campos | Largura |
| --- | --- | --- |
| 1 | Nome do modelo * | Total |
| 2 | Assunto * · Tipo de modelo * · Área gestora * | 3 colunas |
| 3 | Público * | 1 coluna |
| 4 | Objetivo * (texto, até 500 caracteres) | Total |
| 5 | Anexo | Total |

- Nos selects, o texto inicial é "Selecione", não "::SELECIONE::".
- Campo obrigatório vazio mostra "Campo obrigatório" abaixo dele.
- O Objetivo precisa ser gravado com a solicitação e aparecer na página da solicitação.

Arquivo de referência: `src/pages/NovoModelo/SubmeterForm.tsx`.

## 4. Coluna de ações: botão Abrir e menu Ações

A fileira de 5 a 6 ícones sem texto em cada linha é difícil de entender. Cada linha passa a ter no máximo três botões com texto:

| Botão | Quando aparece | O que faz |
| --- | --- | --- |
| Complementar (azul) | Solicitante, status Em complementação | Abre a página da solicitação no formulário de resposta |
| Abrir | Sempre | Abre a página da solicitação |
| Ações ▾ | Sempre | Abre um menu com as demais ações por extenso |

Itens do menu Ações para Analista e Gestor, nesta ordem:

1. Pedir complementação, com a linha de apoio "Peça um documento ou informação ao solicitante." Fica desabilitado fora de Submetido e Em análise e mostra o motivo ("Já aguardando o solicitante." ou "Disponível apenas em Submetido ou Em análise.").
2. Alterar solicitação
3. Atribuir solicitação para analista
4. Alterar solicitante
5. Cancelar solicitação (separado por linha, em vermelho)

O menu abre abaixo do botão, não é cortado pela rolagem da tabela, fecha com Esc ou clique fora e permite navegar pelas setas.

Para o Solicitante, aparece também um aviso acima da tabela quando há pendências: "1 solicitação aguarda sua complementação", com o número, o nome do modelo e o link "Ver pedido e complementar".

Arquivos de referência: `src/components/ui/ActionMenu.tsx` e `src/pages/ConsultarModelo/EmAndamentoTab.tsx`.

## 5. Página da solicitação

"Abrir" leva a uma página própria da solicitação, no lugar do painel lateral. Os blocos aparecem nesta ordem:

1. **Cabeçalho:** trilha "Consultar modelos › Em andamento › REQ-…", botão voltar, nome do modelo como título e número da solicitação abaixo. Para Analista e Gestor, botão "Pedir complementação" à direita quando o status permitir.
2. **Complementação** (só quando o status é Em complementação): o pedido do analista com autor, data, texto e anexo. Para o Solicitante, o formulário de resposta logo abaixo (seção 6).
3. **Pedir complementação** (Analista e Gestor, ao clicar no botão): formulário do pedido (seção 6).
4. **Complementação recebida** (Analista e Gestor): data, arquivo e observação enviados pelo solicitante.
5. **Informações da solicitação:** Nome do modelo · Status · Área gestora · Analista responsável · Assunto · Público · Data da submissão · Solicitante, em grade de 4 colunas. Incluir também o Objetivo (item 3).
6. **Histórico da solicitação** (2/3 da largura): timeline com data, descrição e autor de cada evento. O texto do pedido e a observação do solicitante aparecem citados. Os anexos aparecem no evento em que entraram, com botão de download. Pedidos de complementação ficam marcados em amarelo e envios do solicitante em verde.
7. **Arquivos (N)** (1/3 da largura): todos os arquivos da solicitação, com nome, data, quem enviou e botão de download. Substitui a tabela "Arquivos da Solicitação" do sistema atual.

Depois de enviar um pedido ou uma resposta, o usuário continua na página, que mostra o status e o histórico já atualizados, e uma mensagem de confirmação.

Arquivos de referência: `src/pages/ConsultarModelo/SolicitacaoDetalhePage.tsx` e `src/components/ui/Timeline.tsx`.

## 6. Fluxo de complementação

Analista ou Gestor pede uma complementação, o Solicitante responde com um anexo e a solicitação volta sozinha para Em análise com o mesmo analista.

| De | Ação | Quem | Para | Registro no histórico |
| --- | --- | --- | --- | --- |
| Submetido ou Em análise | Pedir complementação | Analista ou Gestor | Em complementação | "Complementação solicitada ao solicitante." + autor + texto do pedido + anexo (se houver) |
| Em complementação | Enviar complementação | Solicitante | Em análise | "Complementação enviada pelo solicitante." + autor + observação + anexo, seguido de "Solicitação retornou para análise." |

**Pedido (Analista e Gestor)**

- Pontos de entrada: item "Pedir complementação" do menu Ações (abre a página já com o formulário) e botão "Pedir complementação" no cabeçalho da página.
- Texto explicativo: "O pedido vai para [solicitante]. A solicitação passa para Em complementação e volta para Em análise quando o solicitante enviar o anexo."
- Campo "O que o solicitante precisa enviar?": obrigatório, mínimo de 10 e máximo de 1.000 caracteres, com a dica "Seja específico: o solicitante verá exatamente este texto."
- Campo "Anexo para o solicitante (opcional)": para modelo de documento, planilha a preencher ou parecer. PDF, DOC, XLSX ou CSV até 20 MB.
- Botões: Cancelar e Enviar pedido. Confirmação: "Complementação solicitada."

**Resposta (Solicitante)**

- O pedido aparece em destaque amarelo: autor, data, texto e anexo do analista.
- Texto explicativo: "Anexe o documento solicitado e clique em Enviar complementação. A solicitação volta para Em análise com [analista]."
- Campo "Anexo da complementação": obrigatório. Sem anexo, mostrar "Anexe o documento solicitado pelo analista para enviar a complementação."
- Campo "Observação para o analista": opcional, até 500 caracteres.
- Botão: Enviar complementação. Confirmação: "Complementação enviada. A solicitação voltou para Em análise com [analista]."

Um novo pedido sobre a mesma solicitação substitui o pedido em aberto na tela, mas os anteriores continuam no histórico.

Arquivos de referência: `src/context/SolicitacoesContext.tsx` (as duas transições) e `src/pages/ConsultarModelo/SolicitacaoDetalhePage.tsx`.

## 7. Back-end e regras

No protótipo tudo fica em memória e é desfeito ao recarregar a página. No sistema real, estes pontos precisam ser feitos no servidor:

- **Novos dados da solicitação:** `objetivo`; o pedido em aberto (`complementacao`, `anexoPedidoComplementacao`); a última resposta (`respostaComplementacao`: data, arquivo, observação).
- **Eventos do histórico:** data, descrição, autor, texto citado (`detalhe`), lista de anexos e tipo (`complementacao-pedida` ou `complementacao-enviada`). O protótipo usa o tipo para colorir o evento.
- **Mudança de status:** as duas transições da seção 6 devem ser feitas no servidor, junto com o registro no histórico, numa única operação.
- **Validação no servidor:** pedido só em Submetido ou Em análise e só por Analista ou Gestor; resposta só em Em complementação, só pelo Solicitante da área e com anexo.
- **Anexos:** gravar o arquivo, ligar ao evento do histórico e servir o download. Limite de 20 MB; formatos PDF, DOC, DOCX, XLSX e CSV.
- **Contagens dos indicadores:** calcular sobre a lista completa da aba, não sobre a página atual da tabela.

Tipos de referência: `Solicitacao` e `TimelineEvent` em `src/types.ts`.

## Pontos a confirmar

- [ ] Na tela atual há 28 inventariados, mas Validados (14) + Não validados (10) somam 24. Qual é o resultado dos outros 4? Ele precisa de um indicador próprio.
- [ ] O pedido de complementação deve ser permitido só em Em análise ou também em Submetido?
- [ ] O Solicitante deve ver "Atribuir analista" e "Alterar solicitante" no menu Ações? A proposta é deixar só Alterar e Cancelar.
- [ ] A Área gestora em "Submeter novo modelo" deve vir preenchida com a área do usuário?
- [ ] O Solicitante deve receber aviso (e-mail ou notificação no sino) quando houver pedido de complementação? E o analista, quando a resposta chegar?
- [ ] A aba Inventariado também deve usar a página de detalhe no lugar do painel lateral?
