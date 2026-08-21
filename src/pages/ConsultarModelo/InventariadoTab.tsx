import { useMemo, useState } from "react";
import { mockInventario } from "../../data/mockInventario";
import {
  analistaFilterOptions,
  areaGestoraFilterOptions,
  assuntoFilterOptions,
} from "../../data/filterOptions";
import { FilterTextField } from "../../components/ui/FilterTextField";
import { FilterSelectField } from "../../components/ui/FilterSelectField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../components/ui/SecondaryButton";
import { StatCard } from "../../components/ui/StatCard";
import { Table, type TableColumn } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Drawer } from "../../components/ui/Drawer";
import { DetailRow } from "../../components/ui/DetailRow";
import type { ModeloInventariado } from "../../types";

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

type CardFilter =
  | { field: "resultadoValidacao"; value: string }
  | { field: "monitoramento"; value: string }
  | { field: "situacao"; value: string }
  | null;

function validacaoBadgeTone(resultado: ModeloInventariado["resultadoValidacao"]) {
  return resultado === "Validado" ? ("green" as const) : ("red" as const);
}

function situacaoBadgeTone(situacao: ModeloInventariado["situacao"]) {
  if (situacao === "Ativo") return "green" as const;
  if (situacao === "Suspenso") return "amber" as const;
  return "slate" as const;
}

function matches(modelo: ModeloInventariado, filters: Filters) {
  if (
    filters.numero &&
    !modelo.numero.toLowerCase().includes(filters.numero.toLowerCase())
  )
    return false;
  if (filters.areaGestora !== "Todas" && modelo.areaGestora !== filters.areaGestora)
    return false;
  if (
    filters.nomeModelo &&
    !modelo.nomeModelo.toLowerCase().includes(filters.nomeModelo.toLowerCase())
  )
    return false;
  if (filters.assunto !== "Todos" && modelo.assunto !== filters.assunto)
    return false;
  if (filters.analista !== "Todos" && modelo.analistaResponsavel !== filters.analista)
    return false;
  return true;
}

function matchesCard(modelo: ModeloInventariado, cardFilter: CardFilter) {
  if (!cardFilter) return true;
  return modelo[cardFilter.field] === cardFilter.value;
}

