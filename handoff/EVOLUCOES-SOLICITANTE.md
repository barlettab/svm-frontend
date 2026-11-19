# Evoluções do SVM — Fluxo do Solicitante (Sprint 42)

Este documento mostra, tela por tela, o que muda para o **solicitante** no SVM. Para cada tela há o passo a passo do que o usuário faz, o que aparece, o que o sistema não deixa fazer (com a mensagem exata) e a imagem de **como deve ficar**. Quando já existe a tela no sistema atual, ela aparece antes, com um **X vermelho** no que sai, um **quadro laranja** no que muda e uma **etiqueta verde** no que é novo.

As imagens de “como deve ficar” vêm do protótipo (repositório `svm-frontend`). Os nomes, dados e números das imagens são exemplos.

**Quem é o solicitante:** a pessoa da área gestora do modelo (por exemplo, da área Financeiro). Ele envia o modelo para a GEVAM validar, responde quando a GEVAM pede algum documento e acompanha o resultado. Ele **não** faz a análise: isso é com o analista e o gestor da GEVAM.

**Menu do solicitante:** no menu lateral ele tem só duas opções: **Novo modelo** (para enviar um modelo) e **Consultar modelo** (para acompanhar). Em Consultar modelo há três abas: **Em andamento**, **Inventariado** e **Cancelado** (os mesmos nomes que a GEVAM vê).

**Regra de ouro das ações:** nas listas, cada linha tem só o botão **Abrir**. Tudo o que o solicitante pode fazer com uma solicitação (editar, responder complementação, cancelar) fica no botão **Ações**, dentro da solicitação aberta.

**Os status que o solicitante vê:**

- **Submetido:** o solicitante enviou e nenhum analista pegou a solicitação ainda. Só aqui ele pode editar.
- **Em análise:** o analista da GEVAM está analisando.
- **Em complementação:** a GEVAM pediu um documento ou esclarecimento. **Depende do solicitante:** ele precisa responder.
- **Aguardando gestor:** o analista terminou e a solicitação está com o gestor da GEVAM para o aval final. O solicitante vê esse status do jeito que ele é.
- **Validado:** a GEVAM terminou e validou. O modelo passa a constar na aba **Inventariado**.
- **Cancelado:** a solicitação foi encerrada (pelo solicitante ou pela GEVAM), sempre com uma justificativa.

## 1. Fluxo do solicitante

Seta grossa = o que o solicitante faz · seta fina = o que a GEVAM faz.

```mermaid
flowchart TB
    INI(["Envia a solicitação com o<br/>relatório de desenvolvimento (PDF)"]) ==> SUB["Submetido"]:::status
    SUB ==>|"Edita os dados<br/>(pode trocar o relatório)"| SUB
    SUB -->|"Analista assume<br/>ou gestor atribui"| ANA["Em análise"]:::status
    ANA -->|"Analista pede complementação"| COMP["Em complementação"]:::status
    COMP ==>|"Ações > Responder complementação"| ANA
    ANA -->|"Analista envia ao gestor"| GES["Aguardando gestor"]:::status
    GES -->|"Gestor finaliza a validação"| VAL(["Validado"]):::ok
    VAL ==>|"Consulta na aba Inventariado<br/>(só leitura)"| CONS["Página do modelo"]
    SUB ==>|"Cancela, com justificativa"| CAN(["Cancelado"]):::cancel
    ANA ==> CAN
    COMP ==> CAN
    GES ==> CAN
    CAN ==>|"Consulta na aba Cancelado<br/>(só leitura)"| CONSC["Página da solicitação cancelada"]
    classDef status fill:#eaf1f8,stroke:#1f6cb0,stroke-width:2px,color:#1f4f7d
    classDef ok fill:#edf4ec,stroke:#3d7f39,stroke-width:2px,color:#2f6a2c
    classDef cancel fill:#f2f2f2,stroke:#8a8a8a,stroke-width:2px,color:#4d4d4d
```

## 2. Histórias do solicitante

### HS-01. Enviar um novo modelo para validação

> **Como** solicitante, **quero** enviar um novo modelo com o relatório de desenvolvimento, **para** que a GEVAM faça a validação independente.

**Hoje × como deve ficar**

