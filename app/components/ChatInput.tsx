"use client";

import { useState } from "react";
import { COR_PRIMARIA, DESTINOS_POR_ORIGEM, ORIGENS, type CidadeOpcao } from "../data";

interface Props {
  onRota: (rotaId: string) => void;
  onExplorar: () => void;
  rotaConcluida?: boolean;
}

type Etapa = "origem" | "destino" | "confirmando";

export default function ChatInput({ onRota, onExplorar, rotaConcluida = false }: Props) {
  const [etapa, setEtapa] = useState<Etapa>("origem");
  const [origem, setOrigem] = useState<CidadeOpcao | null>(null);
  const [destino, setDestino] = useState<(CidadeOpcao & { rotaId: string }) | null>(null);

  const escolherOrigem = (o: CidadeOpcao) => {
    setOrigem(o);
    setEtapa("destino");
  };

  const escolherDestino = (d: CidadeOpcao & { rotaId: string }) => {
    setDestino(d);
    setEtapa("confirmando");
  };

  const confirmar = () => {
    if (destino) onRota(destino.rotaId);
  };

  const reiniciar = () => {
    setOrigem(null);
    setDestino(null);
    setEtapa("origem");
  };

  const destinosDisponiveis = origem ? (DESTINOS_POR_ORIGEM[origem.id] ?? []) : [];

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

      {/* Bolhas de chat */}
      <div className="flex flex-1 flex-col gap-4">

        {/* Mensagem do app */}
        <div className="anim-subir flex gap-2.5" style={{ animationDelay: "0.15s" }}>
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: COR_PRIMARIA }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.2 12 21 12 21z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round"/>
              <circle cx="12" cy="10.5" r="2.3" fill="#fff"/>
            </svg>
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-[0_4px_16px_rgba(20,50,61,0.08)] border border-[#e8f0f3]">
            <p className="text-[14px] font-medium text-[#14323d]">
              {etapa === "origem" && "De onde você vai partir?"}
              {etapa === "destino" && `Certo! E qual é o seu destino?`}
              {etapa === "confirmando" && "Vamos lá?"}
            </p>
          </div>
        </div>

        {/* Resposta — seleção de origem */}
        {etapa === "origem" && (
          <div className="anim-subir ml-9 flex flex-col gap-2" style={{ animationDelay: "0.28s" }}>
            {ORIGENS.map((o) => (
              <button
                key={o.id}
                onClick={() => escolherOrigem(o)}
                className="flex items-center gap-3 rounded-2xl border border-[#e2ecf0] bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(20,50,61,0.06)] transition-all hover:border-[#2596be] hover:shadow-[0_6px_20px_rgba(37,150,190,0.15)] active:scale-[0.98]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                  style={{ background: "rgba(37,150,190,0.1)", color: COR_PRIMARIA }}
                >
                  {o.uf}
                </span>
                <span className="font-semibold text-[#14323d]">{o.nome}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bolha de resposta do usuário — origem escolhida */}
        {origem && etapa !== "origem" && (
          <div className="anim-fade flex justify-end">
            <div
              className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: COR_PRIMARIA }}
            >
              {origem.nome}
            </div>
          </div>
        )}

        {/* Seleção de destino */}
        {etapa === "destino" && (
          <div className="anim-subir ml-9 flex flex-col gap-2" style={{ animationDelay: "0.1s" }}>
            {destinosDisponiveis.map((d) => (
              <button
                key={d.id}
                onClick={() => escolherDestino(d)}
                className="flex items-center gap-3 rounded-2xl border border-[#e2ecf0] bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(20,50,61,0.06)] transition-all hover:border-[#2596be] hover:shadow-[0_6px_20px_rgba(37,150,190,0.15)] active:scale-[0.98]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                  style={{ background: "rgba(37,150,190,0.1)", color: COR_PRIMARIA }}
                >
                  {d.uf}
                </span>
                <span className="font-semibold text-[#14323d]">{d.nome}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bolha de resposta do usuário — destino escolhido */}
        {destino && etapa === "confirmando" && (
          <div className="anim-fade flex justify-end">
            <div
              className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: COR_PRIMARIA }}
            >
              {destino.nome}
            </div>
          </div>
        )}

        {/* Confirmação */}
        {etapa === "confirmando" && origem && destino && (
          <div className="anim-subir ml-9" style={{ animationDelay: "0.15s" }}>
            <div className="rounded-2xl rounded-tl-sm border border-[#e8f0f3] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(20,50,61,0.08)]">
              <p className="text-sm text-[#5b727c]">
                Rota de{" "}
                <span className="font-semibold text-[#14323d]">{origem.nome}</span>
                {" "}até{" "}
                <span className="font-semibold text-[#14323d]">{destino.nome}</span>{" "}
                via rodovias concedidas. Pronto para partir?
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
                  Trocar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
