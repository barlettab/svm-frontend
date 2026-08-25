import { useMemo, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { mockSolicitacoes } from "../../data/mockSolicitacoes";
import { currentSolicitante } from "../../data/currentUser";
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
import { Drawer } from "../../components/ui/Drawer";
import { DetailRow } from "../../components/ui/DetailRow";
import { Timeline } from "../../components/ui/Timeline";
import { InlineAlert } from "../../components/ui/ErrorState";
import { Toast } from "../../components/ui/Toast";
import {
  RowActions,
  SOLICITACAO_ACTIONS,
  type SolicitacaoAction,
} from "../../components/ui/RowActions";
import type { Solicitacao, SolicitacaoStatus } from "../../types";

const ROW_ACTIONS: SolicitacaoAction[] = [
  "visualizar",
  "alterar",
  "atribuir-analista",
  "alterar-solicitante",
  "cancelar",
];

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

export function EmAndamentoTab() {
  const { profile } = useProfile();
  const showCards = profile !== "solicitante";

  const visibleSolicitacoes = useMemo(() => {
    if (profile !== "solicitante") return mockSolicitacoes;
    return mockSolicitacoes.filter(
      (s) => s.areaGestora === currentSolicitante.areaGestora,
    );
  }, [profile]);

  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [statusFilter, setStatusFilter] = useState<SolicitacaoStatus | null>(
    null,
  );
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      Submetido: mockSolicitacoes.filter((s) => s.status === "Submetido")
        .length,
      "Em análise": mockSolicitacoes.filter((s) => s.status === "Em análise")
        .length,
      "Em complementação": mockSolicitacoes.filter(
        (s) => s.status === "Em complementação",
      ).length,
    };
  }, []);

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
      setSelected(row);
      return;
    }
    setToastMessage(
      `${SOLICITACAO_ACTIONS[action].label} (${row.numero}): funcionalidade ainda não implementada.`,
    );
  }

  const columns: TableColumn<Solicitacao>[] = [
    { header: "Nº da solicitação", render: (row) => row.numero },
    { header: "Nome do modelo", render: (row) => row.nomeModelo },
    { header: "Área gestora", render: (row) => row.areaGestora },
    { header: "Assunto", render: (row) => row.assunto },
    { header: "Solicitante", render: (row) => row.solicitante },
    { header: "Data da submissão", render: (row) => row.dataSubmissao },
    {
      header: "Analista responsável",
      render: (row) => row.analistaResponsavel,
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Ação",
      align: "center",
      render: (row) => (
        <RowActions
          actions={ROW_ACTIONS}
          onAction={(action) => handleRowAction(action, row)}
        />
      ),
    },
  ];

  return (
    <div>
      {showCards && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <Drawer
        open={selected !== null}
        title={selected?.numero ?? ""}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <dl>
            <DetailRow label="Nome do modelo" value={selected.nomeModelo} />
            <DetailRow
              label="Status"
              value={<StatusBadge status={selected.status} />}
            />
            <DetailRow label="Solicitante" value={selected.solicitante} />
            <DetailRow label="Área gestora" value={selected.areaGestora} />
            <DetailRow
              label="Analista responsável"
              value={selected.analistaResponsavel}
            />
            <DetailRow label="Assunto" value={selected.assunto} />
            <DetailRow label="Público" value={selected.publico} />
            <DetailRow
              label="Data da submissão"
              value={selected.dataSubmissao}
            />

            {selected.complementacao && (
              <div className="mt-4">
                <InlineAlert tone="warning" title="Complementação solicitada">
                  {selected.complementacao}
                </InlineAlert>
              </div>
            )}

            <div className="mt-5">
              <p className="mb-3 text-label uppercase tracking-[0.4px] text-ink-3">
                Timeline
              </p>
              <Timeline
                items={selected.timeline.map((event) => ({
                  data: event.data,
                  descricao: event.descricao,
                }))}
              />
            </div>
          </dl>
        )}
      </Drawer>

      <Toast
        open={toastMessage !== null}
        tone="info"
        message={toastMessage ?? ""}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
