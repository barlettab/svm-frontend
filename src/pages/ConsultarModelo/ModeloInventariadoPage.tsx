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
import { ToggleField } from "../../components/ui/ToggleField";
import { EmptyState } from "../../components/ui/EmptyState";
import { Toast } from "../../components/ui/Toast";
import type { InformacoesModelo, SituacaoModeloInventario } from "../../types";
import { CamposInformacoesModelo } from "../../components/modelo/CamposDadosModelo";
import {
  INFORMACOES_MODELO_VAZIAS,
  semErros,
  validarInformacoesModelo,
  type ErrosInformacoesModelo,
} from "../../components/modelo/dadosModelo";
import { formatDate } from "./formatDate";
import { HistoricoEArquivos, Info } from "./DetalheComum";
import { ResumoInformacoesAdicionais, ResumoInformacoesModelo } from "../../components/modelo/ResumoDadosModelo";

const SITUACOES: SituacaoModeloInventario[] = ["Ativo", "Inativo", "Suspenso"];
const ORIGENS = ["Teams", "E-mail", "Reunião", "Outro"];

interface ModeloInventariadoPageProps {
  /** Nº do inventário (INV-...). */
  numero: string;
  onVoltar: () => void;
}

/**
 * Página do modelo inventariado: mesmas informações e histórico da solicitação de origem.
 * Analista inclui documentos recebidos por fora (Teams, e-mail…). Analista e gestor editam
 * a situação (Ativo / Inativo / Suspenso), o monitoramento pela GEVAM (toggle) e os textos
 * de Informações do Modelo; cada mudança vai para o histórico. O solicitante só consulta.
 */
export function ModeloInventariadoPage({ numero, onVoltar }: ModeloInventariadoPageProps) {
  const { profile } = useProfile();
  const { inventario, solicitacoes, editarModelo, adicionarDocumento } = useSolicitacoes();
  const usuario = currentUserNameByProfile[profile];

  const modelo = inventario.find((m) => m.numero === numero);
  const solicitacao = modelo?.numeroSolicitacao
    ? solicitacoes.find((s) => s.numero === modelo.numeroSolicitacao)
    : undefined;

  const podeAdicionarDocumento = profile === "analista" && solicitacao !== undefined;
  const podeEditar = profile === "analista" || profile === "gestor";

  const [toast, setToast] = useState<{ message: string; detail?: string; tone?: "success" | "info" } | null>(null);

  // Adicionar documento (analista)
  const [formAberto, setFormAberto] = useState(false);
  const [anexo, setAnexo] = useState<File | null>(null);
  const [origem, setOrigem] = useState("");
  const [texto, setTexto] = useState("");
  const [erros, setErros] = useState<{ anexo?: string; origem?: string }>({});

  // Editar modelo (analista e gestor)
  const [edicaoAberta, setEdicaoAberta] = useState(false);
  const [situacao, setSituacao] = useState<SituacaoModeloInventario>("Ativo");
  const [monitorado, setMonitorado] = useState(false);
  const [textos, setTextos] = useState<InformacoesModelo>(INFORMACOES_MODELO_VAZIAS);
  const [errosTextos, setErrosTextos] = useState<ErrosInformacoesModelo>({});

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

  const informacoesModelo = modelo.informacoesModelo ?? solicitacao?.informacoesModelo;

  function abrirEdicao() {
    setSituacao(modelo!.situacao);
    setMonitorado(modelo!.monitoramento === "Em monitoramento");
    setTextos(informacoesModelo ?? INFORMACOES_MODELO_VAZIAS);
    setErrosTextos({});
    setFormAberto(false);
    setEdicaoAberta(true);
  }

  function salvarEdicao() {
    const e = validarInformacoesModelo(textos);
    setErrosTextos(e);
    if (!semErros(e)) return;
    editarModelo(modelo!.numero, { situacao, monitorado, informacoesModelo: textos, autor: usuario });
    setEdicaoAberta(false);
    setToast({
      message: "Modelo atualizado.",
      detail: `${situacao} · ${monitorado ? "monitorado" : "não monitorado"} pela GEVAM. As alterações foram registradas no histórico.`,
    });
  }

  const headerActions = (
    <>
      {podeAdicionarDocumento && !formAberto && !edicaoAberta && (
        <Button
          variant="secondary"
          icon="upload"
          onClick={() => {
            setEdicaoAberta(false);
            setFormAberto(true);
          }}
        >
          Acrescentar documentação
        </Button>
      )}
      {podeEditar && !edicaoAberta && (
        <Button variant="primary" icon="edit" onClick={abrirEdicao}>
          Editar modelo
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
          <Panel title="Acrescentar documentação" className="border-info-line">
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
                  Acrescentar
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Editar modelo (analista e gestor) ───────────────────────────── */}
        {podeEditar && edicaoAberta && (
          <Panel title="Editar modelo" className="border-info-line">
            <div className="flex flex-col gap-6">
              <p className="text-body text-ink-2">
                Altere a situação, o monitoramento pela GEVAM e os textos de Informações do Modelo. Cada alteração fica
                registrada no histórico com o seu nome.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <RadioGroupField
                  id="editar-situacao"
                  label="Situação do modelo"
                  required
                  value={situacao}
                  onChange={(v) => setSituacao(v as SituacaoModeloInventario)}
                  options={SITUACOES}
                />
                <ToggleField
                  id="editar-monitorado"
                  label="Monitoramento 2ª Linha (GEVAM)"
                  checked={monitorado}
                  onChange={setMonitorado}
                  hint="Indica se a 2ª linha (GEVAM) acompanha este modelo. O acompanhamento é feito fora do sistema."
                />
              </div>
              <div className="border-t border-line-soft pt-5">
                <h3 className="mb-4 text-section font-semibold text-ink">Informações do Modelo</h3>
                <CamposInformacoesModelo
                  idPrefix="editar-info"
                  value={textos}
                  onChange={(v) => {
                    setTextos(v);
                    setErrosTextos({});
                  }}
                  errors={errosTextos}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
                <Button variant="secondary" onClick={() => setEdicaoAberta(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" icon="check" onClick={salvarEdicao}>
                  Salvar alterações
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
            <Info label="Monitoramento 2ª Linha (GEVAM)">
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
              <Info label="Validado por">
                {solicitacao.conclusao.gestor} · {formatDate(solicitacao.conclusao.data)}
              </Info>
            )}
            <Info label="Objetivo" wide>
              {modelo.objetivo}
            </Info>
          </dl>
        </Panel>

        {/* ── Informações Adicionais / Informações do Modelo (do inventário ou da solicitação) ── */}
        {(modelo.informacoesAdicionais ?? solicitacao?.informacoesAdicionais) && (
          <Panel title="Informações Adicionais">
            <ResumoInformacoesAdicionais dados={(modelo.informacoesAdicionais ?? solicitacao?.informacoesAdicionais)!} />
          </Panel>
        )}
        {informacoesModelo && !edicaoAberta && (
          <Panel title="Informações do Modelo">
            <ResumoInformacoesModelo dados={informacoesModelo} />
          </Panel>
        )}

        {/* ── Histórico + arquivos ────────────────────────────────────────── */}
        {solicitacao ? (
          <HistoricoEArquivos timeline={solicitacao.timeline} onAbrirAnexo={abrirAnexo} />
        ) : (
          <Panel title="Histórico da solicitação">
            <p className="text-body text-ink-2">Este modelo não tem uma solicitação de origem registrada no sistema.</p>
          </Panel>
        )}
      </div>

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
