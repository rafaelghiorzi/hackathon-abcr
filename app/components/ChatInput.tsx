"use client";

import { useEffect, useRef, useState } from "react";
import {
  COR_PRIMARIA,
  DESTINOS_POR_ORIGEM,
  ORIGENS,
  TIPOS_VIAGEM,
  type CidadeOpcao,
  type PerfilViagem,
} from "../data";

type TipoViagem = typeof TIPOS_VIAGEM[number];

interface Props {
  onRota: (rotaId: string, perfil: PerfilViagem) => void;
  onExplorar: () => void;
  rotaConcluida?: boolean;
}

type Etapa = "origem" | "destino" | "perfil" | "confirmando";

const PERGUNTAS: Record<Etapa, string> = {
  origem: "De onde você vai partir?",
  destino: "Certo! E qual é o seu destino?",
  perfil: "Boa escolha! E como você quer viajar?",
  confirmando: "Show! Confere os detalhes e bora?",
};

// Avatar do assistente
function BotAvatar() {
  return (
    <div
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{ background: COR_PRIMARIA }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.2 12 21 12 21z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="12" cy="10.5" r="2.3" fill="#fff" />
      </svg>
    </div>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-subir flex gap-2.5">
      <BotAvatar />
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[#e8f0f3] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(20,50,61,0.08)]">
        <p className="text-[14px] font-medium text-[#14323d]">{children}</p>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-subir flex justify-end">
      <div
        className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: COR_PRIMARIA }}
      >
        {children}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="anim-fade flex gap-2.5">
      <BotAvatar />
      <div className="flex items-center rounded-2xl rounded-tl-sm border border-[#e8f0f3] bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(20,50,61,0.08)]">
        <div className="thinking-dots flex gap-1">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default function ChatInput({ onRota }: Props) {
  const [etapa, setEtapa] = useState<Etapa>("origem");
  const [origem, setOrigem] = useState<CidadeOpcao | null>(null);
  const [destino, setDestino] = useState<(CidadeOpcao & { rotaId: string }) | null>(null);
  const [tipoViagem, setTipoViagem] = useState<TipoViagem | null>(null);
  const [typing, setTyping] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  // Rola para a última mensagem a cada novo turno
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [etapa, typing, origem, destino, tipoViagem]);

  // Avança para a próxima etapa simulando o assistente "digitando"
  const responder = (proxima: Etapa) => {
    setTyping(true);
    window.setTimeout(() => {
      setEtapa(proxima);
      setTyping(false);
    }, 750);
  };

  const escolherOrigem = (o: CidadeOpcao) => {
    setOrigem(o);
    responder("destino");
  };

  const escolherDestino = (d: CidadeOpcao & { rotaId: string }) => {
    setDestino(d);
    responder("perfil");
  };

  const escolherPerfil = (tp: TipoViagem) => {
    setTipoViagem(tp);
    responder("confirmando");
  };

  const confirmar = () => {
    if (destino && tipoViagem) onRota(destino.rotaId, tipoViagem.id);
  };

  const reiniciar = () => {
    setOrigem(null);
    setDestino(null);
    setTipoViagem(null);
    setTyping(false);
    setEtapa("origem");
  };

  const destinosDisponiveis = origem ? (DESTINOS_POR_ORIGEM[origem.id] ?? []) : [];

  // Etapas já "alcançadas" (para revelar as bolhas anteriores do bot)
  const ordem: Etapa[] = ["origem", "destino", "perfil", "confirmando"];
  const idxAtual = ordem.indexOf(etapa);
  const chegou = (e: Etapa) => ordem.indexOf(e) <= idxAtual;

  return (
    <div className="flex flex-1 flex-col">
      {/* Cabeçalho */}
      <div className="anim-subir mb-6" style={{ animationDelay: "0.05s" }}>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#14323d] sm:text-4xl">
          Para onde
          <br />
          vamos?
        </h1>
        <p className="mt-2 text-[15px] text-[#5b727c]">
          Planeje sua viagem e descubra o que as concessionárias constroem no seu caminho.
        </p>
      </div>

      {/* Conversa */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Turno 1 — origem */}
        <BotBubble>{PERGUNTAS.origem}</BotBubble>
        {etapa === "origem" && !typing && (
          <div className="anim-subir ml-9 flex flex-col gap-2">
            {ORIGENS.map((o) => (
              <button
                key={o.id}
                onClick={() => escolherOrigem(o)}
                className="flex items-center gap-3 rounded-2xl border border-[#e2ecf0] bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(20,50,61,0.06)] transition-all hover:border-[#0c667f] hover:shadow-[0_6px_20px_rgba(12, 102, 127,0.15)] active:scale-[0.98]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                  style={{ background: "rgba(12, 102, 127,0.1)", color: COR_PRIMARIA }}
                >
                  {o.uf}
                </span>
                <span className="font-semibold text-[#14323d]">{o.nome}</span>
              </button>
            ))}
          </div>
        )}
        {origem && <UserBubble>{origem.nome}</UserBubble>}

        {/* Turno 2 — destino */}
        {chegou("destino") && <BotBubble>{PERGUNTAS.destino}</BotBubble>}
        {etapa === "destino" && !typing && (
          <div className="anim-subir ml-9 flex flex-col gap-2">
            {destinosDisponiveis.map((d) => (
              <button
                key={d.id}
                onClick={() => escolherDestino(d)}
                className="flex items-center gap-3 rounded-2xl border border-[#e2ecf0] bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(20,50,61,0.06)] transition-all hover:border-[#0c667f] hover:shadow-[0_6px_20px_rgba(12, 102, 127,0.15)] active:scale-[0.98]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                  style={{ background: "rgba(12, 102, 127,0.1)", color: COR_PRIMARIA }}
                >
                  {d.uf}
                </span>
                <span className="font-semibold text-[#14323d]">{d.nome}</span>
              </button>
            ))}
          </div>
        )}
        {destino && <UserBubble>{destino.nome}</UserBubble>}

        {/* Turno 3 — perfil */}
        {chegou("perfil") && <BotBubble>{PERGUNTAS.perfil}</BotBubble>}
        {etapa === "perfil" && !typing && (
          <div className="anim-subir ml-9 flex flex-col gap-2">
            {TIPOS_VIAGEM.map((tp) => (
              <button
                key={tp.id}
                onClick={() => escolherPerfil(tp)}
                className="flex items-center gap-3 rounded-2xl border border-[#e2ecf0] bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(20,50,61,0.06)] transition-all hover:border-[#0c667f] hover:shadow-[0_6px_20px_rgba(12, 102, 127,0.15)] active:scale-[0.98]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold"
                  style={{ background: "rgba(12, 102, 127,0.1)", color: COR_PRIMARIA }}
                >
                  {tp.abrev}
                </span>
                <div>
                  <p className="font-semibold text-[#14323d]">{tp.rotulo}</p>
                  <p className="text-[11px] text-[#9bacb3]">{tp.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {tipoViagem && <UserBubble>{tipoViagem.rotulo}</UserBubble>}

        {/* Turno 4 — confirmação */}
        {chegou("confirmando") && <BotBubble>{PERGUNTAS.confirmando}</BotBubble>}
        {etapa === "confirmando" && !typing && origem && destino && tipoViagem && (
          <div className="anim-subir ml-9">
            <div className="rounded-2xl rounded-tl-sm border border-[#e8f0f3] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(20,50,61,0.08)]">
              <p className="text-sm text-[#5b727c]">
                Rota de{" "}
                <span className="font-semibold text-[#14323d]">{origem.nome}</span>
                {" "}até{" "}
                <span className="font-semibold text-[#14323d]">{destino.nome}</span>
                {" "}— perfil{" "}
                <span className="font-semibold text-[#14323d]">{tipoViagem.rotulo}</span>.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={confirmar}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: COR_PRIMARIA }}
                >
                  Ver o caminho
                </button>
                <button
                  onClick={reiniciar}
                  className="rounded-xl border border-[#dbe7ec] px-3 py-2.5 text-sm font-medium text-[#5b727c] transition-colors hover:bg-[#f3f8fa]"
                >
                  Recomeçar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de digitação do assistente */}
        {typing && <Typing />}

        <div ref={fimRef} />
      </div>
    </div>
  );
}
