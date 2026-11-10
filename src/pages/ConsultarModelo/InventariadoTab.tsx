import { useMemo, useState } from "react";
import { useSolicitacoes } from "../../context/SolicitacoesContext";
import {
  analistaFilterOptions,
  areaGestoraFilterOptions,
  assuntoFilterOptions,
} from "../../data/filterOptions";
import { FilterTextField } from "../../components/ui/FilterTextField";
import { FilterSelectField } from "../../components/ui/FilterSelectField";
import { FilterBar } from "../../components/ui/FilterBar";
import { IndicatorPanel, type IndicatorGroup } from "../../components/ui/IndicatorPanel";
import { Table, type TableColumn } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/Badge";
import { Icon } from "../../components/ui/Icon";
import type { ModeloInventariado } from "../../types";

type IndicatorField = "resultadoValidacao" | "monitoramento" | "situacao";

const TODOS = "Todos";

/** Filtros da barra. Os três campos de indicador guardam o rótulo exibido (ex.: "Validados") ou "Todos". */
interface Filters extends Record<IndicatorField, string> {
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
  assunto: TODOS,
  analista: TODOS,
  resultadoValidacao: TODOS,
  monitoramento: TODOS,
  situacao: TODOS,
};

const INDICATOR_FIELDS: IndicatorField[] = ["resultadoValidacao", "monitoramento", "situacao"];

/** Cada indicador = um campo + um valor. Alimenta o painel (contagem) e as opções dos filtros. */
const INDICATORS: {
  title: string;
  field: IndicatorField;
  items: { key: string; label: string; value: string; color: string }[];
}[] = [
  {
    title: "Resultado da validação",
    field: "resultadoValidacao",
    items: [
      { key: "val-ok", label: "Validados", value: "Validado", color: "var(--color-success)" },
      { key: "val-no", label: "Não validados", value: "Não validado", color: "var(--color-error)" },
    ],
  },
  {
    title: "Monitoramento",
    field: "monitoramento",
    items: [
      { key: "mon-sim", label: "Monitorados", value: "Em monitoramento", color: "var(--color-primary)" },
      { key: "mon-nao", label: "Não monitorados", value: "Não monitorado", color: "var(--color-ink-4)" },
      { key: "mon-na", label: "Não se aplica", value: "Não se aplica", color: "var(--color-line-strong)" },
    ],
  },
  {
    title: "Situação do modelo",
    field: "situacao",
    items: [
      { key: "sit-at", label: "Ativos", value: "Ativo", color: "var(--color-success)" },
      { key: "sit-in", label: "Inativos", value: "Inativo", color: "var(--color-ink-2)" },
      { key: "sit-su", label: "Suspensos", value: "Suspenso", color: "var(--color-warning)" },
    ],
  },
];

const INDICATOR_ITEMS = INDICATORS.flatMap((group) =>
  group.items.map((item) => ({ ...item, field: group.field, group: group.title })),
);

/** Item do indicador selecionado em um campo do filtro (undefined = "Todos"). */
const itemDoFiltro = (field: IndicatorField, label: string) =>
  INDICATOR_ITEMS.find((i) => i.field === field && i.label === label);

/** Opções do select: "Todos" + rótulos dos indicadores do grupo. */
const opcoesDoGrupo = (field: IndicatorField) => [
  TODOS,
  ...INDICATORS.find((g) => g.field === field)!.items.map((i) => i.label),
];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
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
  for (const field of INDICATOR_FIELDS) {
    const item = itemDoFiltro(field, filters[field]);
    if (item && modelo[field] !== item.value) return false;
  }
  return true;
}

