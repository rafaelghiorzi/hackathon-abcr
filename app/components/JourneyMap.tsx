"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ROTAS, TIPO_INFO, COR_PRIMARIA, BRASILIA, type Evento } from "../data";

// Tempo (em segundos) de deslocamento puro do veículo, sem contar as pausas.
const DURACAO = 24;
// Zoom de acompanhamento da câmera.
const FOLLOW_ZOOM = 7;
// Tempo que cada card permanece na tela.
const CARD_MS = 3300;

type CardState = { ev: Evento; saindo: boolean } | null;

export default function JourneyMap({
  rotaId,
  onVoltar,
}: {
  rotaId: string;
  onVoltar: () => void;
}) {
  const rota = ROTAS[rotaId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [pct, setPct] = useState(0);
  const [card, setCard] = useState<CardState>(null);
  const [resumo, setResumo] = useState(false);

  useEffect(() => {
    if (!leafletReady || !containerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const coords = rota.coords as [number, number][];
    const eventos = [...rota.eventos].sort((a, b) => a.progress - b.progress);

    // ---- Mapa + tiles "clean" estilo Waze (CartoDB Positron) ----
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.25,
      preferCanvas: true,
    }).setView(BRASILIA, 6);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }
    ).addTo(map);

    // ---- Geometria: traçado de fundo (cinza) e traçado animado (azul) ----
    L.polyline(coords, {
      color: "#cfd8dc",
      weight: 5,
      opacity: 0.9,
      lineJoin: "round",
      lineCap: "round",
    }).addTo(map);

    const linhaAnimada = L.polyline([coords[0]], {
      color: rota.cor,
      weight: 6,
      opacity: 1,
      lineJoin: "round",
      lineCap: "round",
    }).addTo(map);

    // ---- Pinos de origem e destino ----
    L.marker(coords[0], {
      icon: L.divIcon({
        className: "ponto-icon",
        html: `<div class="ponto-dot" style="background:${COR_PRIMARIA}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      interactive: false,
    }).addTo(map);

    L.marker(coords[coords.length - 1], {
      icon: L.divIcon({
        className: "ponto-icon",
        html: `<div style="font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">🏁</div>`,
        iconSize: [26, 26],
        iconAnchor: [6, 24],
      }),
      interactive: false,
    }).addTo(map);

    // ---- Marcador do veículo ----
    const veiculo = L.marker(coords[0], {
      icon: L.divIcon({
        className: "veiculo-icon",
        html: `<div class="veiculo-pulso"></div><div class="veiculo-pino">🚗</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map);

    // ---- Pré-cálculo de distâncias acumuladas (velocidade constante) ----
    const cum: number[] = [0];
    const distEq = (a: number[], b: number[]) => {
      const mlat = (((a[0] + b[0]) / 2) * Math.PI) / 180;
      const dx = (b[1] - a[1]) * Math.cos(mlat);
      const dy = b[0] - a[0];
      return Math.hypot(dx, dy);
    };
    for (let i = 1; i < coords.length; i++) {
      cum[i] = cum[i - 1] + distEq(coords[i - 1], coords[i]);
    }
    const total = cum[cum.length - 1] || 1;

    let segPtr = 0;
    const posAt = (p: number): { latlng: [number, number]; i: number } => {
      const target = p * total;
      while (segPtr < cum.length - 1 && cum[segPtr + 1] < target) segPtr++;
      const i = Math.min(segPtr, coords.length - 2);
      const segLen = cum[i + 1] - cum[i] || 1;
      const f = Math.max(0, Math.min(1, (target - cum[i]) / segLen));
      const lat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * f;
      const lng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * f;
      return { latlng: [lat, lng], i };
    };

    const aplicar = (p: number) => {
      const { latlng, i } = posAt(p);
      veiculo.setLatLng(latlng);
      linhaAnimada.setLatLngs([...coords.slice(0, i + 1), latlng]);
      map.panTo(latlng, { animate: false });
    };

    // ---- Loop de animação ----
    let p = 0;
    let idx = 0;
    let raf = 0;
    let lastTs: number | null = null;
    let pausado = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let vivo = true;

    const dispararEvento = (ev: Evento) => {
      pausado = true;
      setCard({ ev, saindo: false });
      timers.push(
        setTimeout(() => {
          setCard((c) => (c ? { ...c, saindo: true } : c));
        }, CARD_MS - 450)
      );
      timers.push(
        setTimeout(() => {
          setCard(null);
          lastTs = null;
          pausado = false;
        }, CARD_MS)
      );
    };

    const frame = (ts: number) => {
      if (!vivo) return;
      if (pausado) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (lastTs == null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      p = Math.min(1, p + dt / DURACAO);

      if (idx < eventos.length && p >= eventos[idx].progress) {
        const ev = eventos[idx];
        idx++;
        aplicar(eventos[idx - 1].progress);
        setPct(Math.round(eventos[idx - 1].progress * 100));
        dispararEvento(ev);
        raf = requestAnimationFrame(frame);
        return;
      }

      aplicar(p);
      setPct(Math.round(p * 100));

      if (p >= 1) {
        timers.push(setTimeout(() => setResumo(true), 600));
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    // Intro: foca Brasília, depois começa a percorrer.
    const arranque = setTimeout(() => {
      if (!vivo) return;
      map.setView(coords[0], FOLLOW_ZOOM, { animate: true, duration: 0.8 });
      timers.push(
        setTimeout(() => {
          if (vivo) raf = requestAnimationFrame(frame);
        }, 900)
      );
    }, 500);
    timers.push(arranque);

    // Garante o tamanho correto do mapa após montagem.
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady, rotaId]);

  const info = card ? TIPO_INFO[card.ev.tipo] : null;

  return (
    <div className="relative h-full w-full">
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="afterInteractive"
        onReady={() => setLeafletReady(true)}
      />

      {/* Mapa */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Barra de progresso + cabeçalho */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-4 sm:p-5">
        <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-[0_8px_30px_rgba(20,50,61,0.12)] backdrop-blur sm:gap-4 sm:p-4">
          <button
            onClick={onVoltar}
            aria-label="Voltar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5b727c] transition-colors hover:bg-[#eef4f6] hover:text-[#14323d]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M11 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-semibold text-[#14323d]">
                Brasília → {rota.destino}
              </p>
              <p className="shrink-0 text-xs font-medium text-[#5b727c]">
                {rota.distancia_km.toLocaleString("pt-BR")} km
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full barra-trilho">
              <div
                className="barra-preenchida h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loader enquanto o Leaflet carrega */}
      {!leafletReady && (
        <div className="absolute inset-0 z-[1500] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dbe7ec] border-t-primary"
              style={{ borderTopColor: COR_PRIMARIA }}
            />
            <p className="text-sm font-medium text-[#5b727c]">
              Preparando o caminho…
            </p>
          </div>
        </div>
      )}

      {/* Card de evento */}
      {card && info && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1200] flex justify-center p-4 sm:p-6">
          <div
            className={`pointer-events-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(20,50,61,0.22)] ${
              card.saindo ? "card-sai" : "card-entra"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "rgba(37,150,190,0.12)" }}
              >
                {info.icone}
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: COR_PRIMARIA }}
                >
                  {info.rotulo}
                </p>
                <h3 className="text-lg font-bold leading-tight text-[#14323d]">
                  {card.ev.titulo}
                </h3>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5b727c]">
              {card.ev.texto}
            </p>
            <div
              className="mt-4 rounded-2xl px-4 py-3 text-center text-base font-bold"
              style={{ background: "rgba(37,150,190,0.1)", color: COR_PRIMARIA }}
            >
              {card.ev.destaque}
            </div>
          </div>
        </div>
      )}

      {/* Card final de resumo */}
      {resumo && (
        <div className="absolute inset-0 z-[1400] flex items-center justify-center bg-[#14323d]/30 p-6 backdrop-blur-sm">
          <div className="card-entra w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_24px_70px_rgba(20,50,61,0.3)]">
            <div className="mx-auto mb-4 text-5xl">🏁</div>
            <h2 className="text-2xl font-bold leading-tight text-[#14323d]">
              {rota.resumo.titulo}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5b727c]">
              {rota.resumo.texto}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f3f8fa] p-4">
                <p
                  className="text-2xl font-bold"
                  style={{ color: COR_PRIMARIA }}
                >
                  {rota.distancia_km.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs font-medium text-[#5b727c]">km percorridos</p>
              </div>
              <div className="rounded-2xl bg-[#f3f8fa] p-4">
                <p
                  className="text-2xl font-bold"
                  style={{ color: COR_PRIMARIA }}
                >
                  {rota.eventos.length}
                </p>
                <p className="text-xs font-medium text-[#5b727c]">
                  marcos no caminho
                </p>
              </div>
            </div>

            <div
              className="mt-5 rounded-2xl px-4 py-3 text-base font-bold text-white"
              style={{ background: COR_PRIMARIA }}
            >
              {rota.resumo.destaque}
            </div>

            <button
              onClick={onVoltar}
              className="mt-6 w-full rounded-2xl border border-[#e6edf0] py-3 text-sm font-semibold text-[#14323d] transition-colors hover:bg-[#f3f8fa]"
            >
              Escolher outro destino
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