![Figura 1 – Hoje: Novo modelo > Solicitação. X vermelho = sai; quadro laranja = muda.](img/00-hoje-novo-modelo-solicitacao-marcado.png)

*Figura 1 – Hoje: Novo modelo > Solicitação. X vermelho = sai; quadro laranja = muda.*

O que muda em relação à tela de hoje:

1. **Saem as abas** “Implantação” e “Metodologia e Monitoramento”. Como sobra só a solicitação, a barra de abas some: o solicitante vê direto o formulário.
2. **Sai o campo “Observações”** (o editor de texto inteiro).
3. O campo **“Anexo” passa a se chamar “Relatório de desenvolvimento do modelo”** e aceita **um único arquivo, só PDF** (até 20 MB).
4. **Sai o botão “Incluir outro anexo”.**
5. **Sai o botão “Cancelar”.**
6. **O botão “Avançar” vira “Enviar”**: não há mais próximas abas; o envio acontece aqui.

**Passo a passo**

1. No menu lateral, clicar em **Novo modelo**.
2. Preencher todos os campos (todos são obrigatórios), nesta ordem: Nome do modelo · Assunto · Tipo de modelo · Área gestora · Público · Objetivo (até 500 caracteres: um resumo curto e direto do uso do modelo, que precisa caber na ficha do modelo e nas listas).
3. Em **Relatório de desenvolvimento do modelo**, arrastar o arquivo PDF para o quadro ou clicar em “selecione”. O nome do arquivo aparece no quadro, com um ícone de lixeira para trocar.
4. Clicar em **Enviar**.
5. Aparece a janela “Solicitação enviada com sucesso.” com o **número da solicitação**. Clicar em **Fechar**.
6. A solicitação passa a aparecer em Consultar modelo > Em andamento, com status **Submetido**.

**O sistema não deixa**

- Enviar com algum campo vazio: aparece “Campo obrigatório” em vermelho, embaixo de cada campo vazio.
- Enviar sem o relatório: aparece “Anexe o relatório de desenvolvimento do modelo.”
- Anexar arquivo que não seja PDF: o seletor de arquivos só oferece PDF; se a pessoa **arrastar** outro tipo de arquivo para o quadro, ao clicar em Enviar aparece “O relatório deve ser um arquivo PDF.”

**Como deve ficar**

![Figura 2 – Como deve ficar: formulário vazio, sem abas, sem Observações e com o botão Enviar.](img/01-solicitante-formulario.png)

*Figura 2 – Como deve ficar: formulário vazio, sem abas, sem Observações e com o botão Enviar.*

![Figura 3 – Clicou em Enviar com os campos vazios: “Campo obrigatório” em cada campo e o aviso do relatório.](img/01b-solicitante-formulario-erros.png)

*Figura 3 – Clicou em Enviar com os campos vazios: “Campo obrigatório” em cada campo e o aviso do relatório.*

![Figura 4 – Formulário preenchido, com o relatório em PDF anexado.](img/01c-solicitante-formulario-preenchido.png)

*Figura 4 – Formulário preenchido, com o relatório em PDF anexado.*

![Figura 5 – Depois de Enviar: janela de sucesso com o número da solicitação.](img/01d-solicitante-enviada.png)

*Figura 5 – Depois de Enviar: janela de sucesso com o número da solicitação.*

### HS-02. Acompanhar minhas solicitações

> **Como** solicitante, **quero** ver as solicitações da minha área e o status de cada uma, **para** saber o que está com a GEVAM e o que depende de mim.

**Hoje × como deve ficar**

![Figura 6 – Hoje: Consultar modelos > Em andamento. X vermelho = sai; quadro laranja = muda; verde = novo.](img/00-hoje-em-andamento-marcado.png)

*Figura 6 – Hoje: Consultar modelos > Em andamento. X vermelho = sai; quadro laranja = muda; verde = novo.*

O que muda em relação à tela de hoje:

