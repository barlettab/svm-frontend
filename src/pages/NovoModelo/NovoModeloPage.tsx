import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { useProfile } from "../../context/ProfileContext";
import { TABS_BY_PROFILE, type NovoModeloTab } from "../../types";
import { SubmeterForm } from "./SubmeterForm";
import { InventariarForm } from "./InventariarForm";

const TAB_LABELS: Record<NovoModeloTab, string> = {
  submeter: "Submeter",
  inventariar: "Inventariar",
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
      <PageHeader title="Novo modelo" />

      <Tabs
        items={availableTabs.map((tab) => ({ key: tab, label: TAB_LABELS[tab] }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "submeter" && <SubmeterForm />}
        {activeTab === "inventariar" && <InventariarForm />}
      </div>
    </div>
  );
}
