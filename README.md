# SVM — Sistema de Validação de Modelos

MVP de frontend desenvolvido como **protótipo de referência para a reestruturação de um sistema corporativo existente de validação e inventário de modelos de Machine Learning**.

O objetivo deste projeto não é substituir ou implementar o sistema utilizado atualmente, mas **materializar uma proposta de reorganização da experiência do usuário, navegação e fluxos do sistema**, facilitando a comunicação da proposta com a equipe responsável pela evolução do módulo corporativo.

> 🚧 Protótipo / MVP de referência — não destinado à produção.

---

##  Contexto

O processo de validação e inventário de modelos já é realizado por meio de um sistema corporativo existente.

Entretanto, devido à necessidade de uma **reestruturação significativa da interface e dos fluxos**, surgiu a necessidade de transformar as ideias de melhoria em algo concreto e navegável.

Este MVP foi criado para demonstrar, de forma visual e interativa:

- como a navegação poderia ser reorganizada;
- como os diferentes perfis poderiam interagir com o sistema;
- como os fluxos de submissão e inventário poderiam ser estruturados;
- como as consultas e acompanhamentos poderiam ser apresentados;
- como as informações poderiam ser organizadas de forma mais clara;
- como diferentes permissões e responsabilidades poderiam refletir na interface.

A implementação final será realizada posteriormente **dentro do próprio módulo corporativo existente**, pela equipe responsável pelo sistema.

---

##  Objetivo do MVP

O objetivo principal é **comunicar uma proposta de reestruturação por meio de um protótipo funcional**, permitindo que as pessoas envolvidas visualizem e experimentem a ideia antes de sua implementação no sistema oficial.

Em vez de apresentar apenas requisitos ou desenhos estáticos, o MVP permite demonstrar:

> **"É assim que estou imaginando que o sistema poderia funcionar."**

O protótipo funciona, portanto, como uma ferramenta de **comunicação, alinhamento e validação da proposta**.

---
## Desenvolvimento assistido por IA

O protótipo foi desenvolvido com o apoio do **Claude Code**, utilizado como ferramenta de desenvolvimento assistido por IA para acelerar a implementação, iteração e refinamento do frontend.

A **definição do problema, proposta de reestruturação, requisitos, fluxos de usuário, arquitetura de navegação e decisões de produto** foram conduzidas durante o processo de desenvolvimento.

O uso de IA neste projeto teve como objetivo acelerar a transformação das especificações e ideias de produto em um protótipo funcional e navegável.


---

## Perfis representados

O MVP simula três perfis de usuário:

### Solicitante

Responsável pela submissão de novos modelos e pelo acompanhamento de suas solicitações.

### Analista GEVAM

Responsável por atividades relacionadas à análise, complementação e inventário dos modelos.

### Gestor GEVAM

Responsável pela gestão dos processos e pelo acesso às funcionalidades administrativas e de parametrização.

A seleção de perfil no protótipo é apenas uma **simulação para demonstrar diferentes experiências de usuário**.

Não existe autenticação ou autorização real.

---

## Estrutura proposta

A navegação principal foi reorganizada em três grandes áreas:

```text
SVM
│
├── NOVO MODELO
│   ├── SUBMETER
│   └── INVENTARIAR
│
├── CONSULTAR MODELO
│   ├── EM ANDAMENTO
│   ├── INVENTARIADO
│   └── CANCELADO
│
└── GESTÃO
    └── PARAMETRIZAÇÃO
        ├── PARÂMETROS GERAIS
        ├── MATRIZ DE RISCOS
        ├── EXPR. SCORE TIER
        └── EXPR. SCORE MONITORAMENTO