1. **Filtros:** “Status” passa a se chamar **“Status da solicitação”**; **sai** o filtro “Data da submissão”; **entra** o filtro “Analista responsável”.
2. **Colunas que saem:** Detalhes (o “+” que expandia a linha), Objetivo modelo e Tipo modelo.
3. **Colunas que entram:** Solicitante, Data da submissão e Analista responsável.
4. **Coluna Ação:** o ícone de olho vira o botão **Abrir**. **Saem** o clipe (complementar) e a lixeira (cancelar): responder e cancelar passam a ficar no botão **Ações**, dentro da solicitação.
5. **Novo aviso no topo** quando existe solicitação esperando complementação do solicitante.

**Passo a passo**

1. No menu lateral, clicar em **Consultar modelo**. Abre a aba **Em andamento**.
2. A lista mostra **só as solicitações da área do solicitante**. Acima da lista aparece “Exibindo solicitações da área [área]”.
3. Se alguma solicitação está esperando resposta dele, aparece no topo um **aviso amarelo**: “Existe(m) N solicitação(ões) que exige(m) complementação”, com o texto “É preciso que o solicitante envie a complementação para dar continuidade à análise do especialista. Abra a solicitação e use Ações > Responder complementação.” e a lista com o número e o nome de cada uma.
4. Para filtrar, preencher os campos e clicar em **Pesquisar**. Para voltar ao normal, clicar em **Limpar**.
5. Em cada linha há **só** o botão **Abrir**, que abre a solicitação (HS-03).

**O que aparece**

- Filtros: Nº da solicitação · **Status da solicitação** · Área gestora (fixa na área dele, não dá para trocar) · Nome do modelo · Assunto · Analista responsável.
- **Status da solicitação** tem as opções: Todos, Submetido, Em análise, Em complementação e Aguardando gestor.
- Colunas: Nº da solicitação · Nome do modelo · Assunto · Solicitante · Data da submissão · Analista responsável · Status · Ação. **Não há coluna Área gestora** (seria sempre a área dele).
- Solicitações Validado e Cancelado **não** aparecem aqui: ficam nas abas Inventariado e Cancelado (HS-07).

**Não aparece para o solicitante:** os quadros de contagem por status (são só da GEVAM), botões de ação na linha e qualquer ação da GEVAM.

**Como deve ficar**

![Figura 7 – Aba Em andamento: aviso de complementação pendente, filtros e lista da área do solicitante, só com o botão Abrir.](img/18-solicitante-aviso-complementacao.png)

*Figura 7 – Aba Em andamento: aviso de complementação pendente, filtros e lista da área do solicitante, só com o botão Abrir.*

### HS-03. Ver os detalhes de uma solicitação

> **Como** solicitante, **quero** abrir a solicitação, **para** ver o status, o histórico e todos os documentos.

**Passo a passo**

1. Em Consultar modelo > Em andamento, clicar em **Abrir** na linha da solicitação.
2. Abre a página da solicitação. No topo aparecem o nome do modelo, o número e o caminho “Consultar modelos > Em andamento > [número]” (clicar em “Consultar modelos” volta para a lista).
3. Rolar a página para ver as três partes:
   1. **Informações da solicitação**, em três blocos: *Solicitação* (número, status, solicitante, data da submissão), *Modelo* (nome, tipo, assunto, Tier, área gestora, público, objetivo) e *Análise GEVAM* (analista responsável, data de atribuição, data de finalização da análise, tempo de análise, gestor GEVAM).
   2. **Histórico da solicitação:** cada acontecimento com data, descrição e quem fez. Textos enviados aparecem citados e os anexos têm botão de download.
   3. **Arquivos:** todos os documentos da solicitação (do solicitante, do analista e do gestor), com nome, data, quem enviou e download.

**Regras**

- O solicitante vê **todos os documentos**, inclusive os da GEVAM.
- Quando a solicitação está com o gestor da GEVAM, o status aparece como **Aguardando gestor**.
- O solicitante **não** vê as abas de análise da GEVAM (Cálculo do Tier, Matriz de Risco e Informações do Modelo): a página dele não tem abas.
- O botão **Ações** fica no canto superior direito (HS-04, HS-05 e HS-06).

![Figura 8 – Página da solicitação vista pelo solicitante: Informações da solicitação (sem abas de análise).](img/33-solicitante-detalhe.png)

*Figura 8 – Página da solicitação vista pelo solicitante: Informações da solicitação (sem abas de análise).*

