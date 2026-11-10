import { useMemo, useRef } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { baixarFichaExcel, fichaModeloHtml } from "../../components/modelo/fichaModelo";
import type { Solicitacao } from "../../types";

/** Pré-visualização da ficha do modelo, com download em Excel e impressão/PDF. */
export function FichaModeloModal({
  solicitacao,
  open,
  onClose,
}: {
  solicitacao: Solicitacao;
  open: boolean;
  onClose: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  // Regenera ao abrir, para refletir o que foi salvo por último.
  const html = useMemo(() => (open ? fichaModeloHtml(solicitacao) : ""), [open, solicitacao]);

  return (
    <Modal
      open={open}
      width="xl"
      title="Ficha do modelo"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="secondary" icon="doc" onClick={() => frame.current?.contentWindow?.print()}>
            Imprimir / PDF
          </Button>
          <Button variant="primary" icon="download" onClick={() => baixarFichaExcel(solicitacao)}>
            Baixar Excel
          </Button>
        </>
      }
    >
      <p className="mb-3 text-aux text-ink-2">
        Gerada com os dados salvos das abas Cálculo do Tier, Matriz de Risco e Informações do Modelo.
      </p>
      <iframe
        ref={frame}
        title="Pré-visualização da ficha do modelo"
        srcDoc={html}
        className="h-[65vh] w-full rounded-svm border border-line bg-white"
      />
    </Modal>
  );
}
