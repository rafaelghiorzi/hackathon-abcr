"use client";

import { useState } from "react";
import ChatInput from "./components/ChatInput";
import ExploreMap from "./components/ExploreMap";
import JourneyMap from "./components/JourneyMap";
import NavPill, { type TabId } from "./components/NavPill";
import RotasUsuarios from "./components/RotasUsuarios";
import ShareCard from "./components/ShareCard";
import {
  COR_PRIMARIA,
  ROTAS, TIPO_INFO,
  TIPOS_VIAGEM,
  type Evento, type EventoTipo, type PerfilViagem,
} from "./data";

type Tela = "entrada" | "roteiro" | "compartilhar" | "exploracao" | "usuarios";

const TIPOS_SECUNDARIOS: EventoTipo[] = ["curiosidade", "concessionaria", "seguranca"];

function telaParaTab(tela: Tela): TabId | null {
  if (tela === "exploracao") return "exploracao";
  if (tela === "roteiro" || tela === "compartilhar") return "roteiro";
  if (tela === "usuarios") return "usuarios";
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
    setRotaId(id);
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
    else setTela("usuarios");
  };

  const rota = rotaId ? ROTAS[rotaId] : null;
  const tipoViagem = TIPOS_VIAGEM.find((t) => t.id === perfil);
  const _rotaDest = rota && rota.coords.length > 0 ? rota.coords[rota.coords.length - 1] : null;
  const rotaWazeUrl = _rotaDest ? `https://waze.com/ul?ll=${_rotaDest[0]},${_rotaDest[1]}&navigate=yes` : "#";
  const rotaGoogleUrl = _rotaDest ? `https://www.google.com/maps/dir/?api=1&destination=${_rotaDest[0]},${_rotaDest[1]}&travelmode=driving` : "#";

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
                style={{ background: "rgba(37,150,190,0.1)", color: COR_PRIMARIA }}
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
                  style={{ background: "rgba(37,150,190,0.1)", color: COR_PRIMARIA }}
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
                onVerRota={() => setVerRota(true)}
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
                  {perfil === "negocios" ? "Calculando logística da rota…" : "Buscando paradas e curiosidades…"}
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

      {/* Modal: Ver rota completa */}
      {verRota && rota && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-[#eef2f4] px-4 py-4">
            <button
              onClick={() => setVerRota(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2ecf0] bg-white text-[#5b727c] shadow-[0_2px_8px_rgba(20,50,61,0.06)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9bacb3]">{rota.origem} → {rota.destino}</p>
              <h2 className="text-[15px] font-bold text-[#14323d]">Sua jornada</h2>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] font-bold" style={{ color: COR_PRIMARIA }}>{rota.distancia_km.toLocaleString("pt-BR")} km</p>
              <p className="text-[10px] text-[#9bacb3]">{eventos.length} marcos</p>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {eventos.map((ev, i) => {
                const info = TIPO_INFO[ev.tipo];
                const secundario = TIPOS_SECUNDARIOS.includes(ev.tipo);
                if (secundario) {
                  return (
                    <div key={i} className="flex items-start gap-2.5 px-1 py-1">
                      <div className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ background: info.cor, opacity: 0.7 }} />
                      <p className="text-[12px] leading-relaxed text-[#8fa3ab]">
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
            </div>
          </div>

          {/* Rodapé: navegar + compartilhar */}
          <div className="shrink-0 border-t border-[#eef2f4] px-4 py-4 max-w-md mx-auto w-full flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={rotaWazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-bold text-white hover:opacity-90"
                style={{ background: COR_PRIMARIA }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
                  <circle cx="12" cy="9" r="2.5" fill={COR_PRIMARIA}/>
                </svg>
                Vamos rodar!
              </a>
              <a
                href={rotaGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#dbe7ec] py-2.5 text-[13px] font-bold text-[#5b727c] hover:bg-[#f3f8fa]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#5b727c" strokeWidth="1.8" fill="none"/>
                  <circle cx="12" cy="9" r="2.2" stroke="#5b727c" strokeWidth="1.8"/>
                </svg>
                Google Maps
              </a>
            </div>
            <button
              onClick={() => { setVerRota(false); setTela("compartilhar"); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[13px] font-semibold text-[#5b727c] border border-[#dbe7ec] hover:bg-[#f3f8fa]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Compartilhar rota
            </button>
          </div>
        </div>
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
