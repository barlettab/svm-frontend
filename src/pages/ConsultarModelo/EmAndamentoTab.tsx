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
import { StatCard } from "../../components/ui/StatCard";
import { Table, type TableColumn } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/Badge";
import { InlineAlert } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import type { Solicitacao } from "../../types";
import { type AcaoSolicitacao } from "./SolicitacaoDetalhePage";

interface Filters {
  /** "Todos" ou um status em andamento (como o perfil o vê). */
  status: string;
  numero: string;
  areaGestora: string;
  nomeModelo: string;
  assunto: string;
  analista: string;
}

const TODOS = "Todos";

const DEFAULT_FILTERS: Filters = {
  status: TODOS,
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

/** Opções do filtro "Status da solicitação" (iguais para os três perfis; o solicitante também vê "Aguardando gestor"). */
const OPCOES_STATUS: string[] = [TODOS, "Submetido", "Em análise", "Em complementação", "Aguardando gestor"];

function matches(solicitacao: Solicitacao, filters: Filters) {
  if (filters.status !== TODOS && solicitacao.status !== filters.status) return false;
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
    () => todas.filter((s) => s.status !== "Validado" && s.status !== "Cancelado"),
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
  // Ao trocar de perfil, os filtros voltam ao padrão.
  const [perfilDosFiltros, setPerfilDosFiltros] = useState(profile);
  if (profile !== perfilDosFiltros) {
    setPerfilDosFiltros(profile);
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }

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

  const filtered = useMemo(
    () => visibleSolicitacoes.filter((s) => matches(s, applied)),
    [visibleSolicitacoes, applied],
  );

  /** Card de status = atalho do filtro "Status da solicitação" (aplica na hora; clicar de novo limpa). */

  function handleSearch() {
    setApplied(draft);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }

  const columns: TableColumn<Solicitacao>[] = [
    { header: "Nº da solicitação", render: (row) => row.numero },
    { header: "Nome do modelo", render: (row) => row.nomeModelo },
    // O solicitante só vê a área dele (já indicada acima da lista): a coluna sairia repetida.
    ...(isSolicitante ? [] : [{ header: "Área gestora", render: (row: Solicitacao) => row.areaGestora }]),
    { header: "Assunto", render: (row) => row.assunto },
    { header: "Solicitante", render: (row) => row.solicitante },
    { header: "Data da submissão", render: (row) => formatDate(row.dataSubmissao) },
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
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" icon="eye" onClick={() => onAbrir(row.numero)} className="h-[34px] px-3">
            Abrir
          </Button>
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
          />
          <StatCard
            label="Em análise"
            value={counts["Em análise"]}
          />
          <StatCard
            label="Em complementação"
            value={counts["Em complementação"]}
          />
          <StatCard
            label="Aguardando gestor"
            value={counts["Aguardando gestor"]}
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
              ? "Existe 1 solicitação que exige complementação"
              : `Existem ${pendentesComplementacao.length} solicitações que exigem complementação`
          }
        >
          <p>
            É preciso que o solicitante envie a complementação para dar continuidade à análise do especialista. Abra a
            solicitação e use <b className="text-ink">Ações &gt; Responder complementação</b>.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {pendentesComplementacao.map((s) => (
              <li key={s.numero}>
                <span className="font-semibold text-ink">{s.numero}</span> · {s.nomeModelo}
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
          placeholder="Ex.: 201"
        />
        <FilterSelectField
          id="filtro-status"
          label="Status da solicitação"
          value={draft.status}
          onChange={(value) => setDraft((f) => ({ ...f, status: value }))}
          options={OPCOES_STATUS}
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

    </div>
  );
}
