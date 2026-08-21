import { useRef } from "react";
import { FormField } from "./FormField";

interface FileUploadProps {
  id: string;
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
}

export function FileUpload({
  id,
  label = "Anexo",
  file,
  onChange,
  required,
  error,
  fullWidth = true,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
          <span className="truncate text-slate-700">📎 {file.name}</span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="ml-3 shrink-0 text-slate-400 hover:text-red-600"
            aria-label="Remover arquivo"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-md border border-dashed border-slate-300 px-3 py-3 text-center text-sm text-slate-500 hover:border-blue-500 hover:text-blue-700"
        >
          Clique para selecionar um arquivo
        </button>
      )}
    </FormField>
  );
}
