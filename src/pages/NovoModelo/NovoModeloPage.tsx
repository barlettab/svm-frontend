import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { Tabs } from "../../components/ui/Tabs";
import { EmptyState } from "../../components/ui/EmptyState";
import { SubmeterForm } from "./SubmeterForm";
import { InventariarWizard } from "./InventariarWizard";
import { TABS_BY_PROFILE, type NovoModeloTab } from "../../types";

const TAB_LABELS: Record<NovoModeloTab, string> = {
  submeter: "Solicitação",
  inventariar: "Inventariar",
  "informacoes-adicionais": "Informações Adicionais",
  implantacao: "Implantação",
  "informacoes-modelo": "Informações do Modelo",
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
    <div className={activeTab === "inventariar" ? "mx-auto max-w-6xl" : "mx-auto max-w-3xl"}>
      {availableTabs.length > 1 && (
        <Tabs
          items={availableTabs.map((tab) => ({ key: tab, label: TAB_LABELS[tab] }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      )}

      <div className={availableTabs.length > 1 ? "mt-6" : undefined}>
        {activeTab === "submeter" && <SubmeterForm />}
        {activeTab === "inventariar" && <InventariarWizard />}
        {(activeTab === "informacoes-adicionais" ||
          activeTab === "implantacao" ||
          activeTab === "informacoes-modelo") && (
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
