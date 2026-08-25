import { Button } from "./Button";
import { Icon } from "./Icon";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Não foi possível carregar os dados",
  description = "Tente novamente em alguns instantes. Se o erro persistir, acione o suporte.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="border border-line bg-surface px-6 py-14 text-center" role="alert">
      <Icon name="warning" size={34} className="mx-auto text-error" strokeWidth={1.4} />
      <p className="mt-4 text-ident text-ink-2">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-body text-ink-3">{description}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}

/** Faixa de alerta dentro do conteúdo (validação de formulário, avisos). */
export function InlineAlert({
  tone = "error",
  title,
  children,
}: {
  tone?: "error" | "warning" | "info" | "success";
  title: string;
  children?: React.ReactNode;
}) {
  const map = {
    error: ["border-error-line bg-error-bg", "text-error", "warning"],
    warning: ["border-warning-line bg-warning-bg", "text-warning", "warning"],
    info: ["border-info-line bg-info-bg", "text-info", "info"],
    success: ["border-success-line bg-success-bg", "text-success", "check"],
  } as const;
  const [box, ink, icon] = map[tone];

  return (
    <div className={"mb-5 flex gap-3 rounded-svm border px-4 py-3 " + box} role="alert">
      <Icon name={icon} size={17} className={"mt-px " + ink} />
      <div>
        <p className={"text-body font-semibold " + ink}>{title}</p>
        {children && <div className="mt-1 text-body text-ink-2">{children}</div>}
      </div>
    </div>
  );
}
