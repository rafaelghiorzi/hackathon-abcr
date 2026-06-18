"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { COR_ACENTO, COR_ACENTO_DARK, COR_PRIMARIA, EXPLORACAO_MOCK } from "../data";

const TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
// Bounds do Brasil: SW = [-33.75, -73.98], NE = [5.27, -28.85]
const BR_BOUNDS: [[number, number], [number, number]] = [[-33.75, -73.98], [5.27, -28.85]];

// Rotas visuais aproximadas saindo de Brasília (traçado pelas rodovias principais)
const ROTAS_VISUAIS: [number, number][][] = [
  // Brasília → Rio de Janeiro via BR-040
  [
    [-15.7942, -47.8825], // Brasília
    [-16.7675, -47.6147], // Cristalina GO
    [-19.2736, -44.4047], // Paraopeba MG
    [-19.9208, -43.9378], // Belo Horizonte MG
    [-20.6603, -43.7861], // Conselheiro Lafaiete MG
    [-21.7642, -43.3503], // Juiz de Fora MG
    [-22.1167, -43.2089], // Três Rios RJ
    [-22.5050, -43.1789], // Petrópolis RJ
    [-22.9068, -43.1729], // Rio de Janeiro
  ],
  // Brasília → Manaus via BR-060/070/364/319
  [
    [-15.7942, -47.8825], // Brasília
    [-16.6869, -49.2648], // Goiânia GO
    [-17.8800, -51.7200], // Jataí GO
    [-15.8900, -52.2600], // Barra do Garças MT
    [-15.6010, -56.0974], // Cuiabá MT
    [-12.7400, -60.1400], // Vilhena RO
    [-10.8800, -61.9500], // Ji-Paraná RO
    [-8.7619,  -63.9039], // Porto Velho RO
    [-5.8100,  -61.3000], // Manicoré AM
    [-3.1190,  -60.0217], // Manaus AM
  ],
  // Brasília → Fortaleza via BR-020/116
  [
    [-15.7942, -47.8825], // Brasília
    [-15.5400, -47.3400], // Formosa GO
    [-12.1500, -44.9900], // Barreiras BA
    [-11.3200, -41.8600], // Jacobina BA
    [-9.3900,  -40.5000], // Juazeiro BA
    [-8.0700,  -39.1300], // Salgueiro PE
    [-7.2100,  -39.3200], // Juazeiro do Norte CE
    [-4.5700,  -37.7700], // Sobral CE
    [-3.7319,  -38.5267], // Fortaleza CE
  ],
  // Brasília → Porto Alegre via BR-050/BR-116
  [
    [-15.7942, -47.8825], // Brasília
    [-16.7675, -47.6147], // Cristalina GO
    [-18.9180, -48.2760], // Uberlândia MG
    [-19.7472, -47.9381], // Uberaba MG
    [-21.1700, -47.8100], // Ribeirão Preto SP
    [-23.5505, -46.6333], // São Paulo SP
    [-25.4300, -49.2700], // Curitiba PR
    [-27.8200, -50.3200], // Lages SC
    [-29.1700, -51.1800], // Caxias do Sul RS
    [-30.0346, -51.2177], // Porto Alegre RS
  ],
];

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

interface Props {
  onVoltar: () => void;
  rotasPercorridas?: string[];
}

