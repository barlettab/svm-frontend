import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { FileUpload } from "../../components/ui/FileUpload";
import { TextareaField } from "../../components/ui/TextareaField";

interface FormAcrescentarDocumentacaoProps {
  onCancelar: () => void;
  onConfirmar: (dados: { anexo: string; descricao?: string }) => void;
}

/**
 * "Acrescentar documentação": o analista inclui um documento na solicitação — o TAP sem
 * pendências ou qualquer outro (ex.: recebido por Teams ou e-mail). O status não muda.
 */
export function FormAcrescentarDocumentacao({ onCancelar, onConfirmar }: FormAcrescentarDocumentacaoProps) {
  const [descricao, setDescricao] = useState("");
  const [anexo, setAnexo] = useState<File | null>(null);
  const [erro, setErro] = useState<string>();

  function confirmar() {
    if (!anexo) {
      setErro("Anexe o documento.");
      return;
    }
    onConfirmar({ anexo: anexo.name, descricao: descricao.trim() || undefined });
  }

  return (
    <Panel title="Acrescentar documentação" className="border-info-line">
      <div className="flex flex-col gap-5">
        <p className="text-body text-ink-2">
          Inclua o TAP sem pendências ou qualquer outro documento da validação. Ele fica no histórico e em Arquivos. O
          status da solicitação não muda.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FileUpload
            id="documentacao-anexo"
            label="Documento"
            required
            file={anexo}
            onChange={(f) => {
              setAnexo(f);
              if (f) setErro(undefined);
            }}
            error={erro}
            hint="PDF, DOC, XLSX ou CSV até 20 MB"
          />
          <TextareaField
            id="documentacao-descricao"
            label="Descrição (opcional)"
            value={descricao}
            onChange={setDescricao}
            placeholder="Ex.: TAP sem pendências. / Documento recebido por e-mail."
            rows={5}
            maxLength={1000}
            hint="Fica registrada no histórico da solicitação."
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-line-soft pt-4">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="primary" icon="upload" onClick={confirmar}>
            Acrescentar
          </Button>
        </div>
      </div>
    </Panel>
  );
}
