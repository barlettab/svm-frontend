import { useEffect, useState, type ReactNode } from "react";
import { useProfile } from "../../context/ProfileContext";
import { useSolicitacoes } from "../../context/SolicitacoesContext";
import { currentUserNameByProfile } from "../../data/currentUser";
import { PageHeader } from "../../components/layout/PageHeader";
import { Panel } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/Badge";
import { InlineAlert } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import { Icon, type IconName } from "../../components/ui/Icon";
import { FileUpload } from "../../components/ui/FileUpload";
import { TextareaField } from "../../components/ui/TextareaField";
import { RadioGroupField } from "../../components/ui/RadioGroupField";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { Toast } from "../../components/ui/Toast";
import { cx } from "../../components/ui/cx";
import type { Solicitacao } from "../../types";
import { formatDate } from "./formatDate";
import { HistoricoEArquivos, Info } from "./DetalheComum";
import { AbaInformacoesModelo } from "./AbasDadosModelo";
import { FormAtualizacao } from "./FormAtualizacao";
import { AbaCalculoTier } from "./AbaCalculoTier";
import { AbaMatrizRisco } from "./AbaMatrizRisco";
import { FichaModeloModal } from "./FichaModeloModal";
import { calcularPontuacao, tierDaPontuacao, ultimos } from "../../components/modelo/tier";
import { ActionMenu, type ActionMenuItem } from "../../components/ui/ActionMenu";
import { Tabs } from "../../components/ui/Tabs";
import { pendenciasParaGestor } from "../../components/modelo/dadosModelo";
import {
  analistaPodeAgir as podeAgir,
  analistaPodeCancelar,
  dataAtribuicao,
  gestorPodeCancelar,
  dataFinalizacaoAnalise,
  emAvaliacaoPreliminar,
  gestorGevam,
  tempoAnaliseDias,
  gestorPodeAtribuir,
  solicitantePodeAlterar,
  solicitantePodeCancelar,
  statusParaPerfil,
} from "./fluxo";
import { FormAlterarSolicitacao } from "./FormAlterarSolicitacao";
import { SelectField } from "../../components/ui/SelectField";
import { analistaOptions } from "../../data/filterOptions";

const VAZIO = "—";

type AbaDetalhe = "solicitacao" | "calculo-tier" | "matriz-risco" | "informacoes-modelo";

const ABAS: { key: AbaDetalhe; label: string }[] = [
  { key: "solicitacao", label: "Status de Acompanhamento" },
  { key: "calculo-tier", label: "Cálculo do Tier" },
  { key: "matriz-risco", label: "Matriz de Risco" },
  { key: "informacoes-modelo", label: "Informações do Modelo" },
];

const ABA_POR_PENDENCIA: Record<string, AbaDetalhe> = {
  "Cálculo do Tier": "calculo-tier",
  "Matriz de Risco": "matriz-risco",
  "Informações do Modelo": "informacoes-modelo",
};

/** Ação que a página já abre aberta (atalhos do menu Ações da lista). */
export type AcaoSolicitacao =
  | "pedir"
  | "atualizar"
  | "cancelar"
  | "enviar-gestor"
  | "validar"
  | "alterar"
  | "atribuir";

function ultimoPedido(s: Solicitacao) {
  return [...s.timeline].reverse().find((e) => e.tipo === "complementacao-pedida");
}

/** Bloco do painel "Informações da solicitação": subtítulo + grade de campos. */
function GrupoInfo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 text-body font-semibold text-ink">{titulo}</h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">{children}</dl>
    </section>
  );
}

/** Caixa com o texto de um pedido: autor, data, texto e anexo. */
function Recado({
  tone,
  autor,
  data,
  texto,
  anexo,
  onAnexo,
}: {
  tone: "warning" | "info";
  autor: string;
  data?: string;
  texto?: string;
  anexo?: string;
  onAnexo: (nome: string) => void;
}) {
  return (
    <div
      className={cx(
        "rounded-svm border px-4 py-3",
        tone === "warning" ? "border-warning-line bg-warning-bg" : "border-info-line bg-info-bg",
      )}
    >
      <p className="text-aux text-ink-2">
        {autor}
        {data && ` · ${formatDate(data)}`}
      </p>
      {texto && <p className="mt-1.5 whitespace-pre-line text-body text-ink">{texto}</p>}
      {anexo && (
        <button
          type="button"
          onClick={() => onAnexo(anexo)}
          className="mt-2 inline-flex items-center gap-1.5 text-body font-semibold text-primary hover:underline"
        >
          <Icon name="paperclip" size={15} />
          {anexo}
        </button>
      )}
    </div>
  );
}

