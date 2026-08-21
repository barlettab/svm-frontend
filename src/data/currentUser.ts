import type { Profile } from "../types";

export const currentSolicitante = {
  nome: "Barbara Barletta",
  areaGestora: "Financeiro",
};

export const currentUserNameByProfile: Record<Profile, string> = {
  solicitante: currentSolicitante.nome,
  analista: "Maria Santos",
  gestor: "Carlos Oliveira",
};
