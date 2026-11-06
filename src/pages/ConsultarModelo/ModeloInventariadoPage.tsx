import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { useSolicitacoes } from "../../context/SolicitacoesContext";
import { currentUserNameByProfile } from "../../data/currentUser";
import { PageHeader } from "../../components/layout/PageHeader";
import { Panel } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FileUpload } from "../../components/ui/FileUpload";
import { SelectField } from "../../components/ui/SelectField";
import { TextareaField } from "../../components/ui/TextareaField";
import { RadioGroupField } from "../../components/ui/RadioGroupField";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { Toast } from "../../components/ui/Toast";
import type { SituacaoModeloInventario } from "../../types";
import { formatDate } from "./formatDate";
import { HistoricoEArquivos, Info } from "./DetalheComum";

const SITUACOES: SituacaoModeloInventario[] = ["Ativo", "Inativo", "Suspenso"];
const ORIGENS = ["Teams", "E-mail", "Reunião", "Outro"];

interface ModeloInventariadoPageProps {
  /** Nº do inventário (INV-...). */
  numero: string;
  onVoltar: () => void;
}

/**
 * Página do modelo inventariado: mesmas informações e histórico da solicitação de origem,
 * sem pedido de complementação. Analista pode incluir documentos recebidos por fora
 * (Teams, e-mail…); só o gestor altera a situação do modelo.
 */
