import { areaGestoraOptions, assuntoOptions } from "./options";

export const analistaOptions = [
  "Maria Santos",
  "Carlos Oliveira",
  "Fernanda Alves",
];

export const areaGestoraFilterOptions = ["Todas", ...areaGestoraOptions];

export const assuntoFilterOptions = ["Todos", ...assuntoOptions];

export const analistaFilterOptions = [
  "Todos",
  ...analistaOptions,
  "Não atribuído",
];
