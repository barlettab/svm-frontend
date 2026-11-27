import { useRef, useState } from "react";
import { cx } from "./cx";
import { FormField } from "./FormField";
import { Icon } from "./Icon";
import { IconButton } from "./Button";

interface MultiFileUploadProps {
  id: string;
  label: string;
  /** Texto do ícone (i) ao lado do label. */
  info?: string;
  /** Arquivos novos escolhidos agora. */
  files: File[];
  onChange: (files: File[]) => void;
  /** Arquivos já enviados antes (edição): aparecem na lista e podem ser removidos. */
  existentes?: string[];
  onRemoverExistente?: (nome: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

/**
 * Anexo(s): aceita quantos arquivos a pessoa precisar, de qualquer tipo.
 * A lista mostra os arquivos (já enviados e novos), cada um com lixeira; o quadro de
 * arrastar/selecionar fica sempre embaixo para incluir mais.
 */
export function MultiFileUpload({
  id,
  label,
  info,
  files,
  onChange,
  existentes = [],
  onRemoverExistente,
  required,
  error,
  hint = "Qualquer formato, até 20 MB por arquivo. Inclua quantos arquivos precisar.",
  fullWidth = true,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function incluir(lista: FileList | null | undefined) {
    if (!lista?.length) return;
    const nomes = new Set([...existentes, ...files.map((f) => f.name)]);
    // Mesmo nome de novo não duplica a linha.
    onChange([...files, ...Array.from(lista).filter((f) => !nomes.has(f.name))]);
    if (inputRef.current) inputRef.current.value = "";
  }

  const linha = (nome: string, tamanho: number | undefined, onRemover: () => void, chave: string) => (
    <li
      key={chave}
      className="flex items-center justify-between gap-3 rounded-svm border border-line bg-surface-alt px-3 py-2"
    >
      <span className="flex min-w-0 items-center gap-2 text-body text-ink">
        <Icon name="paperclip" size={15} className="text-ink-2" />
        <span className="truncate">{nome}</span>
        {tamanho !== undefined && (
          <span className="shrink-0 text-aux text-ink-3">{(tamanho / 1024).toFixed(0)} KB</span>
        )}
      </span>
      <IconButton icon="trash" label={`Remover ${nome}`} onClick={onRemover} className="hover:text-error" />
    </li>
  );

  const temArquivos = existentes.length > 0 || files.length > 0;

  return (
    <FormField label={label} htmlFor={id} required={required} error={error} info={info} fullWidth={fullWidth}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => incluir(e.target.files)}
      />

      {temArquivos && (
        <ul className="mb-2 flex flex-col gap-2">
          {existentes.map((nome) => linha(nome, undefined, () => onRemoverExistente?.(nome), `e-${nome}`))}
          {files.map((f, i) =>
            linha(f.name, f.size, () => onChange(files.filter((_, j) => j !== i)), `n-${f.name}-${i}`),
          )}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          incluir(e.dataTransfer.files);
        }}
        className={cx(
          "flex w-full flex-col items-center gap-1.5 rounded-svm border border-dashed text-center transition-colors",
          temArquivos ? "px-3 py-4" : "px-3 py-6",
          error ? "border-error" : dragging ? "border-primary bg-info-bg" : "border-field bg-white hover:border-primary",
        )}
      >
        <Icon name="upload" size={20} className="text-ink-3" />
        <span className="text-body text-ink-2">
          {temArquivos ? "Incluir mais arquivos: arraste ou " : "Arraste os arquivos ou "}
          <span className="text-primary underline">selecione</span>
        </span>
        <span className="text-aux text-ink-3">{hint}</span>
      </button>
    </FormField>
  );
}

/** Texto do (i) de Anexo(s), igual no envio e na edição. */
export const INFO_ANEXOS =
  "Esperamos o relatório de desenvolvimento do modelo em PDF, os scripts de código, as planilhas e qualquer outro arquivo que ajude na análise. Você pode anexar quantos arquivos precisar.";
