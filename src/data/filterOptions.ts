import { areaGestoraOptions, assuntoOptions } from "./options";

export const analistaOptions = [
  "Maria Santos",
  "Carlos Oliveira",
  "Fernanda Alves",
];

/** Usuários que podem ser indicados como solicitante (Alterar solicitante). */
export const solicitanteOptions = [
  "Barbara Barletta",
  "João Pereira",
  "Ana Costa",
  "Marcos Lima",
  "Beatriz Rocha",
  "Rafael Souza",
  "Camila Dias",
  "Eduardo Nunes",
  "Patrícia Gomes",
];

export const areaGestoraFilterOptions = ["Todas", ...areaGestoraOptions];

export const assuntoFilterOptions = ["Todos", ...assuntoOptions];

export const analistaFilterOptions = [
  "Todos",
  ...analistaOptions,
  "Não atribuído",
];
