import { useMemo, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { useSolicitacoes } from "../../context/SolicitacoesContext";
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
import { IndicatorPanel, type IndicatorGroup } from "../../components/ui/IndicatorPanel";
import { Table, type TableColumn } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/Badge";
import { Icon } from "../../components/ui/Icon";
import type { ModeloInventariado } from "../../types";

/** Linha da aba: um modelo do inventário (toda solicitação Validado entra no inventário). */
type Linha = ModeloInventariado;

type IndicatorField = "monitoramento" | "situacao";

const TODOS = "Todos";

/** Filtros da barra. Os campos de indicador guardam o rótulo exibido (ex.: "Ativos") ou "Todos". */
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
  monitoramento: TODOS,
  situacao: TODOS,
};

const INDICATOR_FIELDS: IndicatorField[] = ["monitoramento", "situacao"];

/** Cada indicador = um campo + um valor. Alimenta o painel (contagem) e as opções dos filtros. */
const INDICATORS: {
  title: string;
  field: IndicatorField;
  items: { key: string; label: string; value: string; color: string }[];
}[] = [
  {
    title: "Monitoramento 2ª Linha (GEVAM)",
    field: "monitoramento",
    items: [
      { key: "mon-sim", label: "Monitorados", value: "Em monitoramento", color: "var(--color-primary)" },
      { key: "mon-nao", label: "Não monitorados", value: "Não monitorado", color: "var(--color-ink-4)" },
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

function matches(modelo: Linha, filters: Filters) {
  const numero = filters.numero.trim().toLowerCase();
  if (
    numero &&
    !modelo.numero.toLowerCase().includes(numero) &&
    !modelo.numeroSolicitacao?.toLowerCase().includes(numero)
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

/**
 * Aba "Inventariado": todos os modelos do inventário (toda solicitação Validado entra nele).
 * O solicitante também tem esta aba, com o mesmo nome: só a área dele (quadros e lista) e só leitura.
 */
export function InventariadoTab({
  onAbrir,
}: {
  /** Abre a página do modelo inventariado (nº do inventário). */
  onAbrir: (numero: string) => void;
}) {
  const { profile } = useProfile();
  const visaoSolicitante = profile === "solicitante";
  const { inventario } = useSolicitacoes();
  const linhas: Linha[] = useMemo(
    () => inventario.filter((m) => !visaoSolicitante || m.areaGestora === currentSolicitante.areaGestora),
    [inventario, visaoSolicitante],
  );
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  /** Filtros de Monitoramento / Situação em uso (viram etiquetas acima da tabela). */
  const ativos = INDICATOR_FIELDS.map((f) => itemDoFiltro(f, applied[f])).filter((i) => i !== undefined);

  const groups: IndicatorGroup[] = useMemo(
    () =>
      INDICATORS.map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          key: item.key,
          label: item.label,
          color: item.color,
          count: linhas.filter((m) => m[group.field] === item.value).length,
        })),
      })),
    [linhas],
  );

  const filtered = useMemo(() => linhas.filter((m) => matches(m, applied)), [applied, linhas]);

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

  const columns: TableColumn<Linha>[] = [
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
      header: "Monitoramento 2ª Linha (GEVAM)",
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
      header: "Validado em",
      render: (row) => <span className="whitespace-nowrap">{row.dataInventario ? formatDate(row.dataInventario) : "—"}</span>,
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

  /** Cards e totais contam o que o perfil vê: todo o inventário, ou só a área do solicitante. */
  const total = linhas.length;
  const resultTitle = visaoSolicitante
    ? filtered.length === linhas.length
      ? `${linhas.length} ${linhas.length === 1 ? "modelo inventariado" : "modelos inventariados"}`
      : `${filtered.length} de ${linhas.length} modelos inventariados`
    : filtered.length === linhas.length
      ? `${linhas.length} modelos inventariados`
      : `${filtered.length} de ${linhas.length} modelos inventariados`;

  return (
    <div>
      {visaoSolicitante && (
        <p className="mb-4 text-body text-ink-3">
          Exibindo modelos inventariados da área{" "}
          <span className="font-semibold text-ink">{currentSolicitante.areaGestora}</span>.
        </p>
      )}

      <IndicatorPanel
        totalLabel="Modelos inventariados"
        total={total}
        groups={groups}
      />

      <FilterBar onSearch={handleSearch} onClear={handleClear}>
        <FilterTextField
          id="inv-filtro-numero"
          label="Nº da solicitação ou do inventário"
          value={draft.numero}
          onChange={(value) => setDraft((f) => ({ ...f, numero: value }))}
          placeholder="Ex.: INV-2026-001"
        />
        {visaoSolicitante ? (
          <ReadOnlyField label="Área gestora" value={currentSolicitante.areaGestora} />
        ) : (
          <FilterSelectField
            id="inv-filtro-area"
            label="Área gestora"
            value={draft.areaGestora}
            onChange={(value) => setDraft((f) => ({ ...f, areaGestora: value }))}
            options={areaGestoraFilterOptions}
          />
        )}
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
          id="inv-filtro-monitoramento"
          label="Monitoramento 2ª Linha (GEVAM)"
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
