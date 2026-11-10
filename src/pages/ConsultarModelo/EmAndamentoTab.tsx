import { useMemo, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { useSolicitacoes } from "../../context/SolicitacoesContext";
import { currentSolicitante, currentUserNameByProfile } from "../../data/currentUser";
import {
  analistaFilterOptions,
  areaGestoraFilterOptions,
  assuntoFilterOptions,
} from "../../data/filterOptions";
import { FilterTextField } from "../../components/ui/FilterTextField";
import { FilterSelectField } from "../../components/ui/FilterSelectField";
import { FilterBar } from "../../components/ui/FilterBar";
import { ReadOnlyField } from "../../components/ui/ReadOnlyField";
import { StatCard } from "../../components/ui/StatCard";
import { Table, type TableColumn } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/Badge";
import { InlineAlert } from "../../components/ui/ErrorState";
import { Toast } from "../../components/ui/Toast";
import { Button } from "../../components/ui/Button";
import { SOLICITACAO_ACTIONS, type SolicitacaoAction } from "../../components/ui/RowActions";
import { ActionMenu, type ActionMenuItem } from "../../components/ui/ActionMenu";
import type { Profile, Solicitacao, SolicitacaoStatus } from "../../types";

import { pendenciasParaGestor } from "../../components/modelo/dadosModelo";
import { type AcaoSolicitacao } from "./SolicitacaoDetalhePage";
import {
  analistaPodeAgir,
  analistaPodeCancelar,
  emAvaliacaoPreliminar,
  gestorPodeCancelar,
  gestorPodeAtribuir,
  solicitantePodeAlterar,
  solicitantePodeCancelar,
  statusParaPerfil,
} from "./fluxo";

const ANALISTA = currentUserNameByProfile.analista;

/**
 * Itens do menu "Ações" de cada linha. "Visualizar" não entra: é o botão "Abrir".
 * Para o analista, as ações seguem o fluxo: avaliação preliminar (atualizar, complementar
 * ou cancelar) e depois análise (complementar ou enviar ao gestor).
 */
function menuItems(row: Solicitacao, profile: Profile): ActionMenuItem[] {
  const item = (key: SolicitacaoAction, extra?: Partial<ActionMenuItem>): ActionMenuItem => ({
    key,
    label: SOLICITACAO_ACTIONS[key].label,
    icon: SOLICITACAO_ACTIONS[key].icon,
    danger: SOLICITACAO_ACTIONS[key].danger,
    ...extra,
  });
  const alterar = item("alterar", {
    description: "Corrija os dados enquanto nenhum analista assumiu.",
    disabled: profile !== "solicitante" || !solicitantePodeAlterar(row),
    disabledReason:
      profile !== "solicitante"
        ? "Só o solicitante edita a solicitação."
        : "Só é possível editar enquanto nenhum analista assumiu (status Submetido).",
  });
  const atribuir = item("atribuir-analista", {
    description: row.status === "Submetido" ? "Passa para Em análise com o analista escolhido." : `Hoje com ${row.analistaResponsavel}.`,
    disabled: profile !== "gestor" || !gestorPodeAtribuir(row),
    disabledReason:
      profile === "analista" ? "Ao abrir uma solicitação Submetido, ela é atribuída a você." : "Só o gestor atribui.",
  });
  const comuns = [alterar, atribuir, item("alterar-solicitante")];

  // Solicitante: só Editar e Cancelar no menu (Abrir é o botão ao lado).
  if (profile === "solicitante") {
    return [
      { ...alterar, label: "Editar solicitação" },
      item("cancelar", {
        separated: true,
        description: "Desista da solicitação. Informe o motivo.",
        disabled: !solicitantePodeCancelar(row),
      }),
    ];
  }

  if (profile === "analista") {
    const pode = analistaPodeAgir(row, ANALISTA);
    const preliminar = emAvaliacaoPreliminar(row);
    const motivo =
      row.status === "Em complementação"
        ? "Aguardando o solicitante."
        : row.status === "Aguardando gestor"
          ? "Aguardando decisão do gestor."
          : row.status === "Em análise"
            ? `Em análise com ${row.analistaResponsavel}.`
            : "Indisponível neste status.";
    return [
      item("atualizar-solicitacao", {
        description: preliminar
          ? "Relatório ok: registre o TAP sem pendências e libere a análise."
          : "Registre documentos ou informações recebidos por outros meios.",
        disabled: !pode,
        disabledReason: motivo,
      }),
      item("solicitar-complementacao", {
        description: preliminar
          ? "Relatório com pendências: envie o TAP com as pendências ao solicitante."
          : "Peça um documento ou informação ao solicitante.",
        disabled: !pode,
        disabledReason: motivo,
      }),
      item("enviar-gestor", {
        description: pendenciasParaGestor(row).length
          ? `Antes, preencha ${pendenciasParaGestor(row).join(", ")}.`
          : "Peça o aval do gestor para finalizar a validação.",
        disabled: !pode || preliminar,
        disabledReason: !pode ? motivo : "Antes, emita o TAP (avaliação preliminar).",
      }),
      { ...comuns[0], separated: true },
      ...comuns.slice(1),
      item("cancelar", {
        separated: true,
        description: "Encerra a solicitação. A justificativa fica visível para todos.",
        disabled: !analistaPodeCancelar(row, ANALISTA),
        disabledReason: `Só o analista responsável (${row.analistaResponsavel}), o gestor ou o solicitante cancelam.`,
      }),
    ];
  }

  // gestor
  const comGestor = row.status === "Aguardando gestor";
  const motivoGestor = "Disponível quando o analista enviar para o gestor.";
  return [
    item("validar", {
      description: "Dá o aval à validação do analista e finaliza (status Validada).",
      disabled: !comGestor,
      disabledReason: motivoGestor,
    }),
    { ...comuns[0], separated: true },
    ...comuns.slice(1),
    item("cancelar", {
      separated: true,
      description: "Encerra a solicitação. Informe o motivo.",
      disabled: !gestorPodeCancelar(row),
    }),
  ];
}

interface Filters {
  numero: string;
  areaGestora: string;
  nomeModelo: string;
  assunto: string;
  analista: string;
}

const DEFAULT_FILTERS: Filters = {
  numero: "",
  areaGestora: "Todas",
  nomeModelo: "",
  assunto: "Todos",
  analista: "Todos",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function matches(solicitacao: Solicitacao, filters: Filters) {
  if (
    filters.numero &&
    !solicitacao.numero.toLowerCase().includes(filters.numero.toLowerCase())
  )
    return false;
  if (filters.areaGestora !== "Todas" && solicitacao.areaGestora !== filters.areaGestora)
    return false;
  if (
    filters.nomeModelo &&
    !solicitacao.nomeModelo
      .toLowerCase()
      .includes(filters.nomeModelo.toLowerCase())
  )
    return false;
  if (filters.assunto !== "Todos" && solicitacao.assunto !== filters.assunto)
    return false;
  if (
    filters.analista !== "Todos" &&
    solicitacao.analistaResponsavel !== filters.analista
  )
    return false;
  return true;
}

interface EmAndamentoTabProps {
  /** Abre a página da solicitação. `pedir` já abre o formulário de pedido de complementação. */
  onAbrir: (numero: string, acao?: AcaoSolicitacao) => void;
}

export function EmAndamentoTab({ onAbrir }: EmAndamentoTabProps) {
  const { profile } = useProfile();
  const isSolicitante = profile === "solicitante";
  const showCards = !isSolicitante;

  const { solicitacoes: todas } = useSolicitacoes();
  // Validadas e canceladas estão finalizadas: saem de Em andamento.
  const solicitacoes = useMemo(
    () => todas.filter((s) => s.status !== "Validada" && s.status !== "Cancelada"),
    [todas],
  );

  const visibleSolicitacoes = useMemo(() => {
    if (!isSolicitante) return solicitacoes;
    return solicitacoes.filter(
      (s) => s.areaGestora === currentSolicitante.areaGestora,
    );
  }, [isSolicitante, solicitacoes]);

  const pendentesComplementacao = isSolicitante
    ? visibleSolicitacoes.filter((s) => s.status === "Em complementação")
    : [];

  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [statusFilter, setStatusFilter] = useState<SolicitacaoStatus | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      Submetido: solicitacoes.filter((s) => s.status === "Submetido")
        .length,
      "Em análise": solicitacoes.filter((s) => s.status === "Em análise")
        .length,
      "Em complementação": solicitacoes.filter(
        (s) => s.status === "Em complementação",
      ).length,
      "Aguardando gestor": solicitacoes.filter((s) => s.status === "Aguardando gestor").length,
    };
  }, [solicitacoes]);

  const filtered = useMemo(() => {
    return visibleSolicitacoes.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      return matches(s, applied);
    });
  }, [visibleSolicitacoes, applied, statusFilter]);

  function toggleStatusFilter(status: SolicitacaoStatus) {
    setStatusFilter((current) => (current === status ? null : status));
  }

  function handleSearch() {
    setApplied(draft);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setStatusFilter(null);
  }

  function handleRowAction(action: SolicitacaoAction, row: Solicitacao) {
    if (action === "visualizar") {
      onAbrir(row.numero);
      return;
    }
    const atalhos: Partial<Record<SolicitacaoAction, AcaoSolicitacao>> = {
      "solicitar-complementacao": "pedir",
      "atualizar-solicitacao": "atualizar",
      cancelar: "cancelar",
      "enviar-gestor": "enviar-gestor",
      validar: "validar",
      alterar: "alterar",
      "atribuir-analista": "atribuir",
    };
    if (atalhos[action]) {
      onAbrir(row.numero, atalhos[action]);
      return;
    }
    setToast(`${SOLICITACAO_ACTIONS[action].label} (${row.numero}): funcionalidade ainda não implementada.`);
  }

  const columns: TableColumn<Solicitacao>[] = [
    { header: "Nº da solicitação", render: (row) => row.numero },
    { header: "Nome do modelo", render: (row) => row.nomeModelo },
    { header: "Área gestora", render: (row) => row.areaGestora },
    { header: "Assunto", render: (row) => row.assunto },
    { header: "Solicitante", render: (row) => row.solicitante },
    { header: "Data da submissão", render: (row) => formatDate(row.dataSubmissao) },
    {
      header: "Analista responsável",
      render: (row) => row.analistaResponsavel,
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={statusParaPerfil(row.status, profile)} />,
    },
    {
      header: "Ação",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {isSolicitante && row.status === "Em complementação" && (
            <Button variant="primary" icon="upload" onClick={() => onAbrir(row.numero)} className="h-[34px] whitespace-nowrap px-3">
              Complementar
            </Button>
          )}
          <Button variant="secondary" icon="eye" onClick={() => onAbrir(row.numero)} className="h-[34px] px-3">
            Abrir
          </Button>
          <ActionMenu
            ariaLabel={`Ações da solicitação ${row.numero}`}
            items={menuItems(row, profile)}
            onSelect={(key) => handleRowAction(key as SolicitacaoAction, row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {showCards && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Novas submissões"
            value={counts.Submetido}
            active={statusFilter === "Submetido"}
            onClick={() => toggleStatusFilter("Submetido")}
          />
          <StatCard
            label="Em análise"
            value={counts["Em análise"]}
            active={statusFilter === "Em análise"}
            onClick={() => toggleStatusFilter("Em análise")}
          />
          <StatCard
            label="Em complementação"
            value={counts["Em complementação"]}
            active={statusFilter === "Em complementação"}
            onClick={() => toggleStatusFilter("Em complementação")}
          />
          <StatCard
            label="Aguardando gestor"
            value={counts["Aguardando gestor"]}
            active={statusFilter === "Aguardando gestor"}
            onClick={() => toggleStatusFilter("Aguardando gestor")}
          />
        </div>
      )}

      {!showCards && (
        <p className="mb-4 text-body text-ink-3">
          Exibindo solicitações da área{" "}
          <span className="font-semibold text-ink">
            {currentSolicitante.areaGestora}
          </span>
          .
        </p>
      )}

      {pendentesComplementacao.length > 0 && (
        <InlineAlert
          tone="warning"
          title={
            pendentesComplementacao.length === 1
              ? "1 solicitação aguarda sua complementação"
              : `${pendentesComplementacao.length} solicitações aguardam sua complementação`
          }
        >
          <p>O analista pediu informações adicionais. Envie o anexo solicitado para que a análise continue.</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {pendentesComplementacao.map((s) => (
              <li key={s.numero} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  <span className="font-semibold text-ink">{s.numero}</span> · {s.nomeModelo}
                </span>
                <Button variant="link" onClick={() => onAbrir(s.numero)} className="h-auto p-0">
                  Ver pedido e complementar
                </Button>
              </li>
            ))}
          </ul>
        </InlineAlert>
      )}

      <FilterBar onSearch={handleSearch} onClear={handleClear}>
        <FilterTextField
          id="filtro-numero"
          label="Nº da solicitação"
          value={draft.numero}
          onChange={(value) => setDraft((f) => ({ ...f, numero: value }))}
          placeholder="Ex.: REQ-2026-001"
        />
        {showCards ? (
          <FilterSelectField
            id="filtro-area"
            label="Área gestora"
            value={draft.areaGestora}
            onChange={(value) =>
              setDraft((f) => ({ ...f, areaGestora: value }))
            }
            options={areaGestoraFilterOptions}
          />
        ) : (
          <ReadOnlyField
            label="Área gestora"
            value={currentSolicitante.areaGestora}
          />
        )}
        <FilterTextField
          id="filtro-nome-modelo"
          label="Nome do modelo"
          value={draft.nomeModelo}
          onChange={(value) => setDraft((f) => ({ ...f, nomeModelo: value }))}
          placeholder="Buscar pelo nome do modelo"
          icon="search"
        />
        <FilterSelectField
          id="filtro-assunto"
          label="Assunto"
          value={draft.assunto}
          onChange={(value) => setDraft((f) => ({ ...f, assunto: value }))}
          options={assuntoFilterOptions}
        />
        <FilterSelectField
          id="filtro-analista"
          label="Analista responsável"
          value={draft.analista}
          onChange={(value) => setDraft((f) => ({ ...f, analista: value }))}
          options={analistaFilterOptions}
        />
      </FilterBar>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.numero}
        emptyTitle="Nenhuma solicitação encontrada."
        emptyDescription="Tente alterar os filtros ou os termos da pesquisa."
      />

      <Toast
        open={toast !== null}
        tone="info"
        message={toast ?? ""}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