export default function ExploreMap({ onVoltar, rotasPercorridas = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const { estados, cidades, pct_brasil } = EXPLORACAO_MOCK;

  useEffect(() => {
    let vivo = true;
    let map: any = null;
    const timers: number[] = [];

    const t = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    carregarLeaflet().then((L) => {
      if (!vivo || !containerRef.current) return;

      // Inicializa com centro explícito para que fitBounds funcione mesmo antes do resize
      map = L.map(containerRef.current, {
        center: [-14, -51],
        zoom: 4,
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomSnap: 0.5,
      });

      L.tileLayer(TILES, {
        subdomains: "abcd",
        maxZoom: 12,
        attribution: "&copy; OSM &copy; CARTO",
      }).addTo(map);

      // Força dimensionamento antes de qualquer fitBounds
      map.invalidateSize();

      // Carrega GeoJSON dos estados de forma assíncrona, sem bloquear a init
      fetch("/br-states.geojson")
        .then((r) => r.json())
        .then((geojson) => {
          if (!vivo || !map) return;

          // Camada de estados (fill + borda)
          L.geoJSON(geojson, {
            style: (feature: any) => {
              const visitado = estados.includes(feature.properties.uf);
              return {
                fillColor: visitado ? COR_ACENTO : "#dde8ed",
                fillOpacity: visitado ? 0.55 : 0.40,
                color: visitado ? COR_ACENTO_DARK : "#b0c5cd",
                weight: visitado ? 1 : 0.8,
              };
            },
          }).addTo(map);
        })
        .catch(() => { /* silencioso — mapa funciona sem os estados */ });

      // 4 rotas visuais saindo de Brasília
      ROTAS_VISUAIS.forEach((coords) => {
        L.polyline(coords, { color: "#fff", weight: 8, opacity: 0.6, lineJoin: "round", lineCap: "round" }).addTo(map);
        L.polyline(coords, { color: COR_PRIMARIA, weight: 4, opacity: 1, lineJoin: "round", lineCap: "round" }).addTo(map);
        L.circleMarker(coords[coords.length - 1], { radius: 5, fillColor: "#14323d", color: "#fff", weight: 2, fillOpacity: 1 }).addTo(map);
      });
      // Ponto de origem único (Brasília)
      L.circleMarker(ROTAS_VISUAIS[0][0], { radius: 6, fillColor: COR_PRIMARIA, color: "#fff", weight: 2, fillOpacity: 1 }).addTo(map);

      // Cidades descobertas
      cidades.forEach((c) => {
        L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: "mc-icon",
            html: `<div class="cidade-dot"></div><div class="cidade-label">${c.nome}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
        }).addTo(map);
      });

      // fitBounds seguro: container já dimensionado acima
      map.fitBounds(BR_BOUNDS, { padding: [16, 16] });

      // Segundo invalidate + refit após render do DOM
      t(() => {
        if (!vivo || !map) return;
        map.invalidateSize();
        map.fitBounds(BR_BOUNDS, { padding: [16, 16] });
        setPronto(true);
      }, 120);

    }).catch(() => {
      if (vivo) setErro("Não foi possível carregar o mapa.");
    });

    return () => {
      vivo = false;
      timers.forEach(clearTimeout);
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* Cabeçalho */}
      <div className="anim-subir mb-4 flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2ecf0] bg-white text-[#5b727c] shadow-[0_2px_8px_rgba(20,50,61,0.06)] transition-colors hover:bg-[#f3f8fa]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h2 className="font-display text-lg font-extrabold tracking-tight text-[#08323d]">Meu mapa</h2>
          <p className="text-[12px] text-[#9bacb3]">O Brasil que você já percorreu</p>
        </div>
      </div>

      {/* Stats */}
      <div className="anim-subir mb-3 grid grid-cols-3 gap-2" style={{ animationDelay: "0.1s" }}>
        {[
          { val: estados.length, label: "estados" },
          { val: cidades.length, label: "cidades" },
          { val: `${pct_brasil}%`, label: "do Brasil" },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border p-3 text-center shadow-[0_4px_14px_rgba(20,50,61,0.07)]"
            style={{ borderColor: "#dcefc2", background: "#f6fbee" }}
          >
            <p className="text-2xl font-extrabold" style={{ color: COR_ACENTO_DARK }}>{s.val}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-[#5b727c]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mapa */}
      <div
        className="anim-subir relative flex-1 overflow-hidden rounded-3xl border border-[#dbe7ec] bg-[#eef2f4] shadow-[0_12px_40px_rgba(20,50,61,0.15)]"
        style={{ animationDelay: "0.15s", minHeight: 320 }}
      >
        <div ref={containerRef} className="absolute inset-0" />

        {!pronto && !erro && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eef2f4]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d3e1e7]" style={{ borderTopColor: COR_PRIMARIA }} />
              <p className="text-sm font-medium text-[#5b727c]">Carregando mapa…</p>
            </div>
          </div>
        )}

        {erro && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eef2f4] p-6">
            <p className="text-center text-sm text-[#5b727c]">{erro}</p>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="anim-fade mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#9bacb3]" style={{ animationDelay: "0.4s" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: COR_ACENTO, opacity: 0.7 }} />
          Estados visitados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-5 rounded-full" style={{ background: COR_PRIMARIA }} />
          Rodovias percorridas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COR_ACENTO_DARK }} />
          Cidades
        </span>
      </div>

      <p className="mt-2 text-center text-[11px] text-[#b0bec5] pb-20">
        Dados ilustrativos · Opt-in do usuário
      </p>
    </div>
  );
}