export function InventariadoTab({ onAbrir }: { onAbrir: (numero: string) => void }) {
  // Inventário compartilhado: modelos validados pelo gestor com "inventariar = Sim" entram aqui.
  const { inventario } = useSolicitacoes();
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  /** Filtros de Resultado / Monitoramento / Situação em uso (viram etiquetas acima da tabela). */
  const ativos = INDICATOR_FIELDS.map((f) => itemDoFiltro(f, applied[f])).filter((i) => i !== undefined);

  const groups: IndicatorGroup[] = useMemo(
    () =>
      INDICATORS.map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          key: item.key,
          label: item.label,
          color: item.color,
          count: inventario.filter((m) => m[group.field] === item.value).length,
        })),
      })),
    [inventario],
  );

  const filtered = useMemo(() => inventario.filter((m) => matches(m, applied)), [applied, inventario]);

  function handleSearch() {
    setApplied(draft);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }

  function removerIndicador(field: IndicatorField) {
    setDraft((f) => ({ ...f, [field]: TODOS }));
    setApplied((f) => ({ ...f, [field]: TODOS }));
  }

  const hl = (field: IndicatorField) => ativos.some((i) => i.field === field);

  const columns: TableColumn<ModeloInventariado>[] = [
    {
      header: "Modelo",
      render: (row) => (
        <div>
          <div className="font-semibold text-ink">{row.nomeModelo}</div>
          <div className="font-mono text-aux text-ink-2">{row.numero}</div>
        </div>
      ),
    },
    { header: "Tipo de modelo", render: (row) => row.tipoModelo },
    { header: "Assunto", render: (row) => row.assunto },
    {
      header: "Validação",
      highlight: hl("resultadoValidacao"),
      render: (row) => <StatusBadge status={row.resultadoValidacao} />,
    },
    {
      header: "Monitoramento",
      highlight: hl("monitoramento"),
      render: (row) => <StatusBadge status={row.monitoramento} />,
    },
    {
      header: "Situação",
      highlight: hl("situacao"),
      render: (row) => <StatusBadge status={row.situacao} />,
    },
    { header: "Analista", render: (row) => row.analistaResponsavel },
    {
      header: "Inventariado em",
      render: (row) => <span className="whitespace-nowrap">{formatDate(row.dataInventario)}</span>,
    },
    {
      header: "Ação",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={() => onAbrir(row.numero)}
          aria-label={`Visualizar ${row.nomeModelo}`}
          className="inline-flex size-9 items-center justify-center rounded-svm text-primary hover:bg-info-bg"
        >
          <Icon name="eye" size={18} />
        </button>
      ),
    },
  ];

  const total = inventario.length;
  const resultTitle =
    filtered.length === total ? `${total} modelos inventariados` : `${filtered.length} de ${total} modelos`;

  return (
    <div>
      <IndicatorPanel
        totalLabel="Modelos inventariados"
        total={total}
        groups={groups}
      />

      <FilterBar onSearch={handleSearch} onClear={handleClear}>
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
          onChange={(value) => setDraft((f) => ({ ...f, nomeModelo: value }))}
          placeholder="Buscar pelo nome do modelo"
          icon="search"
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
        <FilterSelectField
          id="inv-filtro-resultado"
          label="Resultado da validação"
          value={draft.resultadoValidacao}
          onChange={(value) => setDraft((f) => ({ ...f, resultadoValidacao: value }))}
          options={opcoesDoGrupo("resultadoValidacao")}
        />
        <FilterSelectField
          id="inv-filtro-monitoramento"
          label="Monitoramento"
          value={draft.monitoramento}
          onChange={(value) => setDraft((f) => ({ ...f, monitoramento: value }))}
          options={opcoesDoGrupo("monitoramento")}
        />
        <FilterSelectField
          id="inv-filtro-situacao"
          label="Situação do modelo"
          value={draft.situacao}
          onChange={(value) => setDraft((f) => ({ ...f, situacao: value }))}
          options={opcoesDoGrupo("situacao")}
        />
      </FilterBar>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border border-b-0 border-line bg-surface px-5 py-3.5">
          <h2 className="text-section font-semibold text-ink" aria-live="polite">
            {resultTitle}
          </h2>
          {ativos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ativos.map((i) => (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => removerIndicador(i.field)}
                  aria-label={`Remover filtro ${i.group}: ${i.label}`}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-info-line bg-info-bg px-3 text-aux font-semibold text-primary hover:border-primary"
                >
                  {i.group}: {i.label}
                  <Icon name="x" size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
        <Table
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.numero}
          minWidth={1000}
          emptyTitle="Nenhum modelo encontrado."
          emptyDescription="Nenhum modelo atende aos filtros aplicados. Remova um filtro ou clique em Limpar."
        />
      </div>
    </div>
  );
}
