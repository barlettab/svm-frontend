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
import { ReadOnlyField } from "../../components/ui/ReadOnlyField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../components/ui/SecondaryButton";
import { StatCard } from "../../components/ui/StatCard";
import { Table, type TableColumn } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Drawer } from "../../components/ui/Drawer";
import { DetailRow } from "../../components/ui/DetailRow";
import type { Solicitacao, SolicitacaoStatus } from "../../types";

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

function statusBadgeTone(status: SolicitacaoStatus) {
  if (status === "Submetido") return "slate" as const;
  if (status === "Em análise") return "blue" as const;
  return "amber" as const;
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
      render: (row) => (
        <Badge tone={statusBadgeTone(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: "Ação",
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelected(row)}
          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Visualizar
        </button>
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
        <p className="mb-4 text-sm text-slate-500">
          Exibindo solicitações da área{" "}
          <span className="font-medium text-slate-700">
            {currentSolicitante.areaGestora}
          </span>
          .
        </p>
      )}

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
            onChange={(value) =>
              setDraft((f) => ({ ...f, nomeModelo: value }))
            }
            placeholder="Buscar pelo nome do modelo"
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
        </div>

        <div className="mt-5 flex gap-3">
          <PrimaryButton type="button" onClick={handleSearch}>
            Pesquisar
          </PrimaryButton>
          <SecondaryButton type="button" onClick={handleClear}>
            Limpar filtros
          </SecondaryButton>
        </div>
      </div>

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
              value={
                <Badge tone={statusBadgeTone(selected.status)}>
                  {selected.status}
                </Badge>
              }
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
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Complementação solicitada
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  {selected.complementacao}
                </p>
              </div>
            )}

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Timeline
              </p>
              <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
                {selected.timeline.map((event, index) => (
                  <li key={index}>
                    <p className="text-xs font-medium text-slate-400">
                      {event.data}
                    </p>
                    <p className="text-sm text-slate-800">
                      {event.descricao}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </dl>
        )}
      </Drawer>
    </div>
  );
}
