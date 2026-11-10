# Fluxos da solicitação de validação independente

Fluxos do processo 15.11.02 no SVM, em [Mermaid](https://mermaid.js.org/). Renderizam direto no GitHub e no
preview de Markdown do VS Code (com a extensão *Markdown Preview Mermaid Support*). Para exportar PNG/SVG, cole
o bloco em [mermaid.live](https://mermaid.live).

**Cores dos status** (as mesmas do sistema): azul = Submetido e Aguardando gestor · âmbar = Em análise e
Em complementação · verde = finalizada · cinza = Cancelada.

**Nos fluxos por perfil:** seta **grossa** (`==>`) = ação daquele perfil · seta fina (`-->`) = ação de outro
perfil · seta pontilhada (`-.->`) = cancelamento feito por outro perfil.

**Losango "Precisa de complementação?"**: a análise segue **ou** para Em complementação **ou** para o gestor,
nunca as duas coisas. Só vai ao gestor quando não há mais pendências (todas as complementações atendidas).

## Transições de status (para implementação)

Toda transição grava um evento no histórico da solicitação (data, autor, descrição e anexos).

| Status atual | Ação | Quem pode | Próximo status | Obrigatório / observações |
|---|---|---|---|---|
| — | Enviar solicitação | Solicitante | **Submetido** | Dados do modelo e relatório de desenvolvimento (anexo) obrigatórios |
| Submetido | Alterar dados | Solicitante | Submetido | Só enquanto nenhum analista assumiu |
| Submetido | Abrir a solicitação (auto-atribuição) | Analista | **Em análise** | Analista vira o responsável; grava data/hora da atribuição |
| Submetido | Atribuir a um analista | Gestor | **Em análise** | Idem; registra o gestor |
| Em análise / Em complementação / Aguardando gestor | Reatribuir analista | Gestor | (não muda) | Atualiza analista responsável e data da atribuição |
| Em análise | Atualizar solicitação | Analista responsável | Em análise | Descrição obrigatória, anexo opcional. Na avaliação preliminar, marcar "TAP sem pendências" (anexo do TAP obrigatório) emite o TAP e libera as abas de análise |
| Em análise | Pedir complementação | Analista responsável | **Em complementação** | Anexo obrigatório, observação opcional. Sem prazo e sem limite de rodadas. Na avaliação preliminar, o anexo é o **TAP com pendências**: ele é gravado como o TAP da solicitação (único) e libera as abas de análise. Durante a análise, é um pedido comum de esclarecimentos |
| Em complementação | Enviar complementação | Solicitante | **Em análise** | Anexo obrigatório, observação opcional. Volta direto para o mesmo analista |
| Em análise | Enviar ao gestor | Analista responsável | **Aguardando gestor** | Só sem pendências: TAP emitido + Cálculo do Tier + Matriz de Risco + Informações do Modelo preenchidos. Sem anexo: é só o pedido de aval (o gestor lê os documentos já em Arquivos). Grava data/hora de finalização da análise |
| Aguardando gestor | Finalizar validação | Gestor | **Validada** | Informar Inventariar (Sim/Não) e Monitorar (Sim/Não). Inventariar = Sim cria o registro no inventário |
| Qualquer status em andamento | Cancelar | Analista responsável, gestor ou solicitante | **Cancelada** | Justificativa obrigatória, visível para todos; registrar quem cancelou (perfil + nome) |

Regras de visibilidade:

- O solicitante vê **Aguardando gestor** como **Em análise**.
- O solicitante vê todos os documentos (dele, do analista e do gestor) e é notificado a cada mudança de status.
- Validada e Cancelada são status finais: saem da lista Em andamento e não aceitam mais ações sobre o fluxo.

## Fluxo geral (status da solicitação)

Cada caixa é um **status**; cada seta é a **ação** que muda o status, com **quem faz em maiúsculas**
(SOLICITANTE, ANALISTA, GESTOR). O ponto de decisão depois de "Em análise" deixa claro que o analista
**ou** pede complementação **ou** envia ao gestor: enquanto houver pendência, não pode enviar.

```mermaid
stateDiagram-v2
    direction TB

    state "Submetido" as SUB
    state "Em análise" as ANA
    state "Em complementação" as COMP
    state "Aguardando gestor" as GES
    state "Validada · no inventário" as INV
    state "Validada · fora do inventário" as VAL
    state "Cancelada" as CAN
    state pendencias <<choice>>
    state inventariar <<choice>>

    [*] --> SUB : SOLICITANTE envia a solicitação
    SUB --> ANA : ANALISTA assume ou GESTOR atribui
    ANA --> pendencias : ANALISTA avalia a solicitação
    pendencias --> COMP : Com pendências → ANALISTA pede complementação
    pendencias --> GES : Sem pendências → ANALISTA envia ao gestor
    COMP --> ANA : SOLICITANTE envia a complementação
    GES --> inventariar : GESTOR finaliza a validação
    inventariar --> INV : Inventariar = Sim
    inventariar --> VAL : Inventariar = Não

    SUB --> CAN : Cancelar
    ANA --> CAN : Cancelar
    COMP --> CAN : Cancelar
    GES --> CAN : Cancelar

    INV --> [*]
    VAL --> [*]
    CAN --> [*]

    note right of ANA
        ANALISTA preenche, em ordem:
        1. TAP (avaliação preliminar)
        2. Cálculo do Tier
        3. Matriz de Risco
        4. Informações do Modelo
    end note

    note right of pendencias
        Um caminho OU o outro:
        enquanto houver pendência,
        não pode enviar ao gestor.
    end note

    note right of GES
        O SOLICITANTE vê este
        status como "Em análise".
    end note

    note left of CAN
        ANALISTA responsável, GESTOR
        ou SOLICITANTE, a qualquer
        momento, com justificativa.
    end note

    classDef azul fill:#eaf1f8,stroke:#1f6cb0,stroke-width:2px,color:#1f6cb0
    classDef ambar fill:#faf3e4,stroke:#b4801d,stroke-width:2px,color:#8a6113
    classDef verde fill:#edf4ec,stroke:#3d7f39,stroke-width:2px,color:#3d7f39
    classDef cinza fill:#f2f2f2,stroke:#8a8a8a,stroke-width:2px,color:#4d4d4d
    class SUB, GES azul
    class ANA, COMP ambar
    class INV, VAL verde
    class CAN cinza
```

Correspondência com o BPMN 15.11.02 ("Realizar Validação Independente"):

| Tarefa do BPMN | Status no sistema |
|---|---|
| Solicitar validação independente | Submetido |
| Receber informações · Avaliar preliminarmente · Emitir TAP | Em análise (avaliação preliminar) |
| Realizar análise · Consolidar resultados | Em análise (abas Cálculo do Tier, Matriz de Risco, Informações do Modelo) |
| Prestar esclarecimentos ou informações (área gestora) | Em complementação — pedida tanto por pendências documentais (após o TAP) quanto por esclarecimentos na análise |
| Solicitação atendida? = Não | Analista pede de novo (continua Em complementação) ou cancela → Cancelada |
| Emitir Parecer · Emitir Relatório de Validação | Documentos que o analista anexa à solicitação durante a análise (Atualizar solicitação). O envio ao gestor é só o pedido de aval, sem anexo → Aguardando gestor |
| (não existe no BPMN) Aval do gestor | Aguardando gestor → Validada |
| Validação independente concluída | Validada (com ou sem inventário) |
| Cancelamento da solicitação | Cancelada |

Regras que não aparecem no desenho:

- **Monitorar** (Sim/Não) é decidido junto com o inventário e **não muda o status**.
- Resultado desfavorável da validação = a solicitação é **cancelada** (não existe status "reprovado").
- A revisão do gestor acontece por e-mail, fora do sistema; no sistema ele só tem **Finalizar validação**.

## Solicitante

```mermaid
flowchart TB
    INI(("Início")) ==>|"Envia a solicitação"| SUB["<b>Submetido</b><br/>Aguardando um analista"]
    SUB ==>|"Altera os dados"| SUB
    SUB -->|"Analista assume<br/>ou gestor atribui"| ANA["<b>Em análise</b><br/>Com a GEVAM<br/>(também enquanto<br/>aguarda o gestor)"]
    ANA --> Q{"Analista precisa de<br/>complementação?"}
    Q -->|"Sim"| COMP["<b>Em complementação</b><br/>Ver o pedido e o anexo"]
    COMP ==>|"Envia a complementação<br/>e volta para análise"| ANA
    Q -->|"Não: GEVAM conclui<br/>a validação"| VAL["<b>Validada</b><br/>Com ou sem inventário"]

    SUB ==> CAN
    ANA ==> CAN
    COMP ==>|"Cancela a qualquer<br/>momento, com justificativa"| CAN["<b>Cancelada</b><br/>Também pode ser cancelada<br/>pelo analista ou pelo gestor"]

    class SUB azul
    class ANA,COMP ambar
    class VAL verde
    class CAN cinza
    class Q decisao
    classDef azul fill:#eaf1f8,stroke:#1f6cb0,stroke-width:2px,color:#1f6cb0
    classDef ambar fill:#faf3e4,stroke:#b4801d,stroke-width:2px,color:#8a6113
    classDef verde fill:#edf4ec,stroke:#3d7f39,stroke-width:2px,color:#3d7f39
    classDef cinza fill:#f2f2f2,stroke:#8a8a8a,stroke-width:2px,color:#4d4d4d
    classDef decisao fill:#ffffff,stroke:#4d4d4d,stroke-width:2px,color:#4d4d4d
```

Em todos os status o solicitante vê todos os documentos (dele, do analista e do gestor) e é notificado quando o
status muda.

## Analista GEVAM

```mermaid
flowchart TB
    SUB["<b>Submetido</b><br/>Fila de novas submissões"] ==>|"Abre e assume<br/>(ou gestor atribui)"| ANALISE

    subgraph ANALISE["Em análise"]
        direction TB
        T1["1. Avaliação preliminar e TAP<br/>(Atualizar solicitação)"] --> T2["2. Cálculo do Tier"] --> T3["3. Matriz de Risco"] --> T4["4. Informações do Modelo"]
    end

    ANALISE --> Q{"Pendências ou<br/>dúvidas?"}
    Q ==>|"Sim: pede<br/>complementação"| COMP["<b>Em complementação</b><br/>Aguardando o solicitante"]
    COMP -->|"Solicitante responde<br/>e volta para análise"| ANALISE
    Q ==>|"Não: tudo atendido,<br/>envia ao gestor (pede o aval)"| GES["<b>Aguardando gestor</b><br/>Revisão do gestor por<br/>e-mail, fora do sistema"]
    GES -->|"Gestor finaliza"| DEC{"Inventariar?"}
    DEC -->|"Sim"| INV["<b>Finalizada · no inventário</b><br/>Pode incluir documentos<br/>no histórico"]
    DEC -->|"Não"| VAL["<b>Validada</b><br/>Fora do inventário"]

    SUB ==> CAN
    COMP ==> CAN
    ANALISE ==>|"Cancela (se responsável),<br/>com justificativa"| CAN["<b>Cancelada</b><br/>Inclui resultado<br/>desfavorável"]
    GES -.->|"Gestor ou solicitante<br/>também cancelam"| CAN

    class SUB,GES azul
    class COMP,T1,T2,T3,T4 ambar
    class INV,VAL verde
    class CAN cinza
    class Q,DEC decisao
    style ANALISE fill:#fdf9f0,stroke:#b4801d,stroke-width:2px,color:#8a6113
    classDef azul fill:#eaf1f8,stroke:#1f6cb0,stroke-width:2px,color:#1f6cb0
    classDef ambar fill:#faf3e4,stroke:#b4801d,stroke-width:2px,color:#8a6113
    classDef verde fill:#edf4ec,stroke:#3d7f39,stroke-width:2px,color:#3d7f39
    classDef cinza fill:#f2f2f2,stroke:#8a8a8a,stroke-width:2px,color:#4d4d4d
    classDef decisao fill:#ffffff,stroke:#4d4d4d,stroke-width:2px,color:#4d4d4d
```

**Atualizar solicitação** (registrar documentos recebidos por outros meios) pode ser usado durante toda a análise.
O envio ao gestor exige Cálculo do Tier, Matriz de Risco e Informações do Modelo preenchidos.

## Gestor GEVAM

```mermaid
flowchart TB
    SUB["<b>Submetido</b><br/>Nova submissão,<br/>sem analista"] ==>|"Atribui a um analista<br/>(ou o analista assume)"| ANA["<b>Em análise</b><br/>Com o analista responsável"]
    ANA ==>|"Reatribui"| ANA
    ANA --> Q{"Analista precisa de<br/>complementação?"}
    Q -->|"Sim"| COMP["<b>Em complementação</b><br/>Aguardando o solicitante"]
    COMP -->|"Solicitante responde<br/>e volta para análise"| ANA
    Q -->|"Não: analista pede<br/>o aval"| GES["<b>Aguardando gestor</b><br/>Lê os documentos e confere<br/>Tier, Matriz e Info. do Modelo"]
    GES ==>|"Finalizar<br/>validação"| DEC{"Inventariar?<br/>Monitorar?"}
    DEC ==>|"Sim"| INV["<b>Finalizada · no inventário</b><br/>Status Validada"]
    DEC ==>|"Não"| VAL["<b>Validada</b><br/>Fora do inventário"]
    INV ==>|"Altera a situação<br/>(Ativo, Inativo, Suspenso)"| INV

    SUB ==> CAN
    ANA ==> CAN
    COMP ==> CAN
    GES ==>|"Cancela a qualquer<br/>momento, com justificativa"| CAN["<b>Cancelada</b><br/>Justificativa visível<br/>para todos"]

    class SUB,GES azul
    class ANA,COMP ambar
    class INV,VAL verde
    class CAN cinza
    class Q,DEC decisao
    classDef azul fill:#eaf1f8,stroke:#1f6cb0,stroke-width:2px,color:#1f6cb0
    classDef ambar fill:#faf3e4,stroke:#b4801d,stroke-width:2px,color:#8a6113
    classDef verde fill:#edf4ec,stroke:#3d7f39,stroke-width:2px,color:#3d7f39
    classDef cinza fill:#f2f2f2,stroke:#8a8a8a,stroke-width:2px,color:#4d4d4d
    classDef decisao fill:#ffffff,stroke:#4d4d4d,stroke-width:2px,color:#4d4d4d
```
