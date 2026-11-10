import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { FileUpload } from "../../components/ui/FileUpload";
import { TextareaField } from "../../components/ui/TextareaField";
import { CheckboxField } from "../../components/ui/CheckboxField";

interface FormAtualizacaoProps {
  /** Na avaliação preliminar, a atualização pode ser o TAP sem pendências. */
  preliminar: boolean;
  onCancelar: () => void;
  onConfirmar: (dados: { descricao: string; anexo?: string; tapSemPendencias: boolean }) => void;
}

/**
 * "Atualizar solicitação": o analista registra no histórico uma atualização com descrição
 * obrigatória e anexo opcional (ex.: arquivo que o solicitante mandou por Teams ou e-mail).
 * Na avaliação preliminar, pode marcar que é o TAP sem pendências: aí o anexo é obrigatório
 * e a solicitação segue para a análise.
 */
export function FormAtualizacao({ preliminar, onCancelar, onConfirmar }: FormAtualizacaoProps) {
  const [descricao, setDescricao] = useState("");
  const [anexo, setAnexo] = useState<File | null>(null);
  const [tap, setTap] = useState(false);
  const [erros, setErros] = useState<{ descricao?: string; anexo?: string }>({});

  function confirmar() {
    const e = {
      descricao: descricao.trim() ? undefined : "Descreva a atualização.",
      anexo: tap && !anexo ? "Anexe o TAP para concluir a avaliação preliminar." : undefined,
    };
    setErros(e);
    if (e.descricao || e.anexo) return;
    onConfirmar({ descricao: descricao.trim(), anexo: anexo?.name, tapSemPendencias: tap });
  }

  return (
    <Panel title="Atualizar solicitação" className="border-info-line">
      <div className="flex flex-col gap-5">
        <p className="text-body text-ink-2">
          Registre no histórico uma atualização da solicitação, por exemplo um arquivo que o solicitante enviou por
          Teams ou e-mail. A descrição é obrigatória. O anexo é opcional.
        </p>

        {preliminar && (
          <div className="rounded-svm border border-line-soft bg-surface-alt px-4 py-3">
            <CheckboxField
              id="atualizacao-tap"
              label="Esta atualização é o TAP sem pendências"
              checked={tap}
              onChange={(v) => {
                setTap(v);
                setErros((x) => ({ ...x, anexo: undefined }));
              }}
              hint="Conclui a avaliação preliminar: o TAP passa a ser obrigatório e a solicitação segue para a análise (Cálculo do Tier, Matriz de Risco e Informações do Modelo)."
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextareaField
            id="atualizacao-descricao"
            label="Descrição da atualização"
            required
            value={descricao}
            onChange={(v) => {
              setDescricao(v);
              setErros((x) => ({ ...x, descricao: undefined }));
            }}
            placeholder={
              tap
                ? "Ex.: Documentação completa. Nenhuma pendência identificada no TAP."
                : "Ex.: Relatório de backtesting enviado pelo solicitante no Teams em 12/08."
            }
            rows={5}
            maxLength={1000}
            hint="Fica registrada no histórico da solicitação."
            error={erros.descricao}
          />
          <FileUpload
            id="atualizacao-anexo"
            label={tap ? "TAP" : "Anexo (opcional)"}
            required={tap}
            file={anexo}
            onChange={(f) => {
              setAnexo(f);
              if (f) setErros((x) => ({ ...x, anexo: undefined }));
            }}
            error={erros.anexo}
            hint="PDF, DOC, XLSX ou CSV até 20 MB"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="primary" icon="upload" onClick={confirmar}>
            Atualizar solicitação
          </Button>
        </div>
      </div>
    </Panel>
  );
}
