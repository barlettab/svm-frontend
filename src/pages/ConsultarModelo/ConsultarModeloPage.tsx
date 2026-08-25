import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { EmAndamentoTab } from "./EmAndamentoTab";
import { InventariadoTab } from "./InventariadoTab";
import { CanceladoTab } from "./CanceladoTab";
import { CONSULTAR_TABS_BY_PROFILE, type ConsultarModeloTab } from "../../types";

const TAB_LABELS: Record<ConsultarModeloTab, string> = {
  "em-andamento": "Em andamento",
  inventariado: "Inventariado",
  cancelado: "Cancelado",
};

export function ConsultarModeloPage() {
  const { profile } = useProfile();
  const availableTabs = CONSULTAR_TABS_BY_PROFILE[profile];
  const [activeTab, setActiveTab] = useState<ConsultarModeloTab>(availableTabs[0]);
  const [lastProfile, setLastProfile] = useState(profile);

  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Consultar modelos" />

      <Tabs
        items={availableTabs.map((tab) => ({ key: tab, label: TAB_LABELS[tab] }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "em-andamento" && <EmAndamentoTab />}
        {activeTab === "inventariado" && <InventariadoTab />}
        {activeTab === "cancelado" && <CanceladoTab />}
      </div>
    </div>
  );
}