export function InventariadoTab() {
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [cardFilter, setCardFilter] = useState<CardFilter>(null);
  const [selected, setSelected] = useState<ModeloInventariado | null>(null);

  const counts = useMemo(
    () => ({
      total: mockInventario.length,
      naoValidados: mockInventario.filter(
        (m) => m.resultadoValidacao === "Não validado",
      ).length,
      validados: mockInventario.filter(
        (m) => m.resultadoValidacao === "Validado",
      ).length,
      monitorados: mockInventario.filter(
        (m) => m.monitoramento === "Em monitoramento",
      ).length,
      ativos: mockInventario.filter((m) => m.situacao === "Ativo").length,
      inativos: mockInventario.filter((m) => m.situacao === "Inativo").length,
      suspensos: mockInventario.filter((m) => m.situacao === "Suspenso")
        .length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    return mockInventario.filter(
      (m) => matchesCard(m, cardFilter) && matches(m, applied),
    );
  }, [applied, cardFilter]);

  function toggleCard(
    field: "resultadoValidacao" | "monitoramento" | "situacao",
    value: string,
  ) {
    setCardFilter((current) =>
      current && current.field === field && current.value === value
        ? null
        : ({ field, value } as CardFilter),
    );
  }

  function handleSearch() {
    setApplied(draft);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setCardFilter(null);
  }

  const columns: TableColumn<ModeloInventariado>[] = [
    { header: "Nº da solicitação", render: (row) => row.numero },
    { header: "Nome do modelo", render: (row) => row.nomeModelo },
    { header: "Tipo de modelo", render: (row) => row.tipoModelo },
    { header: "Área gestora", render: (row) => row.areaGestora },
    { header: "Assunto", render: (row) => row.assunto },
    { header: "Público", render: (row) => row.publico },
    {
      header: "Resultado da validação",
      render: (row) => (
        <Badge tone={validacaoBadgeTone(row.resultadoValidacao)}>
          {row.resultadoValidacao}
        </Badge>
      ),
    },
    { header: "Monitoramento", render: (row) => row.monitoramento },
    {
      header: "Situação do modelo",
      render: (row) => (
        <Badge tone={situacaoBadgeTone(row.situacao)}>{row.situacao}</Badge>
      ),
    },
    {
      header: "Analista responsável",
      render: (row) => row.analistaResponsavel,
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
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total de inventariados" value={counts.total} />
        <StatCard
          label="Total de validados"
          value={counts.validados}
          active={
            cardFilter?.field === "resultadoValidacao" &&
            cardFilter.value === "Validado"
          }
          onClick={() => toggleCard("resultadoValidacao", "Validado")}
        />
        <StatCard
          label="Total de não validados"
          value={counts.naoValidados}
          active={
            cardFilter?.field === "resultadoValidacao" &&
            cardFilter.value === "Não validado"
          }
          onClick={() => toggleCard("resultadoValidacao", "Não validado")}
        />
        <StatCard
          label="Total de monitorados"
          value={counts.monitorados}
          active={
            cardFilter?.field === "monitoramento" &&
            cardFilter.value === "Em monitoramento"
          }
          onClick={() => toggleCard("monitoramento", "Em monitoramento")}
        />
        <StatCard
          label="Total de modelos ativos"
          value={counts.ativos}
          active={cardFilter?.field === "situacao" && cardFilter.value === "Ativo"}
          onClick={() => toggleCard("situacao", "Ativo")}
        />
        <StatCard
          label="Total de modelos inativos"
          value={counts.inativos}
          active={
            cardFilter?.field === "situacao" && cardFilter.value === "Inativo"
          }
          onClick={() => toggleCard("situacao", "Inativo")}
        />
        <StatCard
          label="Total de modelos suspensos"
          value={counts.suspensos}
          active={
            cardFilter?.field === "situacao" && cardFilter.value === "Suspenso"
          }
          onClick={() => toggleCard("situacao", "Suspenso")}
        />
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterTextField
            id="inv-filtro-numero"
            label="Nº da solicitação"
            value={draft.numero}
            onChange={(value) => setDraft((f) => ({ ...f, numero: value }))}
            placeholder="Ex.: INV-2026-001"
          />
          <FilterSelectField
            id="inv-filtro-area"
            label="Área gestora"
            value={draft.areaGestora}
            onChange={(value) =>
              setDraft((f) => ({ ...f, areaGestora: value }))
            }
            options={areaGestoraFilterOptions}
          />
          <FilterTextField
            id="inv-filtro-nome-modelo"
            label="Nome do modelo"
            value={draft.nomeModelo}
            onChange={(value) =>
              setDraft((f) => ({ ...f, nomeModelo: value }))
            }
            placeholder="Buscar pelo nome do modelo"
          />
          <FilterSelectField
            id="inv-filtro-assunto"
            label="Assunto"
            value={draft.assunto}
            onChange={(value) => setDraft((f) => ({ ...f, assunto: value }))}
            options={assuntoFilterOptions}
          />
          <FilterSelectField
            id="inv-filtro-analista"
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
        emptyTitle="Nenhum modelo encontrado."
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
            <DetailRow label="Tipo de modelo" value={selected.tipoModelo} />
            <DetailRow label="Área gestora" value={selected.areaGestora} />
            <DetailRow label="Assunto" value={selected.assunto} />
            <DetailRow label="Público" value={selected.publico} />
            <DetailRow
              label="Resultado da validação"
              value={
                <Badge tone={validacaoBadgeTone(selected.resultadoValidacao)}>
                  {selected.resultadoValidacao}
                </Badge>
              }
            />
            <DetailRow label="Monitoramento" value={selected.monitoramento} />
            <DetailRow
              label="Situação do modelo"
              value={
                <Badge tone={situacaoBadgeTone(selected.situacao)}>
                  {selected.situacao}
                </Badge>
              }
            />
            <DetailRow
              label="Analista responsável"
              value={selected.analistaResponsavel}
            />
            <DetailRow
              label="Data do inventário"
              value={selected.dataInventario}
            />
            <DetailRow label="Objetivo" value={selected.objetivo} />
          </dl>
        )}
      </Drawer>
    </div>
  );
}
