"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import { COR_PRIMARIA, PARADAS_POR_ROTA, RESUMOS, ROTAS, type Evento } from "../data";

const DURACAO = 20;
const FOLLOW_ZOOM = 7;
const TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

type Ativo = { timers: number[] };

function carregarLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.L) return resolve(w.L);
    const existente = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existente) {
      existente.addEventListener("load", () => resolve(w.L));
      existente.addEventListener("error", () => reject(new Error("CDN")));
      return;
    }
    const s = document.createElement("script");
    s.id = "leaflet-js";
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(w.L);
    s.onerror = () => reject(new Error("CDN"));
    document.head.appendChild(s);
  });
}

export default function JourneyMap({
  rotaId,
  perfil = "historico",
  onVoltar,
  onConcluida,
  onEvento,
}: {
  rotaId: string;
  perfil?: string;
  onVoltar: () => void;
  onConcluida?: () => void;
  onEvento?: (ev: Evento) => void;
}) {
  const rota = ROTAS[rotaId];
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const autoSeguirRef = useRef(true);

  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [resumo, setResumo] = useState(false);
  const [seguindo, setSeguindo] = useState(true);

  const reativarSeguir = useCallback(() => {
    autoSeguirRef.current = true;
    setSeguindo(true);
  }, []);

  useEffect(() => {
    let vivo = true;
    let map: any = null;
    let raf = 0;
    const timers: number[] = [];
    const ativos: Ativo[] = [];

    const addTimer = (fn: () => void, ms: number) => {
      const t = window.setTimeout(fn, ms);
      timers.push(t);
      return t;
    };

    carregarLeaflet()
      .then((L) => {
        if (!vivo || !containerRef.current) return;
        try { iniciar(L); }
        catch (e: any) { setErro(e?.message || "Não foi possível iniciar o mapa."); }
      })
      .catch(() => setErro("Não foi possível carregar o mapa (verifique a internet)."));

    function iniciar(L: any) {
      const coords = rota.coords as [number, number][];
      const fontEventos = rota.perfis[perfil] ?? Object.values(rota.perfis)[0] ?? [];
      const cidades = rota.cidades ?? [];
      // Evita redundância: se o perfil já tem um card da cidade (ex.: "Uberaba: …"),
      // não mostramos também o card genérico "Uberaba — MG".
      const local = (t: string) => t.split(/[—:]/)[0].trim().toLowerCase();
      const locaisDoPerfil = new Set(fontEventos.map((e) => local(e.titulo)));
      const cidadesUnicas = cidades.filter((c) => !locaisDoPerfil.has(local(c.titulo)));
      const eventos = [...fontEventos, ...cidadesUnicas].sort((a, b) => a.progress - b.progress);
      const paradas = PARADAS_POR_ROTA[rotaId] ?? [];

      const cum: number[] = [0];
      const dist = (a: [number, number], b: [number, number]) => {
        const mlat = (((a[0] + b[0]) / 2) * Math.PI) / 180;
        return Math.hypot((b[1] - a[1]) * Math.cos(mlat), b[0] - a[0]);
      };
      for (let i = 1; i < coords.length; i++)
        cum[i] = cum[i - 1] + dist(coords[i - 1], coords[i]);
      const total = cum[cum.length - 1] || 1;

      const locate = (p: number): [number, number] => {
        const target = Math.max(0, Math.min(1, p)) * total;
        let i = 0;
        while (i < cum.length - 2 && cum[i + 1] < target) i++;
        const f = Math.max(0, Math.min(1, (target - cum[i]) / (cum[i + 1] - cum[i] || 1)));
        return [coords[i][0] + (coords[i + 1][0] - coords[i][0]) * f,
                coords[i][1] + (coords[i + 1][1] - coords[i][1]) * f];
      };

      let segPtr = 0;
      const posAt = (p: number): { latlng: [number, number]; i: number } => {
        const target = p * total;
        while (segPtr < cum.length - 2 && cum[segPtr + 1] < target) segPtr++;
        const i = segPtr;
        const f = Math.max(0, Math.min(1, (target - cum[i]) / (cum[i + 1] - cum[i] || 1)));
        return {
          latlng: [coords[i][0] + (coords[i + 1][0] - coords[i][0]) * f,
                   coords[i][1] + (coords[i + 1][1] - coords[i][1]) * f],
          i,
        };
      };

      const eventosPos = eventos.map((e) => ({ ...e, latlng: locate(e.progress) }));

      map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        touchZoom: true,
        zoomSnap: 0.5,
      }).setView(coords[0], 6);

      map.on("dragstart", () => {
        autoSeguirRef.current = false;
        setSeguindo(false);
      });

      L.tileLayer(TILES, {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      // Rota cinza (fundo) + rota azul (trecho percorrido)
      L.polyline(coords, { color: "#c8d8de", weight: 6, opacity: 1, lineJoin: "round", lineCap: "round" }).addTo(map);
      const linha = L.polyline([coords[0]], { color: COR_PRIMARIA, weight: 7, opacity: 1, lineJoin: "round", lineCap: "round" }).addTo(map);

      // Waypoints
      paradas.forEach((p) => {
        const ll = locate(p.progress);
        L.marker(ll, {
          icon: L.divIcon({
            className: "mc-icon",
            html: `<div class="parada-wrapper"><div class="parada-dot"></div><div class="parada-label">${p.nome}</div></div>`,
            iconSize: [0, 0], iconAnchor: [0, 0],
          }),
          interactive: false,
        }).addTo(map);
      });

      // Origem e destino
      L.marker(coords[0], { icon: L.divIcon({ className: "mc-icon", html: '<div class="ponto-origem"></div>', iconSize: [21, 21], iconAnchor: [10, 10] }), interactive: false }).addTo(map);
      L.marker(coords[coords.length - 1], { icon: L.divIcon({ className: "mc-icon", html: '<div class="ponto-destino"></div>', iconSize: [26, 26], iconAnchor: [13, 13] }), interactive: false }).addTo(map);

      // Veículo
      const veiculo = L.marker(coords[0], {
        icon: L.divIcon({ className: "mc-icon", html: '<div class="veiculo-pulso"></div><div class="veiculo-dot"></div>', iconSize: [40, 40], iconAnchor: [20, 20] }),
        interactive: false, zIndexOffset: 1000,
      }).addTo(map);

      const iniciarViagem = () => {
        if (!vivo) return;
        segPtr = 0;
        let p = 0;
        let idx = 0;
        let lastTs: number | null = null;

        const frame = (ts: number) => {
          if (!vivo) return;
          if (lastTs == null) lastTs = ts;
          const dt = (ts - lastTs) / 1000;
          lastTs = ts;
          p = Math.min(1, p + dt / DURACAO);

          const { latlng, i } = posAt(p);
          veiculo.setLatLng(latlng);
          linha.setLatLngs([...coords.slice(0, i + 1), latlng]);
          if (autoSeguirRef.current) map.panTo(latlng, { animate: false });

          while (idx < eventosPos.length && p >= eventosPos[idx].progress) {
            onEvento?.(eventosPos[idx]);
            idx++;
          }

          setPct(Math.round(p * 100));

          if (p >= 1) {
            addTimer(() => { setResumo(true); onConcluida?.(); }, 700);
            return;
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      };

      mapRef.current = map;
      addTimer(() => map && map.invalidateSize(), 80);
      setPronto(true);

      map.fitBounds(L.latLngBounds(coords), { padding: [28, 28] });
      addTimer(() => {
        if (!vivo) return;
        map.invalidateSize();
        map.flyTo(coords[0], FOLLOW_ZOOM, { duration: 1.4 });
        addTimer(iniciarViagem, 1600);
      }, 1100);
    }

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      ativos.forEach((a) => a.timers.forEach(clearTimeout));
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotaId]);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" />

      {/* Barra de progresso */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
        <div className="h-[3px] barra-trilho">
          <div className="barra-preenchida h-full transition-none" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Zoom + seguir */}
      {pronto && !resumo && (
        <>
          <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1">
            <button onClick={() => mapRef.current?.zoomIn()} className="zoom-btn" aria-label="Zoom in">+</button>
            <button onClick={() => mapRef.current?.zoomOut()} className="zoom-btn" aria-label="Zoom out">−</button>
          </div>
          {!seguindo && (
            <button
              onClick={reativarSeguir}
              className="absolute bottom-3 right-3 z-20 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-bold shadow-[0_4px_12px_rgba(20,50,61,0.18)] hover:bg-[#f3f8fa]"
              style={{ color: COR_PRIMARIA }}
            >
              Seguir veículo
            </button>
          )}
        </>
      )}

      {/* Loader / erro */}
      {(!pronto || erro) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#eef2f4] px-6">
          {erro ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-[#14323d]">{erro}</p>
              <button onClick={onVoltar} className="mt-4 rounded-xl border border-[#dbe7ec] px-4 py-2 text-sm font-medium text-[#5b727c] hover:bg-white">Voltar</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d3e1e7]" style={{ borderTopColor: COR_PRIMARIA }} />
              <p className="text-sm font-medium text-[#5b727c]">Preparando o caminho…</p>
            </div>
          )}
        </div>
      )}

      {/* Resumo — celebração compacta da chegada (ações ficam abaixo, na página) */}
      {resumo && (
        <div className="absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3">
          <div className="popup-entra w-full max-w-xs rounded-2xl bg-white/95 p-3.5 shadow-[0_16px_44px_rgba(20,50,61,0.30)] backdrop-blur">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "#93d22a" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#08323d" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#5f9417" }}>{RESUMOS[rotaId].destaque}</p>
                <h2 className="truncate text-[14px] font-bold leading-tight text-[#14323d]">{RESUMOS[rotaId].titulo}</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
