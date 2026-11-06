import { useState, type ReactNode } from "react";
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
import type { Profile, Solicitacao, SolicitacaoStatus } from "../../types";
import { formatDate } from "./formatDate";
import { HistoricoEArquivos, Info } from "./DetalheComum";

/** Status em que o analista pode pedir complementação ou enviar para o gestor. */
export const ANALISTA_PODE_AGIR: SolicitacaoStatus[] = ["Submetido", "Em análise"];

/** Ação que a página já abre aberta (atalhos do menu Ações da lista). */
export type AcaoSolicitacao = "pedir" | "enviar-gestor" | "devolver" | "validar";

/** Status internos da GEVAM aparecem como "Em análise" para o solicitante. */
// eslint-disable-next-line react-refresh/only-export-components
export function statusParaPerfil(status: SolicitacaoStatus, profile: Profile): SolicitacaoStatus {
  if (profile === "solicitante" && status === "Aguardando gestor") {
    return "Em análise";
  }
  return status;
}

function ultimoPedido(s: Solicitacao) {
  return [...s.timeline].reverse().find((e) => e.tipo === "complementacao-pedida");
}

/** Caixa com o texto de um pedido/parecer: autor, data, texto e anexo. */
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
  const { solicitacoes, pedirComplementacao, enviarComplementacao, enviarParaGestor, devolverAoAnalista, validar } =
    useSolicitacoes();
  const s = solicitacoes.find((x) => x.numero === numero);

  const isSolicitante = profile === "solicitante";
  const usuario = currentUserNameByProfile[profile];

  const [acao, setAcao] = useState<AcaoSolicitacao | null>(acaoInicial ?? null);
  const [toast, setToast] = useState<{ message: string; detail?: string; tone?: "success" | "info" } | null>(null);

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

  const analistaPodeAgir = profile === "analista" && ANALISTA_PODE_AGIR.includes(s.status);
  const gestorPodeDecidir = profile === "gestor" && s.status === "Aguardando gestor";
  const solicitantePodeResponder = isSolicitante && s.status === "Em complementação";
  const pedidoAtual = ultimoPedido(s);
  const statusVisto = statusParaPerfil(s.status, profile);

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

  // ── Ações do cabeçalho, por perfil ──────────────────────────────────────
  let headerActions: ReactNode;
  if (analistaPodeAgir && !acao) {
    headerActions = (
      <>
        <Button variant="secondary" icon="doc" onClick={() => setAcao("pedir")}>
          Pedir complementação
        </Button>
        <Button variant="primary" icon="chev-right" onClick={() => setAcao("enviar-gestor")}>
          Enviar para o gestor
        </Button>
      </>
    );
  } else if (gestorPodeDecidir && acao !== "devolver") {
    headerActions = (
      <>
        <Button variant="secondary" icon="x" onClick={() => setAcao("devolver")}>
          Recusar
        </Button>
        <Button variant="primary" icon="check" onClick={abrirValidacao}>
          Aceitar
        </Button>
      </>
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

      <div className="flex flex-col gap-5">
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

        {/* ── Gestor recusou a validação ─────────────────────────────────── */}
        {!isSolicitante && s.status === "Em análise" && s.encaminhamento?.tipo === "devolvida-analista" && (
          <Panel title="O gestor recusou a validação" className="border-warning-line">
            <div className="flex flex-col gap-3">
              <Recado
                tone="warning"
                autor={s.encaminhamento.autor}
                data={s.encaminhamento.data}
                texto={s.encaminhamento.texto}
                anexo={s.encaminhamento.anexo}
                onAnexo={abrirAnexo}
              />
              {profile === "analista" && (
                <p className="text-body text-ink-2">
                  Faça os ajustes e clique em <b className="text-ink">Enviar para o gestor</b>. Se precisar de algo do
                  solicitante, use <b className="text-ink">Pedir complementação</b>.
                </p>
              )}
            </div>
          </Panel>
        )}

        {/* ── Aguardando decisão do gestor ───────────────────────────────── */}
        {!isSolicitante && s.status === "Aguardando gestor" && s.encaminhamento?.tipo === "enviada-gestor" && (
          <Panel title={profile === "gestor" ? "Parecer do analista para sua decisão" : "Aguardando decisão do gestor"}>
            <div className="flex flex-col gap-3">
              <Recado
                tone="info"
                autor={s.encaminhamento.autor}
                data={s.encaminhamento.data}
                texto={s.encaminhamento.texto}
                anexo={s.encaminhamento.anexo}
                onAnexo={abrirAnexo}
              />
              {profile === "gestor" && (
                <p className="text-body text-ink-2">
                  <b className="text-ink">Aceitar</b> aprova a validação do analista, finaliza a solicitação com status
                  Validada e pergunta se o modelo será inventariado e monitorado. <b className="text-ink">Recusar</b>{" "}
                  devolve ao analista com o motivo, para ajustes.
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
            titulo="Pedir complementação ao solicitante"
            explicacao={
              <>
                O pedido vai para <b className="text-ink">{s.solicitante}</b>. A solicitação passa para{" "}
                <b className="text-ink">Em complementação</b> e volta para <b className="text-ink">Em análise</b> quando
                o solicitante enviar o anexo.
              </>
            }
            placeholder="Ex.: Preencher a planilha anexa com os resultados de backtesting do último trimestre."
            hint="O solicitante verá exatamente este texto, junto com o anexo."
            anexoLabel="Anexo para o solicitante"
            anexoHint="Documento com o pedido, planilha a preencher ou parecer. PDF, DOC, XLSX ou CSV até 20 MB"
            botao="Enviar pedido"
            icon="doc"
            onCancelar={() => setAcao(null)}
            onEnviar={(anexo, texto) => {
              pedirComplementacao(s.numero, { texto, anexo, autor: usuario });
              setAcao(null);
              setToast({ message: "Complementação solicitada.", detail: `${s.solicitante} precisa enviar o anexo.` });
            }}
          />
        )}

        {analistaPodeAgir && acao === "enviar-gestor" && (
          <FormEncaminhamento
            id="enviar-gestor"
            titulo="Enviar para o gestor"
            explicacao={
              <>
                A solicitação passa para <b className="text-ink">Aguardando gestor</b>. O gestor pode aceitar ou recusar a
                sua validação. Se recusar, volta para você com o motivo.
              </>
            }
            placeholder="Ex.: Testes de desempenho e estabilidade aprovados. Recomendo validar e monitorar trimestralmente."
            hint="Resumo da análise e recomendação para o gestor."
            anexoLabel="Parecer técnico"
            anexoHint="Relatório de validação ou parecer. PDF, DOC, XLSX ou CSV até 20 MB"
            botao="Enviar para o gestor"
            icon="chev-right"
            onCancelar={() => setAcao(null)}
            onEnviar={(anexo, texto) => {
              enviarParaGestor(s.numero, { texto, anexo, autor: usuario });
              setAcao(null);
              setToast({ message: "Enviada para o gestor.", detail: "A solicitação está Aguardando gestor." });
            }}
          />
        )}

        {gestorPodeDecidir && acao === "devolver" && (
          <FormEncaminhamento
            id="devolver"
            titulo="Recusar a validação do analista"
            explicacao={
              <>
                A solicitação volta para <b className="text-ink">{s.analistaResponsavel}</b> com status{" "}
                <b className="text-ink">Em análise</b>. Depois dos ajustes, o analista envia de novo para você.
              </>
            }
            placeholder="Ex.: Incluir a análise de estabilidade por safra no parecer."
            hint="Motivo da recusa. O analista verá exatamente este texto, junto com o anexo."
            anexoLabel="Anexo para o analista"
            anexoHint="Documento com os ajustes pedidos ou comentários. PDF, DOC, XLSX ou CSV até 20 MB"
            botao="Recusar"
            icon="x"
            onCancelar={() => setAcao(null)}
            onEnviar={(anexo, texto) => {
              devolverAoAnalista(s.numero, { texto, anexo, autor: usuario });
              setAcao(null);
              setToast({ message: "Validação recusada.", detail: `Voltou para Em análise com ${s.analistaResponsavel}.` });
            }}
          />
        )}

        {/* ── Informações da solicitação ────────────────────────────────── */}
        <Panel title="Informações da solicitação">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Nome do modelo">{s.nomeModelo}</Info>
            <Info label="Status">
              <StatusBadge status={statusVisto} />
            </Info>
            <Info label="Área gestora">{s.areaGestora}</Info>
            <Info label="Analista responsável">{s.analistaResponsavel}</Info>
            <Info label="Assunto">{s.assunto}</Info>
            <Info label="Público">{s.publico}</Info>
            <Info label="Data da submissão">{formatDate(s.dataSubmissao)}</Info>
            <Info label="Solicitante">{s.solicitante}</Info>
            {s.tipoModelo && <Info label="Tipo de modelo">{s.tipoModelo}</Info>}
            {s.objetivo && (
              <Info label="Objetivo" wide>
                {s.objetivo}
              </Info>
            )}
          </dl>
        </Panel>

        {/* ── Histórico + arquivos ──────────────────────────────────────── */}
        <HistoricoEArquivos timeline={s.timeline} onAbrirAnexo={abrirAnexo} />
      </div>

      {/* ── Popup de validação (gestor) ──────────────────────────────────── */}
      <Modal
        open={gestorPodeDecidir && acao === "validar"}
        title="Aceitar a validação e finalizar"
        onClose={() => setAcao(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAcao(null)}>
              Cancelar
            </Button>
            <Button variant="primary" icon="check" onClick={confirmarValidacao}>
              Aceitar e finalizar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-body text-ink-2">
            <b className="text-ink">{s.numero}</b> · {s.nomeModelo} fica com status <b className="text-ink">Validada</b> e
            sai da lista Em andamento.
          </p>
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
