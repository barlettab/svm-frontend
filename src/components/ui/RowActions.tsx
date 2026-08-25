import { IconButton } from "./Button";
import type { IconName } from "./Icon";

/**
 * Ações da coluna de ações da tabela de solicitações, na ordem da referência.
 * Cada entrada define ícone, rótulo acessível e quando a ação fica indisponível.
 */
export type SolicitacaoAction =
  | "visualizar"
  | "alterar"
  | "atribuir-analista"
  | "alterar-solicitante"
  | "cancelar";

export const SOLICITACAO_ACTIONS: Record<
  SolicitacaoAction,
  { icon: IconName; label: string; danger?: boolean }
> = {
  visualizar: { icon: "eye", label: "Visualizar solicitação" },
  alterar: { icon: "edit", label: "Alterar solicitação" },
  "atribuir-analista": { icon: "user", label: "Atribuir solicitação para analista" },
  "alterar-solicitante": { icon: "alterar-solicitante", label: "Alterar solicitante" },
  cancelar: { icon: "trash", label: "Cancelar solicitação", danger: true },
};

interface RowActionsProps {
  actions: SolicitacaoAction[];
  /** Ações visíveis porém indisponíveis no estado atual do registro. */
  disabled?: SolicitacaoAction[];
  onAction: (action: SolicitacaoAction) => void;
}

/** Alvo de 34×34 por ícone, gap de 2px, centralizado sob a coluna "Ação". */
export function RowActions({ actions, disabled = [], onAction }: RowActionsProps) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {actions.map((action) => {
        const { icon, label, danger } = SOLICITACAO_ACTIONS[action];
        return (
          <IconButton
            key={action}
            icon={icon}
            label={label}
            disabled={disabled.includes(action)}
            onClick={(e) => {
              e.stopPropagation();
              onAction(action);
            }}
            className={danger ? "hover:text-error" : undefined}
          />
        );
      })}
    </div>
  );
}