![Figura 9 – Mais abaixo na mesma página: Histórico da solicitação e Arquivos.](img/33b-solicitante-historico.png)

*Figura 9 – Mais abaixo na mesma página: Histórico da solicitação e Arquivos.*

### HS-04. Editar a solicitação

> **Como** solicitante, **quero** corrigir os dados que enviei, **para** não precisar cancelar e abrir outra solicitação por causa de um erro.

**Só vale enquanto o status é Submetido** (nenhum analista pegou a solicitação ainda). Nos outros status o item **“Editar solicitação” não aparece** no menu Ações (some; não fica cinza).

**Passo a passo**

1. Abrir a solicitação (HS-03).
2. Clicar em **Ações** (canto superior direito) > **Editar solicitação**.
3. Abre o formulário “Editar solicitação” com os mesmos campos do envio, já preenchidos. Corrigir o que precisar.
4. Se quiser trocar o relatório, usar o campo **Substituir relatório de desenvolvimento (opcional)** (só PDF). Embaixo aparece o nome do relatório atual.
5. Clicar em **Salvar alterações**. Para desistir, clicar em **Cancelar** (nada é gravado).

**O que acontece**

- Os dados são gravados e o histórico registra **um único registro**: “Solicitação editada pelo solicitante.” Não se detalha o que foi alterado.
- Se trocou o relatório: o arquivo novo **substitui** o antigo, e o **antigo é apagado** (sai do histórico e da lista de Arquivos). O arquivo novo fica anexado a esse mesmo registro.

**O sistema não deixa**

- Salvar com campo vazio: “Campo obrigatório”.
- Trocar o relatório por um arquivo que não seja PDF: “O relatório deve ser um arquivo PDF.”
- Editar depois que um analista pegou a solicitação: o item “Editar solicitação” não aparece mais no menu.

![Figura 10 – Menu Ações em uma solicitação Submetido: Editar solicitação e Cancelar solicitação.](img/02-solicitante-acoes.png)

*Figura 10 – Menu Ações em uma solicitação Submetido: Editar solicitação e Cancelar solicitação.*

![Figura 11 – Menu Ações em uma solicitação Aguardando gestor: “Editar solicitação” não aparece; só Cancelar solicitação.](img/02b-solicitante-acoes-em-analise.png)

*Figura 11 – Menu Ações em uma solicitação Aguardando gestor: “Editar solicitação” não aparece; só Cancelar solicitação.*

![Figura 12 – Formulário Editar solicitação completo, com um novo relatório escolhido para substituir o atual.](img/03-solicitante-editar.png)

*Figura 12 – Formulário Editar solicitação completo, com um novo relatório escolhido para substituir o atual.*

### HS-05. Responder a um pedido de complementação

> **Como** solicitante, **quero** ver o que a GEVAM pediu e enviar o que falta, **para** que a análise continue.

**Só vale quando o status é Em complementação.** Não há botão na lista: a resposta fica no menu **Ações**, dentro da solicitação.

**Passo a passo**

1. Em Consultar modelo > Em andamento, o aviso amarelo do topo mostra quais solicitações esperam complementação. Clicar em **Abrir** na linha da solicitação.
2. No topo da página aparece o quadro **“O analista pediu uma complementação”**: quem pediu, quando, o texto do pedido e o arquivo anexado (por exemplo, o TAP com as pendências do relatório), que pode ser baixado. Embaixo: “Para responder, clique em Ações > Responder complementação.”
3. Clicar em **Ações** > **Responder complementação**.
4. Em **Anexo da complementação** (obrigatório), anexar o documento pedido.
5. Se quiser, escrever uma **Observação para o analista** (opcional, até 500 caracteres).
6. Clicar em **Enviar complementação**. Para desistir, clicar em **Cancelar** (nada é enviado).

**O que acontece**

- O status volta para **Em análise**, com o mesmo analista, e a solicitação sai do aviso amarelo da lista.
- O histórico registra **um único registro**: “Complementação enviada pelo solicitante.”, com o anexo e a observação.
- Se a resposta não resolver tudo, a GEVAM pode pedir de novo. Não há prazo nem limite de vezes.

**O sistema não deixa**

