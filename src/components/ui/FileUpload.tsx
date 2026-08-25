import { useRef, useState } from "react";
import { cx } from "./cx";
import { FormField } from "./FormField";
import { Icon } from "./Icon";
import { IconButton } from "./Button";

interface FileUploadProps {
  id: string;
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  accept?: string;
  hint?: string;
}

export function FileUpload({
  id,
  label = "Anexo",
  file,
  onChange,
  required,
  error,
  fullWidth = true,
  accept = ".pdf,.doc,.docx,.xlsx,.csv",
  hint = "PDF, DOC, XLSX ou CSV até 20 MB",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <FormField label={label} htmlFor={id} required={required} error={error} fullWidth={fullWidth}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-svm border border-line bg-surface-alt px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-body text-ink">
            <Icon name="paperclip" size={15} className="text-ink-2" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-aux text-ink-3">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </span>
          <IconButton
            icon="trash"
            label="Remover arquivo"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="hover:text-error"
          />
        </div>
      ) : (
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
            onChange(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cx(
            "flex w-full flex-col items-center gap-1.5 rounded-svm border border-dashed px-3 py-6 text-center transition-colors",
            dragging ? "border-primary bg-info-bg" : "border-field bg-white hover:border-primary",
          )}
        >
          <Icon name="upload" size={20} className="text-ink-3" />
          <span className="text-body text-ink-2">
            Arraste o arquivo ou <span className="text-primary underline">selecione</span>
          </span>
          <span className="text-aux text-ink-3">{hint}</span>
        </button>
      )}
    </FormField>
  );
}
