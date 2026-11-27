import type { Solicitacao } from "../types";
import { mockInventario } from "./mockInventario";
import { exemploCalculos, exemploInformacoesAdicionais, exemploInformacoesModelo } from "./mockDadosModelo";

/**
 * Solicitações já finalizadas que deram origem aos modelos do inventário mockado.
 * Geradas a partir do inventário para que a página do modelo tenha histórico e arquivos.
 */
const SOLICITANTES = ["João Pereira", "Ana Costa", "Rafael Lima", "Juliana Rocha", "Pedro Martins"];
const GESTOR = "Ricardo Mendes";

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
    return {
      numero,
      nomeModelo: m.nomeModelo,
      areaGestora: m.areaGestora,
      assunto: m.assunto,
      publico: m.publico,
      solicitante: SOLICITANTES[i % SOLICITANTES.length],
      dataSubmissao: diasAntes(fim, 30),
      analistaResponsavel: m.analistaResponsavel,
      status: "Validado",
      tipoModelo: m.tipoModelo,
      objetivo: m.objetivo,
      informacoesAdicionais: exemploInformacoesAdicionais,
      informacoesModelo: exemploInformacoesModelo,
      calculosTier: exemploCalculos(m.analistaResponsavel, diasAntes(fim, 7)),
      conclusao: { data: fim, gestor: GESTOR, numeroInventario: m.numero },
      timeline: [
        { data: diasAntes(fim, 30), descricao: "Solicitação submetida pelo solicitante.", anexos: ["Documentação técnica do modelo.pdf"] },
        {
          data: diasAntes(fim, 27),
          descricao: `Solicitação atribuída a ${m.analistaResponsavel}.`,
          autor: m.analistaResponsavel,
          tipo: "atribuida",
        },
        {
          data: diasAntes(fim, 26),
          descricao: "Documentação acrescentada pelo analista.",
        detalhe: "TAP sem pendências.",
          autor: m.analistaResponsavel,
          anexos: [`TAP ${numero}.pdf`],
          tipo: "documento-adicionado",
        },
        {
          data: diasAntes(fim, 5),
          descricao: "Análise concluída e enviada para o gestor. Aval solicitado.",
          autor: m.analistaResponsavel,
          tipo: "enviada-gestor",
        },
        {
          data: fim,
          descricao: `Solicitação validada pelo gestor. Modelo incluído no inventário (${m.numero}).`,
          detalhe: "Situação: Ativo · Monitoramento 2ª Linha (GEVAM): Não",
          autor: GESTOR,
          tipo: "validada",
        },
        // Entra sempre Ativo e não monitorado; se mudou depois, há um único registro "Modelo editado no inventário.".
        ...(monitorado || m.situacao !== "Ativo"
          ? [
              {
                data: fim,
                descricao: "Modelo editado no inventário.",
                detalhe: [
                  m.situacao !== "Ativo" ? `Situação: Ativo → ${m.situacao}` : "",
                  monitorado ? "Monitoramento 2ª Linha (GEVAM): Não → Sim" : "",
                ]
                  .filter(Boolean)
                  .join(" · "),
                autor: GESTOR,
                tipo: "situacao-alterada" as const,
              },
            ]
          : []),
      ],
    };
  });
