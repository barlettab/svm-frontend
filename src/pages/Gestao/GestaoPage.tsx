import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  PARAMETRIZACAO_TAB_LABELS,
  type ParametrizacaoTab,
} from "../../types";

const TABS: ParametrizacaoTab[] = [
  "parametros-gerais",
  "matriz-riscos",
  "expr-score-tier",
  "expr-score-monitoramento",
];

export function GestaoPage() {
  const [activeTab, setActiveTab] = useState<ParametrizacaoTab>(TABS[0]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Parametrização" />

      <Tabs
        items={TABS.map((tab) => ({
          key: tab,
          label: PARAMETRIZACAO_TAB_LABELS[tab],
        }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        <EmptyState
          title={PARAMETRIZACAO_TAB_LABELS[activeTab]}
          description="Esta funcionalidade será implementada em uma próxima etapa."
        />
      </div>
    </div>
  );
}
