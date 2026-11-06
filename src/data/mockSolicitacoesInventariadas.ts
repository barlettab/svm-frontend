import type { Solicitacao } from "../types";
import { mockInventario } from "./mockInventario";

/**
 * Solicitações já finalizadas que deram origem aos modelos do inventário mockado.
 * Geradas a partir do inventário para que a página do modelo tenha histórico e arquivos.
 */
const SOLICITANTES = ["João Pereira", "Ana Costa", "Rafael Lima", "Juliana Rocha", "Pedro Martins"];
const GESTOR = "Carlos Oliveira";

function diasAntes(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

export const mockSolicitacoesInventariadas: Solicitacao[] = mockInventario
  .filter((m) => m.numeroSolicitacao)
  .map((m, i) => {
    const numero = m.numeroSolicitacao!;
    const fim = m.dataInventario;
    const monitorado = m.monitoramento === "Em monitoramento";
    const parecer = `Parecer técnico ${numero}.pdf`;
    return {
      numero,
      nomeModelo: m.nomeModelo,
      areaGestora: m.areaGestora,
      assunto: m.assunto,
      publico: m.publico,
      solicitante: SOLICITANTES[i % SOLICITANTES.length],
      dataSubmissao: diasAntes(fim, 30),
      analistaResponsavel: m.analistaResponsavel,
      status: "Validada",
      tipoModelo: m.tipoModelo,
      objetivo: m.objetivo,
      conclusao: { data: fim, gestor: GESTOR, inventariado: true, monitorado, numeroInventario: m.numero },
      timeline: [
        { data: diasAntes(fim, 30), descricao: "Solicitação submetida pelo solicitante.", anexos: ["Documentação técnica do modelo.pdf"] },
        { data: diasAntes(fim, 29), descricao: "Encaminhada para análise técnica." },
        { data: diasAntes(fim, 27), descricao: "Em análise pela GEVAM." },
        {
          data: diasAntes(fim, 5),
          descricao: "Análise concluída e enviada para o gestor.",
          autor: m.analistaResponsavel,
          anexos: [parecer],
          tipo: "enviada-gestor",
        },
        {
          data: fim,
          descricao: `Validação finalizada com resultado ${m.resultadoValidacao}. Modelo incluído no inventário (${m.numero}).`,
          detalhe: `Inventariado: Sim · Monitorado: ${monitorado ? "Sim" : "Não"}`,
          autor: GESTOR,
          tipo: "validada",
        },
      ],
    };
  });
