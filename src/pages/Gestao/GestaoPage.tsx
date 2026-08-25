import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { PARAMETRIZACAO_TAB_LABELS, type ParametrizacaoTab } from "../../types";

interface GestaoPageProps {
  activeTab: ParametrizacaoTab;
}

export function GestaoPage({ activeTab }: GestaoPageProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Parametrização" />

      <EmptyState
        icon="clock"
        title={PARAMETRIZACAO_TAB_LABELS[activeTab]}
        description="Esta funcionalidade será implementada em uma próxima etapa."
      />
    </div>
  );
}
