import { useState, type ReactNode } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { Panel, FormActions } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { InlineAlert } from "../../components/ui/ErrorState";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { CamposInformacoesModelo } from "../../components/modelo/CamposDadosModelo";
import {
  INFORMACOES_MODELO_VAZIAS,
  semErros,
  validarInformacoesModelo,
  type ErrosInformacoesModelo,
} from "../../components/modelo/dadosModelo";
import { novoCalculo, ultimos } from "../../components/modelo/tier";
import { novaMatriz } from "../../components/modelo/matrizRisco";
import { useProfile } from "../../context/ProfileContext";
import { currentUserNameByProfile } from "../../data/currentUser";
import type { CalculoTier, InformacoesModelo, MatrizRisco } from "../../types";
import { AbaCalculoTier } from "../ConsultarModelo/AbaCalculoTier";
import { AbaMatrizRisco } from "../ConsultarModelo/AbaMatrizRisco";
import { InventariarForm, type InventariarDados } from "./InventariarForm";

type Passo = "inventariar" | "calculo-tier" | "matriz-risco" | "informacoes-modelo";

/** Mesmas abas (e na mesma ordem) da solicitação em Consultar modelos. */
const PASSOS: { key: Passo; label: string }[] = [
  { key: "inventariar", label: "Inventariar" },
  { key: "calculo-tier", label: "Cálculo do Tier" },
  { key: "matriz-risco", label: "Matriz de Risco" },
  { key: "informacoes-modelo", label: "Informações do Modelo" },
];

const DADOS_VAZIOS: InventariarDados = {
  situacaoModelo: "",
  validado: "",
  monitoramento: "",
  nomeModelo: "",
  tipoModelo: "",
  publico: "",
  areaGestora: "",
  objetivo: "",
};

