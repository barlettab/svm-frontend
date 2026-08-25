import { cx } from "./cx";
import { Icon } from "./Icon";

export interface Step {
  key: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  /** Índice da etapa atual (0-based). */
  current: number;
  onStepClick?: (index: number) => void;
}

/**
 * Trilha de etapas do formulário multi-etapa. Etapa concluída recebe
 * marca de verificação; a atual, pill azul; as futuras, cinza.
 */
export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-3 border border-line bg-surface px-5 py-4">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const clickable = onStepClick && index <= current;

        return (
          <li key={step.key} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onStepClick(index) : undefined}
              aria-current={active ? "step" : undefined}
              className={cx(
                "flex items-center gap-2 rounded-svm px-2.5 py-1.5 text-body transition-colors",
                active && "bg-info-bg font-semibold text-primary",
                done && "text-ink-2 hover:bg-surface-alt",
                !done && !active && "cursor-default text-ink-4",
              )}
            >
              <span
                className={cx(
                  "flex h-[22px] w-[22px] items-center justify-center rounded-full border text-micro font-semibold",
                  active && "border-primary bg-primary text-white",
                  done && "border-success-line bg-success-bg text-success",
                  !done && !active && "border-line text-ink-4",
                )}
              >
                {done ? <Icon name="check" size={12} strokeWidth={2.4} /> : index + 1}
              </span>
              {step.label}
            </button>
            {index < steps.length - 1 && <Icon name="chev-right" size={12} className="text-ink-4" />}
          </li>
        );
      })}
    </ol>
  );
}
