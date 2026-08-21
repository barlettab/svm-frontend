import { useState } from "react";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { NovoModeloPage } from "./pages/NovoModelo/NovoModeloPage";
import { ConsultarModeloPage } from "./pages/ConsultarModelo/ConsultarModeloPage";
import { GestaoPage } from "./pages/Gestao/GestaoPage";
import type { ModuleKey } from "./types";

function AppShell() {
  const { profile } = useProfile();
  const [activeModule, setActiveModule] = useState<ModuleKey>("novo-modelo");
  const [lastProfile, setLastProfile] = useState(profile);

  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (profile === "solicitante" && activeModule === "gestao") {
      setActiveModule("novo-modelo");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <Sidebar activeModule={activeModule} onSelect={setActiveModule} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-5 md:p-10">
          {activeModule === "novo-modelo" && <NovoModeloPage />}
          {activeModule === "consultar-modelo" && <ConsultarModeloPage />}
          {activeModule === "gestao" && <GestaoPage />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProfileProvider>
      <AppShell />
    </ProfileProvider>
  );
}

export default App;
