import { useMemo, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { mockCancelados } from "../../data/mockCancelados";
import { currentSolicitante } from "../../data/currentUser";
import { areaGestoraFilterOptions } from "../../data/filterOptions";
import { FilterTextField } from "../../components/ui/FilterTextField";
import { FilterSelectField } from "../../components/ui/FilterSelectField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../components/ui/SecondaryButton";
import { Table, type TableColumn } from "../../components/ui/Table";
import { Drawer } from "../../components/ui/Drawer";
import { DetailRow } from "../../components/ui/DetailRow";
import { CancelarSolicitacaoForm } from "./CancelarSolicitacaoForm";
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
  const { profile } = useProfile();
  const [cancelados, setCancelados] =
    useState<SolicitacaoCancelada[]>(mockCancelados);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<SolicitacaoCancelada | null>(null);

  const filtered = useMemo(
    () => cancelados.filter((s) => matches(s, applied)),
    [cancelados, applied],
  );

  function handleSearch() {
    setApplied(draft);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }

  if (profile === "solicitante") {
    return (
      <div className="mx-auto max-w-2xl">
        <CancelarSolicitacaoForm
          currentUser={currentSolicitante}
          onSubmit={(record) =>
            setCancelados((current) => [record, ...current])
          }
          onDone={() => {}}
        />
      </div>
    );
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
        <span className="line-clamp-2 max-w-xs text-slate-600">
          {row.justificativa}
        </span>
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
      <div className="mb-6 flex justify-end">
        <SecondaryButton
          type="button"
          onClick={() => setShowCancelForm((current) => !current)}
        >
          {showCancelForm ? "Fechar" : "Cancelar solicitação"}
        </SecondaryButton>
      </div>

      {showCancelForm && (
        <CancelarSolicitacaoForm
          onSubmit={(record) =>
            setCancelados((current) => [record, ...current])
          }
          onDone={() => setShowCancelForm(false)}
        />
      )}

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
            onChange={(value) =>
              setDraft((f) => ({ ...f, areaGestora: value }))
            }
            options={areaGestoraFilterOptions}
          />
          <FilterTextField
            id="cancel-filtro-nome-modelo"
            label="Nome do modelo"
            value={draft.nomeModelo}
            onChange={(value) =>
              setDraft((f) => ({ ...f, nomeModelo: value }))
            }
            placeholder="Buscar pelo nome do modelo"
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

            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                Justificativa de cancelamento
              </p>
              <p className="mt-1 text-sm text-red-900">
                {selected.justificativa}
              </p>
            </div>
          </dl>
        )}
      </Drawer>
    </div>
  );
}
