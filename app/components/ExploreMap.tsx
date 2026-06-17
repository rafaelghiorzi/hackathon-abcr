"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { COR_PRIMARIA, EXPLORACAO_MOCK, ROTAS } from "../data";

const TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

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

    carregarLeaflet()
      .then((L) => {
        if (!vivo || !containerRef.current) return;
        try {
          iniciar(L);
        } catch (e: any) {
          setErro("Não foi possível carregar o mapa.");
        }
      })
      .catch(() => setErro("Sem conexão com a internet."));

    async function iniciar(L: any) {
      map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
        zoomSnap: 0.5,
      });

      L.tileLayer(TILES, {
        subdomains: "abcd",
        maxZoom: 10,
        attribution: '&copy; OSM &copy; CARTO',
      }).addTo(map);

      // Carrega GeoJSON dos estados
      let geojson: any = null;
      try {
        const res = await fetch("/br-states.geojson");
        geojson = await res.json();
      } catch {
        // fallback: só o mapa sem highlight
      }

      if (!vivo) return;

      if (geojson) {
        L.geoJSON(geojson, {
          style: (feature: any) => {
            const visitado = estados.includes(feature.properties.uf);
            return {
              fillColor: visitado ? COR_PRIMARIA : "#dde8ed",
              fillOpacity: visitado ? 0.55 : 0.45,
              color: "#b0c5cd",
              weight: 1,
            };
          },
        }).addTo(map);
      }

      // Rotas percorridas — desenha as rodovias que o usuário já traçou
      const todasRotas = [...new Set([...rotasPercorridas, "bh-rio", "rio"])]; // pré-populado para a demo
      todasRotas.forEach((rid) => {
        const rota = ROTAS[rid];
        if (!rota) return;
        // Sombra branca para legibilidade
        L.polyline(rota.coords as [number,number][], {
          color: "#fff", weight: 5, opacity: 0.7, lineJoin: "round", lineCap: "round",
        }).addTo(map);
        // Linha colorida da rota
        L.polyline(rota.coords as [number,number][], {
          color: COR_PRIMARIA, weight: 3, opacity: 0.9, lineJoin: "round", lineCap: "round",
        }).addTo(map);
      });

      // Marcadores de cidades visitadas
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

      // Enquadra o Brasil inteiro
      map.fitBounds([[-33.75, -73.98], [5.27, -28.85]], { padding: [12, 12] });

      window.setTimeout(() => {
        if (vivo && map) map.invalidateSize();
      }, 80);

      setPronto(true);
    }

    return () => {
      vivo = false;
      if (map) map.remove();
    };
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
          <h2 className="text-lg font-bold text-[#14323d]">Meu mapa</h2>
          <p className="text-[12px] text-[#9bacb3]">Registre sua jornada pelo Brasil</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="anim-subir mb-4 grid grid-cols-3 gap-2" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_4px_14px_rgba(20,50,61,0.07)] border border-[#e8f0f3]">
          <p className="text-2xl font-bold" style={{ color: COR_PRIMARIA }}>
            {estados.length}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#5b727c]">estados</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_4px_14px_rgba(20,50,61,0.07)] border border-[#e8f0f3]">
          <p className="text-2xl font-bold" style={{ color: COR_PRIMARIA }}>
            {cidades.length}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#5b727c]">cidades</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_4px_14px_rgba(20,50,61,0.07)] border border-[#e8f0f3]">
          <p className="text-2xl font-bold" style={{ color: COR_PRIMARIA }}>
            {pct_brasil}%
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#5b727c]">do Brasil</p>
        </div>
      </div>

      {/* Mapa */}
      <div
        className="anim-subir relative flex-1 overflow-hidden rounded-3xl border border-[#dbe7ec] bg-[#eef2f4] shadow-[0_12px_40px_rgba(20,50,61,0.15)]"
        style={{ animationDelay: "0.15s", minHeight: 340 }}
      >
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loader */}
        {!pronto && !erro && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eef2f4]">
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d3e1e7]"
                style={{ borderTopColor: COR_PRIMARIA }}
              />
              <p className="text-sm font-medium text-[#5b727c]">Carregando…</p>
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
      <div className="anim-fade mt-3 flex items-center justify-center gap-4 text-[11px] text-[#9bacb3]" style={{ animationDelay: "0.4s" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: COR_PRIMARIA, opacity: 0.5 }} />
          Estados visitados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COR_PRIMARIA }} />
          Cidades descobertas
        </span>
      </div>

      <p className="mt-3 text-center text-[11px] text-[#b0bec5]">
        Dados ilustrativos · Opt-in do usuário
      </p>
    </div>
  );
}
