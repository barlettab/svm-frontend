import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { EmAndamentoTab } from "./EmAndamentoTab";
import { InventariadoTab } from "./InventariadoTab";
import { CanceladoTab } from "./CanceladoTab";
import { SolicitacaoDetalhePage, type AcaoSolicitacao } from "./SolicitacaoDetalhePage";
import { ModeloInventariadoPage } from "./ModeloInventariadoPage";
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
  /** Solicitação aberta em página própria (null = lista). */
  const [aberta, setAberta] = useState<{ numero: string; acao?: AcaoSolicitacao } | null>(null);
  /** Modelo inventariado aberto em página própria (null = lista). */
  const [modeloAberto, setModeloAberto] = useState<string | null>(null);

  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }

  if (aberta) {
    return (
      <SolicitacaoDetalhePage
        key={aberta.numero}
        numero={aberta.numero}
        acaoInicial={aberta.acao}
        onVoltar={() => setAberta(null)}
      />
    );
  }

  if (modeloAberto) {
    return <ModeloInventariadoPage key={modeloAberto} numero={modeloAberto} onVoltar={() => setModeloAberto(null)} />;
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
        {activeTab === "em-andamento" && <EmAndamentoTab onAbrir={(numero, acao) => setAberta({ numero, acao })} />}
        {activeTab === "inventariado" && <InventariadoTab onAbrir={setModeloAberto} />}
        {activeTab === "cancelado" && <CanceladoTab />}
      </div>
    </div>
  );
}