- Enviar sem anexo: aparece “Anexe o documento solicitado pelo analista para enviar a complementação.”

![Figura 13 – Solicitação aberta: o pedido da GEVAM e a orientação para responder pelo menu Ações.](img/19a-solicitante-pedido.png)

*Figura 13 – Solicitação aberta: o pedido da GEVAM e a orientação para responder pelo menu Ações.*

![Figura 14 – Menu Ações em uma solicitação Em complementação: Responder complementação e Cancelar solicitação.](img/19b-solicitante-acoes-complementacao.png)

*Figura 14 – Menu Ações em uma solicitação Em complementação: Responder complementação e Cancelar solicitação.*

![Figura 15 – Formulário de resposta, aberto por Ações > Responder complementação.](img/19-solicitante-responder.png)

*Figura 15 – Formulário de resposta, aberto por Ações > Responder complementação.*

### HS-06. Cancelar a solicitação

> **Como** solicitante, **quero** desistir da solicitação, **para** encerrar uma validação que não é mais necessária.

**Vale enquanto a solicitação estiver em andamento:** Submetido, Em análise, Em complementação ou Aguardando gestor.

**Passo a passo**

1. Abrir a solicitação (HS-03).
2. Clicar em **Ações** > **Cancelar solicitação**.
3. Escrever a **Justificativa** (obrigatória, até 1.000 caracteres: espaço suficiente para explicar o motivo, que fica visível para todos na solicitação e na aba Cancelado).
4. Clicar em **Cancelar solicitação** para confirmar. Para desistir, clicar em **Voltar** (nada muda).

**O que acontece**

- O status vira **Cancelado** e a solicitação sai de Em andamento e passa para a aba **Cancelado**.
- A página mostra a mensagem “Solicitação cancelada.” e o quadro “Solicitação cancelada pelo solicitante”, com nome, data e justificativa. A justificativa fica visível para todos.
- O histórico registra um único registro: “Solicitação cancelada pelo solicitante.”, com a justificativa.

**O sistema não deixa**

- Cancelar sem justificativa: aparece “Informe o motivo do cancelamento.”
- Desfazer o cancelamento.

![Figura 16 – Passo 2: Ações > Cancelar solicitação.](img/16a-solicitante-acoes-cancelar.png)

*Figura 16 – Passo 2: Ações > Cancelar solicitação.*

![Figura 17 – Passo 3: formulário Cancelar solicitação, com a justificativa preenchida.](img/16-cancelar-solicitacao.png)

*Figura 17 – Passo 3: formulário Cancelar solicitação, com a justificativa preenchida.*

![Figura 18 – Depois de confirmar: a solicitação fica Cancelado, com o quadro da justificativa.](img/16b-solicitante-cancelada.png)

*Figura 18 – Depois de confirmar: a solicitação fica Cancelado, com o quadro da justificativa.*

### HS-07. Consultar os modelos inventariados e as solicitações canceladas

> **Como** solicitante, **quero** consultar os modelos da minha área que foram validados e as solicitações que foram canceladas, **para** saber o resultado de cada uma e, se foi cancelada, o motivo.

**Hoje × como deve ficar — aba Inventariado**

A aba Inventariado do solicitante é **a mesma aba Inventariado da GEVAM, com o mesmo nome**. A diferença é que o solicitante vê **só os modelos da área dele** e **só para leitura**.

![Figura 19 – Hoje: aba Inventariado (o solicitante também passa a ter esta aba).](img/00-hoje-inventariado-marcado.png)

*Figura 19 – Hoje: aba Inventariado (o solicitante também passa a ter esta aba).*

O que muda em relação à tela de hoje:

