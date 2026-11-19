import { useMemo, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { useSolicitacoes } from "../../context/SolicitacoesContext";
import { currentSolicitante } from "../../data/currentUser";
import { areaGestoraFilterOptions } from "../../data/filterOptions";
import { FilterTextField } from "../../components/ui/FilterTextField";
import { FilterSelectField } from "../../components/ui/FilterSelectField";
import { FilterBar } from "../../components/ui/FilterBar";
import { ReadOnlyField } from "../../components/ui/ReadOnlyField";
import { Table, type TableColumn } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import type { SolicitacaoCancelada } from "../../types";

const EMPTY_VALUE = "—";

const canceladoPorLabel = (row: SolicitacaoCancelada) =>
  row.canceladoPor ? CANCELADO_POR_LABEL[row.canceladoPor] : EMPTY_VALUE;

const CANCELADO_POR_LABEL = { analista: "Analista", gestor: "Gestor GEVAM", solicitante: "Solicitante" } as const;

interface Filters {
  numero: string;
  areaGestora: string;
  nomeModelo: string;
}

const DEFAULT_FILTERS: Filters = {
  numero: "",
  areaGestora: "Todas",
  nomeModelo: "",
};

function matches(solicitacao: SolicitacaoCancelada, filters: Filters) {
  if (
    filters.numero &&
    !solicitacao.numero.toLowerCase().includes(filters.numero.toLowerCase())
  )
    return false;
  if (
    filters.areaGestora !== "Todas" &&
    solicitacao.areaGestora !== filters.areaGestora
  )
    return false;
  if (
    filters.nomeModelo &&
    !solicitacao.nomeModelo
      .toLowerCase()
      .includes(filters.nomeModelo.toLowerCase())
  )
    return false;
  return true;
}

/**
 * Aba "Cancelado": lista as canceladas; Abrir leva à página da solicitação (sem painel lateral).
 * O solicitante vê só as canceladas da área dele (como em Em andamento).
 */
export function CanceladoTab({ onAbrir }: { onAbrir: (numero: string) => void }) {
  const { profile } = useProfile();
  const soDaArea = profile === "solicitante";
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const { cancelados } = useSolicitacoes();

  const filtered = useMemo(
    () =>
      cancelados.filter(
        (s) => (!soDaArea || s.areaGestora === currentSolicitante.areaGestora) && matches(s, applied),
      ),
    [cancelados, applied, soDaArea],
  );

  function handleSearch() {
    setApplied(draft);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }

  const columns: TableColumn<SolicitacaoCancelada>[] = [
    { header: "Nº da solicitação", render: (row) => row.numero },
    { header: "Nome do modelo", render: (row) => row.nomeModelo },
    // O solicitante só vê a área dele (indicada acima da lista): a coluna sairia repetida.
    ...(soDaArea ? [] : [{ header: "Área gestora", render: (row: SolicitacaoCancelada) => row.areaGestora }]),
    { header: "Assunto", render: (row) => row.assunto ?? EMPTY_VALUE },
    { header: "Solicitante", render: (row) => row.solicitante ?? EMPTY_VALUE },
    {
      header: "Analista responsável",
      render: (row) => row.analistaResponsavel ?? EMPTY_VALUE,
    },
    { header: "Data do cancelamento", render: (row) => row.dataCancelamento },
    { header: "Cancelada por", render: canceladoPorLabel },
    {
      header: "Justificativa",
      render: (row) => (
        <span className="line-clamp-2 max-w-xs text-ink-3">
          {row.justificativa}
        </span>
      ),
    },
    {
      header: "Ação",
      align: "right",
      render: (row) => (
        <Button variant="secondary" icon="eye" onClick={() => onAbrir(row.numero)} className="h-[34px] px-3">
          Abrir
        </Button>
      ),
    },
  ];

  return (
    <div>
      {soDaArea && (
        <p className="mb-4 text-body text-ink-3">
          Exibindo solicitações canceladas da área{" "}
          <span className="font-semibold text-ink">{currentSolicitante.areaGestora}</span>.
        </p>
      )}
      <FilterBar onSearch={handleSearch} onClear={handleClear}>
        <FilterTextField
          id="cancel-filtro-numero"
          label="Nº da solicitação"
          value={draft.numero}
          onChange={(value) => setDraft((f) => ({ ...f, numero: value }))}
          placeholder="Ex.: REQ-2026-001"
        />
        {soDaArea ? (
          <ReadOnlyField label="Área gestora" value={currentSolicitante.areaGestora} />
        ) : (
          <FilterSelectField
            id="cancel-filtro-area"
            label="Área gestora"
            value={draft.areaGestora}
            onChange={(value) => setDraft((f) => ({ ...f, areaGestora: value }))}
            options={areaGestoraFilterOptions}
          />
        )}
        <FilterTextField
          id="cancel-filtro-nome-modelo"
          label="Nome do modelo"
          value={draft.nomeModelo}
          onChange={(value) => setDraft((f) => ({ ...f, nomeModelo: value }))}
          placeholder="Buscar pelo nome do modelo"
          icon="search"
        />
      </FilterBar>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.numero}
        emptyTitle="Nenhuma solicitação encontrada."
        emptyDescription="Tente alterar os filtros ou os termos da pesquisa."
      />

    </div>
  );
}
