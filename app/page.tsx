"use client";

import { useState } from "react";
import { ROTAS, TIPO_INFO, COR_PRIMARIA, type Evento } from "./data";
import ChatInput from "./components/ChatInput";
import JourneyMap from "./components/JourneyMap";
import ShareCard from "./components/ShareCard";
import ExploreMap from "./components/ExploreMap";
import RotasUsuarios from "./components/RotasUsuarios";
import NavPill, { type TabId } from "./components/NavPill";

type Tela = "entrada" | "roteiro" | "compartilhar" | "exploracao" | "usuarios";
type Modo = "turistico" | "trabalho";

function telaParaTab(tela: Tela): TabId | null {
  if (tela === "exploracao") return "exploracao";
  if (tela === "roteiro" || tela === "compartilhar") return "roteiro";
  if (tela === "usuarios") return "usuarios";
  return null;
}

export default function Home() {
  const [tela, setTela] = useState<Tela>("entrada");
  const [rotaId, setRotaId] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>("turistico");
  const [rotaConcluida, setRotaConcluida] = useState(false);
  const [rotasPercorridas, setRotasPercorridas] = useState<string[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [animando, setAnimando] = useState(false);

  const irParaRota = (id: string) => {
    setRotaId(id);
    setEventos([]);
    setAnimando(false);
    setTela("roteiro");
  };

  const trocarModo = (novoModo: Modo) => {
    setModo(novoModo);
    setEventos([]);
    setAnimando(false);
  };

  const voltar = () => {
    setRotaId(null);
    setEventos([]);
    setAnimando(false);
    setTela("entrada");
  };

  const onTab = (tab: TabId) => {
    if (tab === "roteiro" && rotaId) setTela("roteiro");
    else if (tab === "exploracao") setTela("exploracao");
    else setTela("usuarios");
  };

  const rota = rotaId ? ROTAS[rotaId] : null;

  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-white to-[#eef5f8] px-4 py-5 sm:py-7">
      <div className="flex w-full max-w-md flex-1 flex-col">

        {tela !== "exploracao" && tela !== "usuarios" && (
          <div className="anim-fade mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: COR_PRIMARIA }}>
              <path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.2 12 21 12 21z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="12" cy="10.5" r="2.3" fill="currentColor"/>
            </svg>
            <span className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: COR_PRIMARIA }}>
              Meu Caminho
            </span>
          </div>
        )}

        {/* Tela 1 */}
        {tela === "entrada" && (
          <ChatInput
            onRota={irParaRota}
            onExplorar={() => setTela("exploracao")}
            rotaConcluida={rotaConcluida}
          />
        )}

        {/* Tela 2 — roteiro */}
        {(tela === "roteiro" || tela === "compartilhar") && rota && rotaId && (
          <div className="flex flex-1 flex-col">

            {/* Cabeçalho + toggle modo */}
            <div className="anim-subir mb-3 flex items-center gap-2 rounded-2xl border border-[#e2ecf0] bg-white p-2.5 shadow-[0_6px_24px_rgba(20,50,61,0.05)]">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                style={{ background: "rgba(37,150,190,0.1)", color: COR_PRIMARIA }}
              >
                {rota.uf}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9bacb3]">{rota.origem} →</p>
                <p className="truncate text-[14px] font-bold text-[#14323d]">{rota.destino}</p>
              </div>

              {/* Toggle turístico / trabalho */}
              <div className="flex shrink-0 gap-0.5 rounded-xl border border-[#e2ecf0] bg-[#f3f8fa] p-0.5">
                {(["turistico", "trabalho"] as Modo[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => trocarModo(m)}
                    className="rounded-[10px] px-2.5 py-1 text-[10px] font-bold capitalize transition-all"
                    style={
                      modo === m
                        ? { background: COR_PRIMARIA, color: "#fff" }
                        : { color: "#5b727c" }
                    }
                  >
                    {m === "turistico" ? "Turístico" : "Trabalho"}
                  </button>
                ))}
              </div>

              <button
                onClick={voltar}
                className="shrink-0 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#eef4f6]"
                style={{ color: COR_PRIMARIA }}
              >
                Trocar
              </button>
            </div>

            {/* Mapa */}
            <div
              className="anim-subir relative overflow-hidden rounded-3xl border border-[#dbe7ec] bg-[#eef2f4] shadow-[0_12px_36px_rgba(20,50,61,0.15)]"
              style={{ animationDelay: "0.1s", height: "46vh", minHeight: 240 }}
            >
              <JourneyMap
                key={`${rotaId}-${modo}`}
                rotaId={rotaId}
                modo={modo}
                onVoltar={voltar}
                onCompartilhar={() => setTela("compartilhar")}
                onConcluida={() => {
                  setRotaConcluida(true);
                  setRotasPercorridas((p) => [...new Set([...p, rotaId])]);
                }}
                onEvento={(ev) => {
                  setAnimando(true);
                  setEventos((prev) => [...prev, ev]);
                }}
              />
            </div>

            {/* Animação "pensando" — enquanto nenhum evento chegou ainda */}
            {!animando && eventos.length === 0 && (
              <div className="anim-fade mt-3 flex items-center gap-3 rounded-2xl border border-[#e8f0f3] bg-white px-4 py-3">
                <div className="thinking-dots flex gap-1">
                  <span /><span /><span />
                </div>
                <p className="text-[12px] text-[#9bacb3]">
                  {modo === "turistico" ? "Buscando paradas e curiosidades…" : "Calculando logística da rota…"}
                </p>
              </div>
            )}

            {/* Timeline de eventos */}
            {eventos.length > 0 && (
              <div
                className="anim-fade mt-3 flex flex-1 flex-col gap-2 overflow-y-auto"
                style={{ minHeight: 80, paddingBottom: rotaConcluida ? 84 : 0 }}
              >
                {eventos.map((ev, i) => {
                  const info = TIPO_INFO[ev.tipo];
                  return (
                    <div
                      key={i}
                      className="timeline-item rounded-2xl border border-[#e8f0f3] bg-white p-3 shadow-[0_2px_8px_rgba(20,50,61,0.04)]"
                      style={{ "--tipo-cor": info.cor } as React.CSSProperties}
                    >
                      <span
                        className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: `${info.cor}18`, color: info.cor }}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: info.cor }} />
                        {info.rotulo}
                      </span>
                      <p className="text-[13px] font-bold leading-tight text-[#14323d]">{ev.titulo}</p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#5b727c]">{ev.texto}</p>
                      <div
                        className="mt-1.5 inline-block rounded-xl px-2.5 py-1 text-[10.5px] font-bold"
                        style={{ background: `${info.cor}15`, color: info.cor }}
                      >
                        {ev.destaque}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Spacer quando sem eventos mas já concluído */}
            {rotaConcluida && eventos.length === 0 && animando && <div className="h-20" />}
          </div>
        )}

        {/* Tela 4 — exploração */}
        {tela === "exploracao" && (
          <ExploreMap onVoltar={voltar} rotasPercorridas={rotasPercorridas} />
        )}

        {/* Tela 5 — rotas dos usuários */}
        {tela === "usuarios" && (
          <RotasUsuarios onVoltar={voltar} />
        )}
      </div>

      {/* Share overlay */}
      {tela === "compartilhar" && rotaId && (
        <ShareCard rotaId={rotaId} onFechar={() => setTela("roteiro")} />
      )}

      {/* Pill de navegação */}
      {rotaConcluida && (
        <NavPill ativa={telaParaTab(tela)} onTab={onTab} />
      )}
    </main>
  );
}
