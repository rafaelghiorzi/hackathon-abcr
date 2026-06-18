"use client";

import { useState } from "react";
import ChatInput from "./components/ChatInput";
import ExploreMap from "./components/ExploreMap";
import JourneyMap from "./components/JourneyMap";
import NavPill, { type TabId } from "./components/NavPill";
import Concessionarias from "./components/Concessionarias";
import RotasUsuarios from "./components/RotasUsuarios";
import RotaTimelineModal from "./components/RotaTimelineModal";
import ShareCard from "./components/ShareCard";
import {
  COR_PRIMARIA,
  montarRotaDetalhe,
  resolveRotaId,
  ROTAS, TIPO_INFO,
  TIPOS_VIAGEM,
  type Evento, type EventoTipo, type PerfilViagem,
} from "./data";

type Tela = "entrada" | "roteiro" | "compartilhar" | "exploracao" | "usuarios" | "responsaveis";

const TIPOS_SECUNDARIOS: EventoTipo[] = ["curiosidade", "concessionaria", "seguranca", "logistica"];

function telaParaTab(tela: Tela): TabId | null {
  if (tela === "exploracao") return "exploracao";
  if (tela === "roteiro" || tela === "compartilhar") return "roteiro";
  if (tela === "usuarios") return "usuarios";
  if (tela === "responsaveis") return "responsaveis";
  return null;
}

export default function Home() {
  const [tela, setTela] = useState<Tela>("entrada");
  const [rotaId, setRotaId] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilViagem>("historico");
  const [rotaConcluida, setRotaConcluida] = useState(false);
  const [rotasPercorridas, setRotasPercorridas] = useState<string[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [animando, setAnimando] = useState(false);
  const [verRota, setVerRota] = useState(false);

  const irParaRota = (id: string, perf: PerfilViagem) => {
    setRotaId(resolveRotaId(id, perf));
    setPerfil(perf);
    setEventos([]);
    setAnimando(false);
    setTela("roteiro");
  };

  const voltar = () => {
    setRotaId(null);
    setEventos([]);
    setAnimando(false);
    setVerRota(false);
    setTela("entrada");
  };

  const onTab = (tab: TabId) => {
    if (tab === "roteiro" && rotaId) {
      setTela("roteiro");
      // Leaflet precisa recalcular tamanho após display:none → display:flex
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    } else if (tab === "exploracao") setTela("exploracao");
    else if (tab === "responsaveis") setTela("responsaveis");
    else setTela("usuarios");
  };

  const rota = rotaId ? ROTAS[rotaId] : null;
  const tipoViagem = TIPOS_VIAGEM.find((t) => t.id === perfil);
  const rotaDetalhe = rotaId ? montarRotaDetalhe(rotaId) : null;

  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-white to-[#eef5f8] px-4 py-5 sm:py-7">
      <div className="flex w-full max-w-md flex-1 flex-col">

        {tela !== "exploracao" && tela !== "usuarios" && tela !== "responsaveis" && (
          <div className="anim-fade mb-4 flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(12,102,127,0.3)]"
              style={{ background: COR_PRIMARIA }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.2 12 21 12 21z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round"/>
                <circle cx="12" cy="10.5" r="2.3" fill="#93d22a"/>
              </svg>
            </span>
            <div className="leading-none">
              <p className="font-display text-[15px] font-extrabold tracking-tight text-[#08323d]">Meu Caminho</p>
              <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#9bacb3]">Melhores Rodovias</p>
            </div>
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

        {/* Tela 2 — sempre montada enquanto há rota, escondida nas outras abas */}
        {rota && rotaId && (
          <div
            className="flex flex-1 flex-col"
            style={{ display: (tela === "roteiro" || tela === "compartilhar") ? "flex" : "none" }}
          >

            {/* Cabeçalho */}
            <div className="anim-subir mb-3 flex items-center gap-2 rounded-2xl border border-[#e2ecf0] bg-white p-2.5 shadow-[0_6px_24px_rgba(20,50,61,0.05)]">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                style={{ background: "rgba(12, 102, 127,0.1)", color: COR_PRIMARIA }}
              >
                {rota.uf}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9bacb3]">{rota.origem} →</p>
                <p className="truncate text-[14px] font-bold text-[#14323d]">{rota.destino}</p>
              </div>

              {/* Perfil selecionado (badge estático) */}
              {tipoViagem && (
                <span
                  className="shrink-0 rounded-xl px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: "rgba(12, 102, 127,0.1)", color: COR_PRIMARIA }}
                >
                  {tipoViagem.rotulo}
                </span>
              )}

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
              style={{ animationDelay: "0.1s", height: "36vh", minHeight: 200 }}
            >
              <JourneyMap
                key={`${rotaId}-${perfil}`}
                rotaId={rotaId}
                perfil={perfil}
                onVoltar={voltar}
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
                  {perfil === "rapida" ? "Calculando o trajeto mais rápido…" : "Buscando paradas e curiosidades…"}
                </p>
              </div>
            )}

            {/* Timeline de eventos */}
            {eventos.length > 0 && (
              <div
                className="anim-fade mt-3 flex flex-1 flex-col gap-1.5 overflow-y-auto"
                style={{ minHeight: 80, paddingBottom: rotaConcluida ? 84 : 0 }}
              >
                {eventos.map((ev, i) => {
                  const info = TIPO_INFO[ev.tipo];
                  const secundario = TIPOS_SECUNDARIOS.includes(ev.tipo);
                  if (secundario) {
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 px-1 py-0.5"
                        style={{ animation: "subir 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
                      >
                        <div className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ background: info.cor, opacity: 0.7 }} />
                        <p className="text-[11.5px] leading-relaxed text-[#8fa3ab]">
                          <span className="font-semibold" style={{ color: info.cor }}>{ev.titulo}</span>
                          {" — "}{ev.texto}
                        </p>
                      </div>
                    );
                  }
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

                {/* Botão de visualizar rota — aparece ao fim da animação e dos cards */}
                {rotaConcluida && (
                  <button
                    onClick={() => setVerRota(true)}
                    className="btn-siga anim-subir mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Visualizar rota
                  </button>
                )}
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

        {/* Tela 6 — responsáveis (concessionárias) */}
        {tela === "responsaveis" && (
          <Concessionarias onVoltar={voltar} rotasPercorridas={rotasPercorridas} />
        )}
      </div>

      {/* Modal: Ver rota completa (timeline) */}
      {verRota && rotaDetalhe && (
        <RotaTimelineModal
          detalhe={rotaDetalhe}
          onFechar={() => setVerRota(false)}
          onCompartilhar={() => { setVerRota(false); setTela("compartilhar"); }}
        />
      )}

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