/** Formulário padrão de encaminhamento: anexo obrigatório + observações opcionais. */
function FormEncaminhamento({
  id,
  titulo,
  explicacao,
  placeholder,
  hint,
  anexoLabel,
  anexoHint,
  botao,
  icon,
  onEnviar,
  onCancelar,
}: {
  id: string;
  titulo: string;
  explicacao: ReactNode;
  placeholder: string;
  hint: string;
  anexoLabel: string;
  anexoHint: string;
  botao: string;
  icon: IconName;
  onEnviar: (anexo: string, texto?: string) => void;
  onCancelar: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [anexo, setAnexo] = useState<File | null>(null);
  const [erro, setErro] = useState<string>();

  function enviar() {
    if (!anexo) {
      setErro("Anexe o arquivo para enviar.");
      return;
    }
    onEnviar(anexo.name, texto.trim() || undefined);
  }

  return (
    <Panel title={titulo} className="border-info-line">
      <div className="flex flex-col gap-5">
        <p className="text-body text-ink-2">{explicacao}</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FileUpload
            id={`${id}-anexo`}
            label={anexoLabel}
            required
            file={anexo}
            onChange={(f) => {
              setAnexo(f);
              if (f) setErro(undefined);
            }}
            error={erro}
            hint={anexoHint}
          />
          <TextareaField
            id={`${id}-texto`}
            label="Observações (opcional)"
            value={texto}
            onChange={setTexto}
            placeholder={placeholder}
            rows={5}
            maxLength={1000}
            hint={hint}
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="primary" icon={icon} onClick={enviar}>
            {botao}
          </Button>
        </div>
      </div>
    </Panel>
  );
}

interface SolicitacaoDetalhePageProps {
  numero: string;
  acaoInicial?: AcaoSolicitacao;
  onVoltar: () => void;
}

export function SolicitacaoDetalhePage({ numero, acaoInicial, onVoltar }: SolicitacaoDetalhePageProps) {
  const { profile } = useProfile();
  const {
    solicitacoes,
    pedirComplementacao,
    enviarComplementacao,
    enviarParaGestor,
    validar,
    calcularTier,
    salvarInformacoesModelo,
    registrarMatrizRisco,
    recalcularTier,
    assumirAnalise,
    atualizarSolicitacao,
    cancelar,
    atribuirAnalista,
    alterarSolicitacao,
  } = useSolicitacoes();
  const s = solicitacoes.find((x) => x.numero === numero);
  const isSolicitante = profile === "solicitante";
  const usuario = currentUserNameByProfile[profile];

  /** Atalho "Enviar para o gestor" da lista só abre o formulário se a análise estiver completa. */
  const bloqueadoNoInicio =
    acaoInicial === "enviar-gestor" && !!s && (emAvaliacaoPreliminar(s) || pendenciasParaGestor(s).length > 0);

  // Analista abriu uma solicitação Submetido: ela passa a ser dele, Em análise.
  const assumir = profile === "analista" && s?.status === "Submetido";
  useEffect(() => {
    if (assumir) assumirAnalise(numero, usuario);
  }, [assumir, assumirAnalise, numero, usuario]);

  const [acao, setAcao] = useState<AcaoSolicitacao | null>(bloqueadoNoInicio ? null : (acaoInicial ?? null));
  const [aba, setAba] = useState<AbaDetalhe>("solicitacao");
  const [fichaAberta, setFichaAberta] = useState(false);
  /** Analista tentou enviar ao gestor com abas pendentes. */
  const [tentouEnviar, setTentouEnviar] = useState(bloqueadoNoInicio);
  const [toast, setToast] = useState<{ message: string; detail?: string; tone?: "success" | "info" } | null>(
    assumir ? { tone: "info", message: "Solicitação atribuída a você.", detail: "Ela agora está Em análise." } : null,
  );

  // Cancelamento
  const [justificativa, setJustificativa] = useState("");
  const [justificativaErro, setJustificativaErro] = useState<string>();

  // Atribuição (gestor)
  const [analistaEscolhido, setAnalistaEscolhido] = useState("");
  const [analistaErro, setAnalistaErro] = useState<string>();

  // Resposta do solicitante
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [observacao, setObservacao] = useState("");
  const [arquivoErro, setArquivoErro] = useState<string>();

  // Popup de validação
  const [inventariar, setInventariar] = useState("");
  const [monitorar, setMonitorar] = useState("");
  const [validarErro, setValidarErro] = useState<{ inv?: string; mon?: string }>({});

  const crumbs = [{ label: "Consultar modelos", onClick: onVoltar }, { label: "Em andamento", onClick: onVoltar }, { label: numero }];

  if (!s) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Solicitação não encontrada" crumbs={crumbs} onBack={onVoltar} />
        <EmptyState
          title={`Não encontramos a solicitação ${numero}.`}
          description="Ela pode ter sido cancelada ou concluída. Volte para a lista e tente novamente."
          action={<Button variant="secondary" onClick={onVoltar}>Voltar para a lista</Button>}
        />
      </div>
    );
  }

  const analistaPodeAgir = profile === "analista" && podeAgir(s, usuario);
  const preliminar = emAvaliacaoPreliminar(s);
  const comOutroAnalista =
    profile === "analista" && s.status === "Em análise" && s.analistaResponsavel !== usuario;
  const gestorPodeDecidir = profile === "gestor" && s.status === "Aguardando gestor";
  const solicitantePodeResponder = isSolicitante && s.status === "Em complementação";
  const podeCancelar =
    (profile === "analista" && analistaPodeCancelar(s, usuario)) ||
    (profile === "gestor" && gestorPodeCancelar(s)) ||
    (isSolicitante && solicitantePodeCancelar(s));
  const podeAlterar = isSolicitante && solicitantePodeAlterar(s);
  const podeAtribuir = profile === "gestor" && gestorPodeAtribuir(s);
  const pedidoAtual = ultimoPedido(s);
  const statusVisto = statusParaPerfil(s.status, profile);
  const pendencias = pendenciasParaGestor(s);
  const { calculo, recalculo } = ultimos(s.calculosTier);
  const tierAtual = recalculo ?? calculo;
  const matrizAtual = s.matrizesRisco?.[s.matrizesRisco.length - 1];
  const atribuidaEm = dataAtribuicao(s);
  const finalizadaEm = dataFinalizacaoAnalise(s);
  const diasAnalise = tempoAnaliseDias(s);

  function abrirAcao(a: AcaoSolicitacao) {
    setAba("solicitacao");
    setAcao(a);
  }

  function confirmarCancelamento() {
    if (!s) return;
    if (!justificativa.trim()) {
      setJustificativaErro("Informe o motivo do cancelamento.");
      return;
    }
    cancelar(s.numero, {
      justificativa: justificativa.trim(),
      autor: usuario,
      por: profile,
    });
    setAcao(null);
    setToast({ message: "Solicitação cancelada.", detail: "Ela agora aparece na aba Cancelado." });
  }

  function confirmarAtribuicao() {
    if (!s) return;
    if (!analistaEscolhido) {
      setAnalistaErro("Escolha o analista.");
      return;
    }
    atribuirAnalista(s.numero, { analista: analistaEscolhido, autor: usuario });
    setAcao(null);
    setToast({ message: "Solicitação atribuída.", detail: `${analistaEscolhido} agora é o analista responsável.` });
  }

  function tentarEnviarParaGestor() {
    setAba("solicitacao");
    if (pendencias.length > 0) {
      setTentouEnviar(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAcao("enviar-gestor");
  }

  const abrirAnexo = (nome: string) =>
    setToast({ tone: "info", message: `Download de "${nome}"`, detail: "No protótipo o arquivo não é baixado." });

  function enviarResposta() {
    if (!s) return;
    if (!arquivo) {
      setArquivoErro("Anexe o documento solicitado pelo analista para enviar a complementação.");
      return;
    }
    enviarComplementacao(s.numero, { arquivo: arquivo.name, observacao: observacao.trim() || undefined, autor: usuario });
    setArquivo(null);
    setObservacao("");
    setToast({ message: "Complementação enviada.", detail: `A solicitação voltou para Em análise com ${s.analistaResponsavel}.` });
  }

  function abrirValidacao() {
    setInventariar("");
    setMonitorar("");
    setValidarErro({});
    setAcao("validar");
  }

  function confirmarValidacao() {
    if (!s) return;
    const erros = {
      inv: inventariar ? undefined : "Escolha Sim ou Não.",
      mon: monitorar ? undefined : "Escolha Sim ou Não.",
    };
    if (erros.inv || erros.mon) {
      setValidarErro(erros);
      return;
    }
    const inv = validar(s.numero, { inventariado: inventariar === "Sim", monitorado: monitorar === "Sim", autor: usuario });
    setAcao(null);
    setToast({
      message: "Solicitação validada e finalizada.",
      detail: inv ? `Modelo incluído no inventário (${inv}).` : "O modelo não foi incluído no inventário.",
    });
  }

  const itemCancelar: ActionMenuItem = {
    key: "cancelar",
    label: "Cancelar solicitação",
    icon: "trash",
    danger: true,
    separated: true,
    description: "Encerra a solicitação. A justificativa fica visível para todos.",
  };

  // ── Ações do analista: menu "Ações" na aba Status de Acompanhamento ──
  // Fora de Submetido/Em análise (ex.: Em complementação) o analista responsável só pode cancelar.
  const acoesAnalista: ActionMenuItem[] = !analistaPodeAgir
    ? [{ ...itemCancelar, separated: false }]
    : preliminar
    ? [
        {
          key: "atualizar",
          label: "Atualizar solicitação",
          icon: "upload",
          description: "Relatório ok: registre o TAP sem pendências e libere a análise.",
        },
        {
          key: "pedir",
          label: "Pedir complementação",
          icon: "doc",
          description: "Relatório com pendências: envie o TAP com as pendências ao solicitante.",
        },
        itemCancelar,
      ]
    : [
        {
          key: "atualizar",
          label: "Atualizar solicitação",
          icon: "upload",
          description: "Registre documentos ou informações recebidos por outros meios.",
        },
        {
          key: "pedir",
          label: "Pedir complementação",
          icon: "doc",
          description: "Peça esclarecimentos ou informações ao solicitante.",
        },
        {
          key: "enviar-gestor",
          label: "Enviar para o gestor",
          icon: "chev-right",
          description: pendencias.length
            ? `Antes, preencha ${pendencias.join(", ")}.`
            : "Peça o aval do gestor para finalizar a validação.",
        },
        itemCancelar,
      ];

  // ── Ações do solicitante ─────────────────────────────────────────────────
  const acoesSolicitante: ActionMenuItem[] = [
    {
      key: "alterar",
      label: "Editar solicitação",
      icon: "edit",
      description: "Corrija os dados enquanto nenhum analista assumiu.",
      disabled: !podeAlterar,
      disabledReason: "Só é possível editar enquanto nenhum analista assumiu (status Submetido).",
    },
    { ...itemCancelar, description: "Desista da solicitação. Informe o motivo." },
  ];

  // ── Ações do gestor fora da decisão ──────────────────────────────────────
  const acoesGestor: ActionMenuItem[] = [
    {
      key: "atribuir",
      label: s.status === "Submetido" ? "Atribuir a um analista" : "Reatribuir analista",
      icon: "user",
      description:
        s.status === "Submetido"
          ? "A solicitação passa para Em análise com o analista escolhido."
          : `Hoje com ${s.analistaResponsavel}.`,
    },
    { ...itemCancelar, description: "Encerra a solicitação. Informe o motivo." },
  ];

  const menu: ActionMenuItem[] =
    profile === "analista"
      ? analistaPodeAgir || podeCancelar
        ? acoesAnalista
        : []
      : isSolicitante
        ? podeCancelar
          ? acoesSolicitante
          : []
        : podeAtribuir || podeCancelar
          ? acoesGestor
          : [];

  function escolherAcao(key: string) {
    if (key === "enviar-gestor") tentarEnviarParaGestor();
    else abrirAcao(key as AcaoSolicitacao);
  }

  // ── Ações do cabeçalho (gestor) ──────────────────────────────────────────
  let headerActions: ReactNode;
  if (gestorPodeDecidir) {
    headerActions = (
      <Button variant="primary" icon="check" onClick={abrirValidacao}>
        Finalizar validação
      </Button>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={s.nomeModelo}
        description={`Solicitação ${s.numero}`}
        crumbs={crumbs}
        onBack={onVoltar}
        actions={headerActions}
      />

      {comOutroAnalista && (
        <InlineAlert tone="info" title={`Esta solicitação está em análise com ${s.analistaResponsavel}.`}>
          <p>Só o analista responsável pode agir sobre ela.</p>
        </InlineAlert>
      )}

      {/* ── Pendências para enviar ao gestor (analista) ───────────────────── */}
      {analistaPodeAgir && !preliminar && pendencias.length > 0 && (
        <InlineAlert
          tone={tentouEnviar ? "warning" : "info"}
          title={
            tentouEnviar
              ? "Preencha as abas pendentes para enviar ao gestor"
              : "Para enviar ao gestor, preencha as abas abaixo"
          }
        >
          <p>
            Falta preencher:{" "}
            {pendencias.map((p, i) => (
              <span key={p}>
                {i > 0 && (i === pendencias.length - 1 ? " e " : ", ")}
                <button
                  type="button"
                  onClick={() => setAba(ABA_POR_PENDENCIA[p])}
                  className="font-semibold text-primary hover:underline"
                >
                  {p}
                </button>
              </span>
            ))}
            .
          </p>
        </InlineAlert>
      )}

      {!isSolicitante && (
        <div className="mb-6">
          <Tabs
            items={ABAS.map((a) => ({ ...a, disabled: a.key !== "solicitacao" && preliminar }))}
            activeKey={aba}
            onChange={setAba}
          />
          {preliminar && (
            <p className="mt-2 text-aux text-ink-3">
              {analistaPodeAgir
                ? "Cálculo do Tier, Matriz de Risco e Informações do Modelo são liberadas quando você emitir o TAP: sem pendências em Ações › Atualizar solicitação, ou com pendências em Ações › Pedir complementação."
                : "Cálculo do Tier, Matriz de Risco e Informações do Modelo são liberadas quando o analista emitir o TAP."}
            </p>
          )}
        </div>
      )}

      {aba === "calculo-tier" && (
        <AbaCalculoTier
          key={s.calculosTier?.length ?? 0}
          informacoes={s.informacoesAdicionais}
          calculos={s.calculosTier}
          editavel={analistaPodeAgir}
          onCalcular={(parametros) => {
            calcularTier(s.numero, { parametros, autor: usuario });
            const pontos = calcularPontuacao(parametros);
            setToast({
              message: "Tier calculado.",
              detail: `${pontos} pontos · ${tierDaPontuacao(pontos)}.${s.matrizesRisco?.length ? "" : " Siga com a Matriz de Risco."}`,
            });
          }}
          onRecalcular={(dados) => {
            recalcularTier(s.numero, { ...dados, autor: usuario });
            setToast({ message: "Tier recalculado.", detail: "O recálculo foi registrado no histórico." });
          }}
        />
      )}

      {aba === "matriz-risco" && (
        <AbaMatrizRisco
          key={`${s.matrizesRisco?.length ?? 0}-${tierAtual?.tier ?? ""}`}
          registros={s.matrizesRisco}
          tierCalculado={tierAtual?.tier}
          editavel={analistaPodeAgir}
          onRegistrar={(dados) => {
            const primeira = !s.matrizesRisco?.length;
            registrarMatrizRisco(s.numero, { ...dados, autor: usuario });
            const faltando = pendenciasParaGestor({ ...s, matrizesRisco: [dados] });
            if (primeira && faltando.includes("Informações do Modelo")) setAba("informacoes-modelo");
            setToast({
              message: primeira ? "Matriz de Risco calculada." : "Matriz de Risco recalculada.",
              detail: faltando.length
                ? `Falta preencher: ${faltando.join(", ")}.`
                : "Tudo preenchido. Você já pode enviar para o gestor.",
            });
          }}
        />
      )}

      {aba === "informacoes-modelo" && (
        <AbaInformacoesModelo
          dados={s.informacoesModelo}
          editavel={analistaPodeAgir}
          acoes={
            <Button variant="secondary" icon="download" onClick={() => setFichaAberta(true)}>
              Gerar ficha do modelo
            </Button>
          }
          onVoltar={() => setAba("matriz-risco")}
          onSalvar={(dados) => {
            salvarInformacoesModelo(s.numero, dados);
            const faltando = pendenciasParaGestor({ ...s, informacoesModelo: dados });
            setAba("solicitacao");
            setToast({
              message: "Informações do Modelo salvas.",
              detail: faltando.length
                ? `Falta preencher: ${faltando.join(", ")}.`
                : "Tudo preenchido. Você já pode enviar para o gestor ou gerar a ficha do modelo.",
            });
          }}
        />
      )}

      <div className={cx("flex flex-col gap-5", aba !== "solicitacao" && "hidden")}>
        {/* ── Ações do analista ──────────────────────────────────────────── */}
        {menu.length > 0 && !acao && (
          <div className="flex justify-end">
            <ActionMenu
              items={menu}
              onSelect={(key) => {
                if (key === "atribuir") {
                  setAnalistaEscolhido("");
                  setAnalistaErro(undefined);
                }
                escolherAcao(key);
              }}
              ariaLabel={`Ações da solicitação ${s.numero}`}
            />
          </div>
        )}

        {/* ── Finalizada ─────────────────────────────────────────────────── */}
        {s.status === "Validada" && s.conclusao && (
          <Panel title="Solicitação finalizada" className="border-success-line">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Resultado">
                <StatusBadge status="Validada" />
              </Info>
              <Info label="Validada por">
                {s.conclusao.gestor} · {formatDate(s.conclusao.data)}
              </Info>
              <Info label="Inventariado">
                {s.conclusao.inventariado ? `Sim · ${s.conclusao.numeroInventario}` : "Não"}
              </Info>
              <Info label="Monitorado">{s.conclusao.monitorado ? "Sim" : "Não"}</Info>
            </dl>
          </Panel>
        )}

        {/* ── Cancelada ──────────────────────────────────────────────────── */}
        {s.status === "Cancelada" && s.cancelamento && (
          <Panel
            title={`Solicitação cancelada pelo ${s.cancelamento.por === "gestor" ? "gestor GEVAM" : s.cancelamento.por}`}
            className="border-line-strong"
          >
            <div className="flex flex-col gap-3">
              <p className="text-aux text-ink-2">
                Justificativa de {s.cancelamento.autor} · {formatDate(s.cancelamento.data)}
              </p>
              <p className="whitespace-pre-line text-body text-ink">{s.cancelamento.justificativa}</p>
            </div>
          </Panel>
        )}

        {/* ── Atualizar solicitação (analista) ───────────────────────────── */}
        {analistaPodeAgir && acao === "atualizar" && (
          <FormAtualizacao
            preliminar={preliminar}
            onCancelar={() => setAcao(null)}
            onConfirmar={(dados) => {
              atualizarSolicitacao(s.numero, { ...dados, autor: usuario });
              setAcao(null);
              if (dados.tapSemPendencias) {
                setAba("calculo-tier");
                setToast({ message: "Solicitação atualizada.", detail: "TAP registrado. Siga com o Cálculo do Tier." });
              } else {
                setToast({ message: "Solicitação atualizada.", detail: "A atualização foi registrada no histórico." });
              }
            }}
          />
        )}

        {/* ── Editar solicitação (solicitante, enquanto Submetido) ────────── */}
        {podeAlterar && acao === "alterar" && (
          <FormAlterarSolicitacao
            solicitacao={s}
            onCancelar={() => setAcao(null)}
            onConfirmar={(campos, novoRelatorio) => {
              alterarSolicitacao(s.numero, { campos, novoRelatorio, autor: usuario });
              setAcao(null);
              setToast({
                message: "Solicitação editada.",
                detail: novoRelatorio
                  ? "Relatório de desenvolvimento substituído. A edição foi registrada no histórico."
                  : "A edição foi registrada no histórico.",
              });
            }}
          />
        )}

        {/* ── Atribuir analista (gestor) ─────────────────────────────────── */}
        {podeAtribuir && acao === "atribuir" && (
          <Panel title={s.status === "Submetido" ? "Atribuir a um analista" : "Reatribuir analista"} className="border-info-line">
            <div className="flex flex-col gap-5">
              <p className="text-body text-ink-2">
                {s.status === "Submetido" ? (
                  <>
                    A solicitação passa para <b className="text-ink">Em análise</b> com o analista escolhido.
                  </>
                ) : (
                  <>
                    Hoje com <b className="text-ink">{s.analistaResponsavel}</b>. O status não muda; só o analista
                    responsável.
                  </>
                )}
              </p>
              <div className="max-w-sm">
                <SelectField
                  id="atribuir-analista"
                  label="Analista"
                  required
                  value={analistaEscolhido}
                  onChange={(v) => {
                    setAnalistaEscolhido(v);
                    setAnalistaErro(undefined);
                  }}
                  options={analistaOptions.filter((a) => a !== s.analistaResponsavel)}
                  error={analistaErro}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
                <Button variant="secondary" onClick={() => setAcao(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" icon="user" onClick={confirmarAtribuicao}>
                  Atribuir
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Cancelar solicitação (analista responsável ou solicitante) ─── */}
        {podeCancelar && acao === "cancelar" && (
          <Panel title="Cancelar solicitação" className="border-error-line">
            <div className="flex flex-col gap-5">
              <p className="text-body text-ink-2">
                A solicitação sai de Em andamento e vai para a aba <b className="text-ink">Cancelado</b>.{" "}
                {isSolicitante
                  ? "A GEVAM verá a sua justificativa."
                  : `${s.solicitante} verá a justificativa.`}{" "}
                Esta ação não pode ser desfeita.
              </p>
              <TextareaField
                id="cancelar-justificativa"
                label="Justificativa"
                required
                value={justificativa}
                onChange={(v) => {
                  setJustificativa(v);
                  setJustificativaErro(undefined);
                }}
                placeholder={
                  isSolicitante
                    ? "Ex.: O modelo foi descontinuado pela área."
                    : "Ex.: Resultado da validação desfavorável."
                }
                rows={4}
                maxLength={1000}
                error={justificativaErro}
              />
              <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
                <Button variant="secondary" onClick={() => setAcao(null)}>
                  Voltar
                </Button>
                <Button variant="danger" icon="trash" onClick={confirmarCancelamento}>
                  Cancelar solicitação
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Aguardando decisão do gestor ───────────────────────────────── */}
        {!isSolicitante && s.status === "Aguardando gestor" && s.encaminhamento && (
          <Panel title={profile === "gestor" ? "Aval solicitado pelo analista" : "Aguardando decisão do gestor"}>
            <div className="flex flex-col gap-3">
              <p className="text-body text-ink">
                Enviada por <b>{s.encaminhamento.autor}</b> em {formatDate(s.encaminhamento.data)}.
              </p>
              {profile === "gestor" && (
                <p className="text-body text-ink-2">
                  Leia os documentos em <b className="text-ink">Arquivos</b> e confira as abas Cálculo do Tier, Matriz de
                  Risco e Informações do Modelo. Em <b className="text-ink">Finalizar validação</b> você dá o aval, decide
                  se o modelo será inventariado e monitorado, e a solicitação fica com status Validada.
                </p>
              )}
            </div>
          </Panel>
        )}

        {/* ── Complementação com o solicitante ───────────────────────────── */}
        {s.status === "Em complementação" && (
          <Panel
            title={isSolicitante ? "O analista pediu uma complementação" : "Aguardando complementação do solicitante"}
            className="border-warning-line"
          >
            <div className="flex flex-col gap-5">
              <Recado
                tone="warning"
                autor={pedidoAtual?.autor ?? s.analistaResponsavel}
                data={pedidoAtual?.data}
                texto={s.complementacao}
                anexo={s.anexoPedidoComplementacao}
                onAnexo={abrirAnexo}
              />
              {solicitantePodeResponder ? (
                <>
                  <p className="text-body text-ink-2">
                    Anexe o documento solicitado e clique em <b className="text-ink">Enviar complementação</b>. A
                    solicitação volta para <b className="text-ink">Em análise</b> com {s.analistaResponsavel}.
                  </p>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FileUpload
                      id="complementacao-anexo"
                      label="Anexo da complementação"
                      required
                      file={arquivo}
                      onChange={(f) => {
                        setArquivo(f);
                        if (f) setArquivoErro(undefined);
                      }}
                      error={arquivoErro}
                    />
                    <TextareaField
                      id="complementacao-observacao"
                      label="Observação para o analista"
                      value={observacao}
                      onChange={setObservacao}
                      rows={4}
                      maxLength={500}
                      hint="Opcional. Até 500 caracteres."
                    />
                  </div>
                  <div className="flex justify-end border-t border-line-soft pt-4">
                    <Button variant="primary" icon="upload" onClick={enviarResposta}>
                      Enviar complementação
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-body text-ink-2">
                  A solicitação volta para <b className="text-ink">Em análise</b> assim que {s.solicitante} enviar o anexo.
                </p>
              )}
            </div>
          </Panel>
        )}

        {/* ── Resposta do solicitante recebida ───────────────────────────── */}
        {!isSolicitante && s.status === "Em análise" && s.respostaComplementacao && (
          <InlineAlert tone="info" title="Complementação recebida do solicitante">
            <p>
              Em {formatDate(s.respostaComplementacao.data)} · anexo{" "}
              <span className="font-semibold text-ink">{s.respostaComplementacao.arquivo}</span>
            </p>
            {s.respostaComplementacao.observacao && <p className="mt-1">“{s.respostaComplementacao.observacao}”</p>}
          </InlineAlert>
        )}

        {/* ── Formulários de ação ────────────────────────────────────────── */}
        {analistaPodeAgir && acao === "pedir" && (
          <FormEncaminhamento
            id="pedido"
            titulo={preliminar ? "Enviar TAP com pendências ao solicitante" : "Pedir complementação ao solicitante"}
            explicacao={
              preliminar ? (
                <>
                  Anexe o <b className="text-ink">TAP com as pendências</b> do relatório de desenvolvimento. Ele fica
                  registrado como o TAP da solicitação (não é preciso emitir outro) e as abas de análise são liberadas. A
                  solicitação passa para <b className="text-ink">Em complementação</b> e volta para{" "}
                  <b className="text-ink">Em análise</b> quando {s.solicitante} responder.
                </>
              ) : (
                <>
                  O pedido vai para <b className="text-ink">{s.solicitante}</b>. A solicitação passa para{" "}
                  <b className="text-ink">Em complementação</b> e volta para <b className="text-ink">Em análise</b>{" "}
                  quando o solicitante enviar o anexo.
                </>
              )
            }
            placeholder="Ex.: Preencher a planilha anexa com os resultados de backtesting do último trimestre."
            hint="O solicitante verá exatamente este texto, junto com o anexo."
            anexoLabel={preliminar ? "TAP com pendências" : "Anexo para o solicitante"}
            anexoHint={
              preliminar
                ? "TAP com as pendências apontadas. PDF, DOC, XLSX ou CSV até 20 MB"
                : "Documento com o pedido, planilha a preencher ou parecer. PDF, DOC, XLSX ou CSV até 20 MB"
            }
            botao={preliminar ? "Enviar TAP" : "Enviar pedido"}
            icon="doc"
            onCancelar={() => setAcao(null)}
            onEnviar={(anexo, texto) => {
              pedirComplementacao(s.numero, { texto, anexo, autor: usuario, tapComPendencias: preliminar });
              setAcao(null);
              setToast(
                preliminar
                  ? { message: "TAP com pendências enviado.", detail: `${s.solicitante} precisa resolver as pendências. As abas de análise estão liberadas.` }
                  : { message: "Complementação solicitada.", detail: `${s.solicitante} precisa enviar o anexo.` },
              );
            }}
          />
        )}

        {analistaPodeAgir && acao === "enviar-gestor" && !preliminar && pendencias.length === 0 && (
          <Panel title="Enviar para o gestor" className="border-info-line">
            <div className="flex flex-col gap-5">
              <p className="text-body text-ink-2">
                Você está pedindo o <b className="text-ink">aval do gestor</b>. A solicitação passa para{" "}
                <b className="text-ink">Aguardando gestor</b>; o gestor lê os documentos e as abas e finaliza a validação,
                decidindo se o modelo será inventariado e monitorado. Não é preciso anexar nada.
              </p>
              <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
                <Button variant="secondary" onClick={() => setAcao(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  icon="chev-right"
                  onClick={() => {
                    enviarParaGestor(s.numero, { autor: usuario });
                    setAcao(null);
                    setToast({ message: "Enviada para o gestor.", detail: "A solicitação está Aguardando gestor." });
                  }}
                >
                  Enviar para o gestor
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Informações da solicitação ────────────────────────────────── */}
        <Panel title="Informações da solicitação">
          <div className="flex flex-col divide-y divide-line-soft [&>section]:py-5 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0">
            <GrupoInfo titulo="Solicitação">
              <Info label="Nº da solicitação">{s.numero}</Info>
              <Info label="Status">
                <StatusBadge status={statusVisto} />
              </Info>
              <Info label="Solicitante">{s.solicitante}</Info>
              <Info label="Data da submissão">{formatDate(s.dataSubmissao)}</Info>
            </GrupoInfo>

            <GrupoInfo titulo="Modelo">
              <Info label="Nome do modelo">{s.nomeModelo}</Info>
              <Info label="Tipo de modelo">{s.tipoModelo ?? VAZIO}</Info>
              <Info label="Assunto">{s.assunto}</Info>
              <Info label="Tier">
                {tierAtual ? (
                  `${tierAtual.tier} · ${tierAtual.resultado} pontos`
                ) : (
                  <span className="text-ink-3">Aguardando cálculo</span>
                )}
              </Info>
              <Info label="Área gestora">{s.areaGestora}</Info>
              <Info label="Público">{s.publico}</Info>
              {s.objetivo && (
                <Info label="Objetivo" wide>
                  {s.objetivo}
                </Info>
              )}
            </GrupoInfo>

            <GrupoInfo titulo="Análise GEVAM">
              <Info label="Analista responsável">{s.analistaResponsavel}</Info>
              <Info label="Data da atribuição">{atribuidaEm ? formatDate(atribuidaEm) : VAZIO}</Info>
              <Info label="Data de finalização da análise">{finalizadaEm ? formatDate(finalizadaEm) : VAZIO}</Info>
              <Info label="Tempo de análise">
                {diasAnalise === undefined ? VAZIO : `${diasAnalise} ${diasAnalise === 1 ? "dia" : "dias"}`}
                {diasAnalise !== undefined && !finalizadaEm && s.status !== "Cancelada" && (
                  <span className="text-ink-3"> (em andamento)</span>
                )}
              </Info>
              <Info label="Gestor GEVAM">{gestorGevam(s) ?? VAZIO}</Info>
            </GrupoInfo>
          </div>
        </Panel>

        {/* ── Histórico + arquivos ──────────────────────────────────────── */}
        <HistoricoEArquivos timeline={s.timeline} onAbrirAnexo={abrirAnexo} />
      </div>

      {/* ── Popup de validação (gestor) ──────────────────────────────────── */}
      <Modal
        open={gestorPodeDecidir && acao === "validar"}
        title="Finalizar validação"
        onClose={() => setAcao(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAcao(null)}>
              Cancelar
            </Button>
            <Button variant="primary" icon="check" onClick={confirmarValidacao}>
              Finalizar validação
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-body text-ink-2">
            <b className="text-ink">{s.numero}</b> · {s.nomeModelo} fica com status <b className="text-ink">Validada</b> e
            sai da lista Em andamento.
          </p>
          {matrizAtual && (
            <p className="rounded-svm border border-line-soft bg-surface-alt px-4 py-3 text-body text-ink-2">
              Matriz de Risco do analista: <b className="text-ink">{matrizAtual.tier}</b> · nota{" "}
              <b className="text-ink">{matrizAtual.nota}</b> · classificação de risco{" "}
              <b className="text-ink">{matrizAtual.classificacaoRisco}</b>
            </p>
          )}
          <RadioGroupField
            id="validar-inventariar"
            label="O modelo será inventariado?"
            required
            options={["Sim", "Não"]}
            value={inventariar}
            onChange={(v) => {
              setInventariar(v);
              setValidarErro((e) => ({ ...e, inv: undefined }));
            }}
            error={validarErro.inv}
            fullWidth
          />
          <RadioGroupField
            id="validar-monitorar"
            label="O modelo será monitorado?"
            required
            options={["Sim", "Não"]}
            value={monitorar}
            onChange={(v) => {
              setMonitorar(v);
              setValidarErro((e) => ({ ...e, mon: undefined }));
            }}
            error={validarErro.mon}
            fullWidth
          />
          {inventariar === "Sim" && (
            <p className="text-aux text-ink-2">
              O modelo entra na aba Inventariado com resultado Validado
              {monitorar ? ` e monitoramento "${monitorar === "Sim" ? "Em monitoramento" : "Não monitorado"}"` : ""}.
            </p>
          )}
        </div>
      </Modal>

      <FichaModeloModal solicitacao={s} open={fichaAberta} onClose={() => setFichaAberta(false)} />

      <Toast
        open={toast !== null}
        tone={toast?.tone ?? "success"}
        message={toast?.message ?? ""}
        detail={toast?.detail}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