1. **Quem vê:** o solicitante **passa a ter** esta aba, com o mesmo nome, só com a área dele e só leitura.
2. **Quadros do topo:** os 7 quadros viram 3. “Total de inventariados” vira **“Modelos inventariados”**; **saem** “Total de validados” e “Total de não validados” (tudo o que está aqui foi validado); “Total de monitorados” vira o quadro **“Monitoramento 2ª Linha (GEVAM)”** (Monitorados e Não monitorados); os três totais de situação viram o quadro **“Situação do modelo”** (Ativos, Inativos e Suspensos).
3. **Filtros:** **saem** “Status” e “Data da submissão”; **entram** “Monitoramento 2ª Linha (GEVAM)” e “Situação do modelo”.
4. **Colunas que saem:** Área gestora, Público, Tier e Resultado da validação.
5. **Colunas que mudam:** Número da solicitação e Nome do modelo viram uma coluna só, **“Modelo”** (nome e nº do inventário); “Monitoramento” vira **“Monitoramento 2ª Linha (GEVAM)”** e deixa de existir “Não se aplica”.
6. **Coluna que entra:** “Validado em”.

**Aba Inventariado — passo a passo**

1. Em **Consultar modelo**, clicar na aba **Inventariado**.
2. Acima da lista aparece “Exibindo modelos inventariados da área [área]”.
3. No topo há três quadros informativos (não são clicáveis), que contam **só os modelos da área dele**:
   1. **Modelos inventariados** (total);
   2. **Monitoramento 2ª Linha (GEVAM)**: Monitorados e Não monitorados;
   3. **Situação do modelo**: Ativos, Inativos e Suspensos.
4. Filtros: Nº da solicitação ou do inventário · Área gestora (fixa) · Nome do modelo · Assunto · Analista responsável · Monitoramento 2ª Linha (GEVAM) · Situação do modelo. Clicar em **Pesquisar** ou **Limpar**.
5. Colunas: Modelo (nome e nº do inventário) · Tipo de modelo · Assunto · Monitoramento 2ª Linha (GEVAM) · Situação · Analista · Validado em · Ação.
6. Clicar no **ícone de olho** abre a **página do modelo**, só para leitura: informações do modelo, Informações Adicionais, Informações do Modelo, histórico e arquivos.

**Como deve ficar — aba Inventariado**

![Figura 20 – Aba Inventariado do solicitante: quadros e lista só com os modelos da área dele.](img/28-solicitante-validado.png)

*Figura 20 – Aba Inventariado do solicitante: quadros e lista só com os modelos da área dele.*

![Figura 21 – Página do modelo validado, vista pelo solicitante (só leitura, sem botões de ação).](img/34-solicitante-modelo.png)

*Figura 21 – Página do modelo validado, vista pelo solicitante (só leitura, sem botões de ação).*

**Hoje × como deve ficar — aba Cancelado**

![Figura 22 – Hoje: aba Cancelado.](img/00-hoje-cancelado-marcado.png)

*Figura 22 – Hoje: aba Cancelado.*

O que muda em relação à tela de hoje:

1. **Sai** a coluna Área gestora (para o solicitante seria sempre a área dele).
2. “Analista responsável pelo cancelamento” passa a se chamar **“Analista responsável”**.
3. **Entra** a coluna **“Cancelada por”** (Analista, Gestor GEVAM ou Solicitante).
4. O botão **Abrir** leva a uma página própria da solicitação cancelada.

**Aba Cancelado — passo a passo**

1. Em **Consultar modelo**, clicar na aba **Cancelado**.
2. Aparece só o que foi cancelado **na área dele** (“Exibindo solicitações canceladas da área [área]”). O filtro Área gestora fica fixo.
3. A lista mostra quem cancelou (coluna **Cancelada por**: Analista, Gestor GEVAM ou Solicitante) e a justificativa.
4. Clicar em **Abrir** mostra a página da solicitação cancelada, com o quadro “Solicitação cancelada pelo …” (quem, quando e justificativa), as informações, o histórico e os arquivos.

**Como deve ficar — aba Cancelado**

![Figura 23 – Aba Cancelado: só as canceladas da área do solicitante, com quem cancelou e a justificativa.](img/29-solicitante-cancelado.png)

*Figura 23 – Aba Cancelado: só as canceladas da área do solicitante, com quem cancelou e a justificativa.*

![Figura 24 – Página de uma solicitação cancelada, vista pelo solicitante.](img/35-solicitante-cancelada-pagina.png)

*Figura 24 – Página de uma solicitação cancelada, vista pelo solicitante.*

**Tudo na aba Inventariado e na aba Cancelado é só leitura para o solicitante:** não há botão Ações nem botões de edição nas páginas abertas por elas.

## 3. Tabelas de resumo