export function ModeloInventariadoPage({ numero, onVoltar }: ModeloInventariadoPageProps) {
  const { profile } = useProfile();
  const { inventario, solicitacoes, alterarSituacao, adicionarDocumento } = useSolicitacoes();
  const usuario = currentUserNameByProfile[profile];

  const modelo = inventario.find((m) => m.numero === numero);
  const solicitacao = modelo?.numeroSolicitacao
    ? solicitacoes.find((s) => s.numero === modelo.numeroSolicitacao)
    : undefined;

  const podeAdicionarDocumento = profile === "analista" && solicitacao !== undefined;
  const podeAlterarSituacao = profile === "gestor";

  const [toast, setToast] = useState<{ message: string; detail?: string; tone?: "success" | "info" } | null>(null);

  // Adicionar documento (analista)
  const [formAberto, setFormAberto] = useState(false);
  const [anexo, setAnexo] = useState<File | null>(null);
  const [origem, setOrigem] = useState("");
  const [texto, setTexto] = useState("");
  const [erros, setErros] = useState<{ anexo?: string; origem?: string }>({});

  // Alterar situação (gestor)
  const [situacaoAberta, setSituacaoAberta] = useState(false);
  const [novaSituacao, setNovaSituacao] = useState<SituacaoModeloInventario | null>(null);

  const crumbs = [
    { label: "Consultar modelos", onClick: onVoltar },
    { label: "Inventariado", onClick: onVoltar },
    { label: numero },
  ];

  if (!modelo) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Modelo não encontrado" crumbs={crumbs} onBack={onVoltar} />
        <EmptyState
          title={`Não encontramos o modelo ${numero} no inventário.`}
          description="Volte para a lista e tente novamente."
          action={<Button variant="secondary" onClick={onVoltar}>Voltar para a lista</Button>}
        />
      </div>
    );
  }

  const abrirAnexo = (nome: string) =>
    setToast({ tone: "info", message: `Download de "${nome}"`, detail: "No protótipo o arquivo não é baixado." });

  function fecharForm() {
    setFormAberto(false);
    setAnexo(null);
    setOrigem("");
    setTexto("");
    setErros({});
  }

  function salvarDocumento() {
    if (!solicitacao) return;
    const e = {
      anexo: anexo ? undefined : "Anexe o documento.",
      origem: origem ? undefined : "Informe por onde o documento chegou.",
    };
    if (e.anexo || e.origem) {
      setErros(e);
      return;
    }
    adicionarDocumento(solicitacao.numero, { anexo: anexo!.name, origem, texto: texto.trim() || undefined, autor: usuario });
    fecharForm();
    setToast({ message: "Documento adicionado ao histórico.", detail: anexo!.name });
  }

  function abrirSituacao() {
    setNovaSituacao(modelo!.situacao);
    setSituacaoAberta(true);
  }

  function salvarSituacao() {
    if (!novaSituacao || novaSituacao === modelo!.situacao) return;
    alterarSituacao(modelo!.numero, novaSituacao, usuario);
    setSituacaoAberta(false);
    setToast({ message: "Situação do modelo alterada.", detail: `${modelo!.nomeModelo} agora está ${novaSituacao}.` });
  }

  const headerActions = (
    <>
      {podeAdicionarDocumento && !formAberto && (
        <Button variant="primary" icon="upload" onClick={() => setFormAberto(true)}>
          Adicionar documento
        </Button>
      )}
      {podeAlterarSituacao && (
        <Button variant="primary" icon="edit" onClick={abrirSituacao}>
          Alterar situação
        </Button>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={modelo.nomeModelo}
        description={`Inventário ${modelo.numero}${solicitacao ? ` · Solicitação ${solicitacao.numero}` : ""}`}
        crumbs={crumbs}
        onBack={onVoltar}
        actions={headerActions}
      />

      <div className="flex flex-col gap-5">
        {/* ── Adicionar documento ao histórico (analista) ─────────────────── */}
        {podeAdicionarDocumento && formAberto && (
          <Panel title="Adicionar documento ao histórico" className="border-info-line">
            <div className="flex flex-col gap-5">
              <p className="text-body text-ink-2">
                Use para registrar um documento que chegou por fora do sistema (Teams, e-mail, reunião) e que o
                solicitante não anexou. Ele entra no histórico e na lista de arquivos com o seu nome.
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FileUpload
                  id="doc-anexo"
                  label="Documento"
                  required
                  file={anexo}
                  onChange={(f) => {
                    setAnexo(f);
                    if (f) setErros((x) => ({ ...x, anexo: undefined }));
                  }}
                  error={erros.anexo}
                  hint="PDF, DOC, XLSX ou CSV até 20 MB"
                />
                <div className="flex flex-col gap-5">
                  <SelectField
                    id="doc-origem"
                    label="Recebido por"
                    required
                    value={origem}
                    onChange={(v) => {
                      setOrigem(v);
                      setErros((x) => ({ ...x, origem: undefined }));
                    }}
                    options={ORIGENS}
                    error={erros.origem}
                    fullWidth
                  />
                  <TextareaField
                    id="doc-texto"
                    label="Observações (opcional)"
                    value={texto}
                    onChange={setTexto}
                    placeholder="Ex.: Relatório de backtesting enviado pelo solicitante no Teams em 12/08."
                    rows={4}
                    maxLength={1000}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
                <Button variant="secondary" onClick={fecharForm}>
                  Cancelar
                </Button>
                <Button variant="primary" icon="upload" onClick={salvarDocumento}>
                  Adicionar ao histórico
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Informações ─────────────────────────────────────────────────── */}
        <Panel title="Informações do modelo">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Nº do inventário">{modelo.numero}</Info>
            <Info label="Nome do modelo">{modelo.nomeModelo}</Info>
            <Info label="Situação do modelo">
              <StatusBadge status={modelo.situacao} />
            </Info>
            <Info label="Resultado da validação">
              <StatusBadge status={modelo.resultadoValidacao} />
            </Info>
            <Info label="Monitoramento">
              <StatusBadge status={modelo.monitoramento} />
            </Info>
            <Info label="Área gestora">{modelo.areaGestora}</Info>
            <Info label="Analista responsável">{modelo.analistaResponsavel}</Info>
            <Info label="Tipo de modelo">{modelo.tipoModelo}</Info>
            <Info label="Assunto">{modelo.assunto}</Info>
            <Info label="Público">{modelo.publico}</Info>
            {solicitacao && <Info label="Nº da solicitação">{solicitacao.numero}</Info>}
            {solicitacao && <Info label="Solicitante">{solicitacao.solicitante}</Info>}
            {solicitacao && <Info label="Data da submissão">{formatDate(solicitacao.dataSubmissao)}</Info>}
            <Info label="Data do inventário">{formatDate(modelo.dataInventario)}</Info>
            {solicitacao?.conclusao && (
              <Info label="Validada por">
                {solicitacao.conclusao.gestor} · {formatDate(solicitacao.conclusao.data)}
              </Info>
            )}
            <Info label="Objetivo" wide>
              {modelo.objetivo}
            </Info>
          </dl>
        </Panel>

        {/* ── Histórico + arquivos ────────────────────────────────────────── */}
        {solicitacao ? (
          <HistoricoEArquivos timeline={solicitacao.timeline} onAbrirAnexo={abrirAnexo} />
        ) : (
          <Panel title="Histórico da solicitação">
            <p className="text-body text-ink-2">Este modelo não tem uma solicitação de origem registrada no sistema.</p>
          </Panel>
        )}
      </div>

      {/* ── Popup de situação (gestor) ──────────────────────────────────── */}
      <Modal
        open={podeAlterarSituacao && situacaoAberta}
        title="Alterar situação do modelo"
        width="sm"
        onClose={() => setSituacaoAberta(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSituacaoAberta(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon="check"
              disabled={!novaSituacao || novaSituacao === modelo.situacao}
              onClick={salvarSituacao}
            >
              Salvar situação
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body text-ink-2">
            Situação atual: <b className="text-ink">{modelo.situacao}</b>. A alteração fica registrada no histórico.
          </p>
          <RadioGroupField
            id="situacao-modelo"
            label="Nova situação"
            required
            value={novaSituacao ?? ""}
            onChange={(v) => setNovaSituacao(v as SituacaoModeloInventario)}
            options={SITUACOES}
            fullWidth
          />
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
