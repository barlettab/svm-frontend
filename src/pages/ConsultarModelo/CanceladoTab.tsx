import { useMemo, useState } from "react";
import { mockCancelados } from "../../data/mockCancelados";
import { areaGestoraFilterOptions } from "../../data/filterOptions";
import { FilterTextField } from "../../components/ui/FilterTextField";
import { FilterSelectField } from "../../components/ui/FilterSelectField";
import { FilterBar } from "../../components/ui/FilterBar";
import { Table, type TableColumn } from "../../components/ui/Table";
import { Drawer } from "../../components/ui/Drawer";
import { DetailRow } from "../../components/ui/DetailRow";
import { InlineAlert } from "../../components/ui/ErrorState";
import { IconButton } from "../../components/ui/Button";
import type { SolicitacaoCancelada } from "../../types";

const EMPTY_VALUE = "—";

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

export function CanceladoTab() {
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<SolicitacaoCancelada | null>(null);

  const filtered = useMemo(
    () => mockCancelados.filter((s) => matches(s, applied)),
    [applied],
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
    { header: "Área gestora", render: (row) => row.areaGestora },
    { header: "Assunto", render: (row) => row.assunto ?? EMPTY_VALUE },
    { header: "Solicitante", render: (row) => row.solicitante ?? EMPTY_VALUE },
    {
      header: "Analista responsável",
      render: (row) => row.analistaResponsavel ?? EMPTY_VALUE,
    },
    { header: "Data do cancelamento", render: (row) => row.dataCancelamento },
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
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <IconButton
            icon="eye"
            label="Visualizar solicitação"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(row);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <FilterBar onSearch={handleSearch} onClear={handleClear}>
        <FilterTextField
          id="cancel-filtro-numero"
          label="Nº da solicitação"
          value={draft.numero}
          onChange={(value) => setDraft((f) => ({ ...f, numero: value }))}
          placeholder="Ex.: REQ-2026-001"
        />
        <FilterSelectField
          id="cancel-filtro-area"
          label="Área gestora"
          value={draft.areaGestora}
          onChange={(value) => setDraft((f) => ({ ...f, areaGestora: value }))}
          options={areaGestoraFilterOptions}
        />
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

      <Drawer
        open={selected !== null}
        title={selected?.numero ?? ""}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <dl>
            <DetailRow label="Nome do modelo" value={selected.nomeModelo} />
            <DetailRow label="Área gestora" value={selected.areaGestora} />
            <DetailRow
              label="Assunto"
              value={selected.assunto ?? EMPTY_VALUE}
            />
            <DetailRow
              label="Solicitante"
              value={selected.solicitante ?? EMPTY_VALUE}
            />
            <DetailRow
              label="Analista responsável"
              value={selected.analistaResponsavel ?? EMPTY_VALUE}
            />
            <DetailRow
              label="Data do cancelamento"
              value={selected.dataCancelamento}
            />

            <div className="mt-4">
              <InlineAlert tone="error" title="Justificativa de cancelamento">
                {selected.justificativa}
              </InlineAlert>
            </div>
          </dl>
        )}
      </Drawer>
    </div>
  );
}