### 3.1. O que o solicitante pode fazer em cada status

Legenda: ✅ disponível · 🚫 não aparece · — não se aplica.

| Ação | Submetido | Em análise | Em complementação | Aguardando gestor | Validado | Cancelado |
| --- | --- | --- | --- | --- | --- | --- |
| Abrir a solicitação (status, histórico e arquivos) | ✅ | ✅ | ✅ | ✅ | ✅ pela aba Inventariado (página do modelo) | ✅ pela aba Cancelado |
| Editar solicitação (Ações) | ✅ | 🚫 | 🚫 | 🚫 | — | — |
| Responder complementação (Ações) | — | — | ✅ | — | — | — |
| Cancelar solicitação (Ações) | ✅ | ✅ | ✅ | ✅ | — | — |

### 3.2. Menu Ações do solicitante

O botão **Ações** fica no canto superior direito da página da solicitação. Só aparecem os itens que o solicitante pode usar naquele status. Em solicitações Validado ou Cancelado ele não tem o botão Ações.

| Item do menu | Aparece quando | O que faz |
| --- | --- | --- |
| Editar solicitação | **Só em Submetido** (nos outros status o item não aparece) | Abre o formulário de edição (HS-04) |
| Responder complementação | **Só em Em complementação** | Abre o formulário de resposta (HS-05) |
| Cancelar solicitação | Submetido, Em análise, Em complementação ou Aguardando gestor | Pede a justificativa e cancela (HS-06) |

### 3.3. Botões que o solicitante vê

| Botão | Onde | O que faz |
| --- | --- | --- |
| Enviar | Novo modelo, fim do formulário | Confere os campos e cria a solicitação com status Submetido (HS-01) |
| Fechar | Janela “Solicitação enviada com sucesso.” | Fecha a janela |
| Pesquisar / Limpar | Barra de filtros das abas | Aplica os filtros / volta todos para o padrão |
| Abrir | Cada linha de Em andamento e Cancelado (é o único botão da linha) | Abre a página da solicitação (HS-03) |
| Ícone de olho | Cada linha da aba Inventariado | Abre a página do modelo (HS-07) |
| Ações | Canto superior direito da página da solicitação | Abre o menu da tabela 3.2 |
| Salvar alterações / Cancelar | Formulário Editar solicitação | Grava a edição / fecha sem gravar (HS-04) |
| Enviar complementação / Cancelar | Formulário de resposta (Ações > Responder complementação) | Envia o anexo e a observação e volta para Em análise / fecha sem enviar (HS-05) |
| Cancelar solicitação / Voltar | Formulário Cancelar solicitação | Confirma o cancelamento / desiste sem cancelar (HS-06) |
| Consultar modelos (no caminho do topo) | Página da solicitação ou do modelo | Volta para a lista |

### 3.4. Mensagens que o solicitante pode ver

| Quando | Mensagem |
| --- | --- |
| Enviar ou salvar com campo vazio | Campo obrigatório |
| Enviar sem o relatório | Anexe o relatório de desenvolvimento do modelo. |
| Relatório que não é PDF (no envio ou na edição) | O relatório deve ser um arquivo PDF. |
| Envio concluído | Solicitação enviada com sucesso. (com o número da solicitação) |
| Enviar complementação sem anexo | Anexe o documento solicitado pelo analista para enviar a complementação. |
| Cancelar sem justificativa | Informe o motivo do cancelamento. |
| Há complementação pendente (topo de Em andamento) | Existe(m) N solicitação(ões) que exige(m) complementação · É preciso que o solicitante envie a complementação para dar continuidade à análise do especialista. Abra a solicitação e use Ações > Responder complementação. |

### 3.5. De-para dos status (dados que já existem no sistema)

| Antes | Agora |
| --- | --- |
| Status “Finalizada e no inventário” | **Validado** |
| Status “Validada” | **Validado** |
| Resultado da validação “Não validado” | **Cancelado** |
| Status “Cancelada” | **Cancelado** |
| Submetido, Em análise, Em complementação | Sem mudança |
| Aguardando gestor | Sem mudança no sistema; o solicitante **passa a ver “Aguardando gestor”** (antes via “Em análise”) |
