import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { Tabs } from "../../components/ui/Tabs";
import { EmptyState } from "../../components/ui/EmptyState";
import { SubmeterForm } from "./SubmeterForm";
import { InventariarForm } from "./InventariarForm";
import { TABS_BY_PROFILE, type NovoModeloTab } from "../../types";

const TAB_LABELS: Record<NovoModeloTab, string> = {
  submeter: "Solicitação",
  inventariar: "Inventariar",
  "informacoes-adicionais": "Informações Adicionais",
  implantacao: "Implantação",
  "metodologia-monitoramento": "Metodologia e Monitoramento",
};

export function NovoModeloPage() {
  const { profile } = useProfile();
  const availableTabs = TABS_BY_PROFILE[profile];
  const [activeTab, setActiveTab] = useState<NovoModeloTab>(availableTabs[0]);
  const [lastProfile, setLastProfile] = useState(profile);

  if (profile !== lastProfile) {
    setLastProfile(profile);
    setActiveTab(availableTabs[0]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {availableTabs.length > 1 && (
        <Tabs
          items={availableTabs.map((tab) => ({ key: tab, label: TAB_LABELS[tab] }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      )}

      <div className={availableTabs.length > 1 ? "mt-6" : undefined}>
        {activeTab === "submeter" && <SubmeterForm />}
        {activeTab === "inventariar" && <InventariarForm />}
        {(activeTab === "informacoes-adicionais" ||
          activeTab === "implantacao" ||
          activeTab === "metodologia-monitoramento") && (
          <EmptyState
            icon="clock"
            title={TAB_LABELS[activeTab]}
            description="Esta funcionalidade será implementada em uma próxima etapa."
          />
        )}
      </div>
    </div>
  );
}