function gerarCodigoInventario() {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

/** Botões fora de um painel: sem a linha e o espaço do rodapé de formulário. */
function AcoesSoltas({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-3">{children}</div>;
}

/** Voltar / Avançar no pé de cada passo; mostra o que falta quando não dá para avançar. */
function Navegacao({
  onVoltar,
  onAvancar,
  avancar,
  icone = "chev-right",
  pendencia,
  solta,
}: {
  onVoltar: () => void;
  onAvancar: () => void;
  avancar: string;
  icone?: "chev-right" | "check";
  pendencia?: ReactNode;
  /** Fora de um painel: sem a linha e o espaço do rodapé de formulário. */
  solta?: boolean;
}) {
  const Acoes = solta ? AcoesSoltas : FormActions;
  return (
    <div className="flex flex-col gap-4">
      {pendencia && (
        <InlineAlert tone="warning" title="Antes de continuar">
          <p>{pendencia}</p>
        </InlineAlert>
      )}
      <Acoes>
        <Button variant="secondary" icon="chev-left" onClick={onVoltar}>
          Voltar
        </Button>
        {icone === "check" ? (
          <Button variant="primary" icon="check" onClick={onAvancar}>
            {avancar}
          </Button>
        ) : (
          <Button variant="primary" iconRight="chev-right" onClick={onAvancar}>
            {avancar}
          </Button>
        )}
      </Acoes>
    </div>
  );
}

/**
 * Inventariar modelo em 4 passos (abas): dados do modelo → Cálculo do Tier →
 * Matriz de Risco → Informações do Modelo. Os passos 2 a 4 usam os mesmos componentes das
 * abas da solicitação. Só avança com o passo atual completo; dá para voltar sem perder nada.
 */
export function InventariarWizard() {
  const { profile } = useProfile();
  const usuario = currentUserNameByProfile[profile];

  const [passo, setPasso] = useState<Passo>("inventariar");
  /** Último passo liberado (os seguintes ficam desabilitados nas abas). */
  const [liberado, setLiberado] = useState(0);

  const [dados, setDados] = useState<InventariarDados>(DADOS_VAZIOS);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [informacoesModelo, setInformacoesModelo] = useState<InformacoesModelo>(INFORMACOES_MODELO_VAZIAS);
  const [infoModeloErros, setInfoModeloErros] = useState<ErrosInformacoesModelo>({});
  const [calculos, setCalculos] = useState<CalculoTier[]>([]);
  const [matrizes, setMatrizes] = useState<MatrizRisco[]>([]);
  /** Tentou avançar sem concluir o passo (mostra o aviso). */
  const [tentou, setTentou] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);

  const { calculo, recalculo } = ultimos(calculos);
  const tierAtual = recalculo ?? calculo;

  function irPara(indice: number) {
    setLiberado((l) => Math.max(l, indice));
    setPasso(PASSOS[indice].key);
    setTentou(false);
    window.scrollTo({ top: 0 });
  }

  function voltar(indice: number) {
    setPasso(PASSOS[indice].key);
    setTentou(false);
  }

  function avancarTier() {
    if (calculo) irPara(2);
    else setTentou(true);
  }

  function avancarMatriz() {
    if (matrizes.length) irPara(3);
    else setTentou(true);
  }

  function incluir() {
    const e = validarInformacoesModelo(informacoesModelo);
    setInfoModeloErros(e);
    if (semErros(e)) setCodigo(gerarCodigoInventario());
  }

  function recomecar() {
    setCodigo(null);
    setDados(DADOS_VAZIOS);
    setArquivo(null);
    setInformacoesModelo(INFORMACOES_MODELO_VAZIAS);
    setInfoModeloErros({});
    setCalculos([]);
    setMatrizes([]);
    setTentou(false);
    setLiberado(0);
    setPasso("inventariar");
  }

  return (
    <div>
      <PageHeader title="Inventariar modelo" description="Registre um modelo existente no inventário corporativo." />

      <Tabs
        items={PASSOS.map((p, i) => ({ key: p.key, label: p.label, disabled: i > liberado }))}
        activeKey={passo}
        onChange={(p) => {
          setPasso(p);
          setTentou(false);
        }}
      />

      <div className="mt-6">
        {passo === "inventariar" && (
          <InventariarForm
            form={dados}
            onChange={setDados}
            file={arquivo}
            onFileChange={setArquivo}
            onAvancar={() => irPara(1)}
          />
        )}

        {passo === "calculo-tier" && (
          <div className="flex flex-col gap-5">
            <AbaCalculoTier
              key={calculos.length}
              informacoes={tierAtual?.parametros}
              calculos={calculos}
              editavel
              onCalcular={(parametros) => {
                setCalculos((c) => [...c, novoCalculo({ tipo: "Cálculo", parametros, usuario })]);
                setTentou(false);
              }}
              onRecalcular={(d) =>
                setCalculos((c) => [...c, novoCalculo({ tipo: "Recálculo", ...d, usuario })])
              }
            />
            <Navegacao
              solta
              onVoltar={() => voltar(0)}
              onAvancar={avancarTier}
              avancar="Avançar"
              pendencia={tentou && !calculo ? "Calcule o Tier para seguir para a Matriz de Risco." : undefined}
            />
          </div>
        )}

        {passo === "matriz-risco" && (
          <div className="flex flex-col gap-5">
            <AbaMatrizRisco
              key={`${matrizes.length}-${tierAtual?.tier ?? ""}`}
              registros={matrizes}
              tierCalculado={tierAtual?.tier}
              editavel
              onRegistrar={(d) => {
                setMatrizes((m) => [...m, novaMatriz(m, d, usuario)]);
                setTentou(false);
              }}
            />
            <Navegacao
              solta
              onVoltar={() => voltar(1)}
              onAvancar={avancarMatriz}
              avancar="Avançar"
              pendencia={tentou && !matrizes.length ? "Calcule a Matriz de Risco para seguir para as Informações do Modelo." : undefined}
            />
          </div>
        )}

        {passo === "informacoes-modelo" && (
          <Panel title="Informações do Modelo">
            <p className="-mt-1 mb-6 text-body text-ink-2">Preencha as seções abaixo.</p>
            <CamposInformacoesModelo
              value={informacoesModelo}
              onChange={(v) => {
                setInformacoesModelo(v);
                setInfoModeloErros({});
              }}
              errors={infoModeloErros}
            />
            <Navegacao onVoltar={() => voltar(2)} onAvancar={incluir} avancar="Incluir no inventário" icone="check" />
          </Panel>
        )}

      </div>

      <SuccessModal
        open={codigo !== null}
        message="Modelo inventariado com sucesso."
        code={codigo ?? ""}
        onClose={recomecar}
      />
    </div>
  );
}
