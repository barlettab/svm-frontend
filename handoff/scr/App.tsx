import { useState } from "react";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AppFooter } from "./components/layout/AppFooter";
import { NovoModeloPage } from "./pages/NovoModelo/NovoModeloPage";
import { ConsultarModeloPage } from "./pages/ConsultarModelo/ConsultarModeloPage";
import { GestaoPage } from "./pages/Gestao/GestaoPage";
import type { ModuleKey } from "./types";

function AppShell() {
  const { profile } = useProfile();
  const [activeModule, setActiveModule] = useState<ModuleKey>("novo-modelo");
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastProfile, setLastProfile] = useState(profile);

  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (profile === "solicitante" && activeModule === "gestao") {
      setActiveModule("novo-modelo");
      setActiveSection(undefined);
    }
  }

  const selectSection = (module: ModuleKey, section?: string) => {
    setActiveModule(module);
    setActiveSection(section);
  };

  return (
    <div className="flex h-full min-h-screen bg-app">
      <Sidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        activeSection={activeSection}
        onSelectSection={selectSection}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
          <div className="mx-auto max-w-[1600px]">
            {activeModule === "novo-modelo" && <NovoModeloPage section={activeSection} />}
            {activeModule === "consultar-modelo" && <ConsultarModeloPage section={activeSection} />}
            {activeModule === "gestao" && <GestaoPage section={activeSection} />}
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <AppShell />
    </ProfileProvider>
  );
}
