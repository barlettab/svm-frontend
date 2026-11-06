import { useState } from "react";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { SolicitacoesProvider } from "./context/SolicitacoesContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AppFooter } from "./components/layout/AppFooter";
import { NovoModeloPage } from "./pages/NovoModelo/NovoModeloPage";
import { ConsultarModeloPage } from "./pages/ConsultarModelo/ConsultarModeloPage";
import { GestaoPage } from "./pages/Gestao/GestaoPage";
import {
  MODULES_BY_PROFILE,
  getModuleTabs,
  type ModuleKey,
  type ParametrizacaoTab,
} from "./types";

function AppShell() {
  const { profile } = useProfile();
  const [activeModule, setActiveModule] = useState<ModuleKey>("novo-modelo");
  const [activeTab, setActiveTab] = useState<string>("submeter");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastProfile, setLastProfile] = useState(profile);

  if (profile !== lastProfile) {
    setLastProfile(profile);
    const availableModules = MODULES_BY_PROFILE[profile];
    if (!availableModules.includes(activeModule)) {
      const fallbackModule = availableModules[0];
      setActiveModule(fallbackModule);
      setActiveTab(getModuleTabs(fallbackModule, profile)[0]);
    } else {
      const tabs = getModuleTabs(activeModule, profile);
      if (!tabs.includes(activeTab)) {
        setActiveTab(tabs[0]);
      }
    }
  }

  function selectSection(module: ModuleKey, section?: string) {
    setActiveModule(module);
    setActiveTab(section ?? getModuleTabs(module, profile)[0]);
    setMenuOpen(false);
  }

  return (
    <div className="flex h-full min-h-screen bg-app">
      <Sidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        activeSection={activeTab}
        onSelectSection={selectSection}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
          <div className="mx-auto max-w-[1600px]">
            {activeModule === "novo-modelo" && <NovoModeloPage />}
            {activeModule === "consultar-modelo" && <ConsultarModeloPage />}
            {activeModule === "gestao" && (
              <GestaoPage activeTab={activeTab as ParametrizacaoTab} />
            )}
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <ProfileProvider>
      <SolicitacoesProvider>
        <AppShell />
      </SolicitacoesProvider>
    </ProfileProvider>
  );
}

export default App;
