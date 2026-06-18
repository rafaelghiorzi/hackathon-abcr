"use client";

import { useState } from "react";
import { ROTAS, RESUMOS, COR_PRIMARIA } from "../data";

interface Props {
  rotaId: string;
  onFechar: () => void;
}

const MOCK_URL = "meucaminho.app/v/j7k2m";

export default function ShareCard({ rotaId, onFechar }: Props) {
  const rota = ROTAS[rotaId];
  const resumo = RESUMOS[rotaId];
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#14323d]/50 backdrop-blur-sm sm:items-center">
      <div className="popup-entra w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-[0_-16px_60px_rgba(20,50,61,0.3)] sm:rounded-3xl">
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#e2ecf0]" />

        <p className="text-center text-[11px] font-bold uppercase tracking-[.12em] text-[#9bacb3]">
          Compartilhar viagem
        </p>

        {/* Card de preview — é o que aparece no link compartilhado */}
        <div
          className="mt-4 overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #14323d 0%, #1a4a5a 100%)",
          }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.2 12 21 12 21z" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinejoin="round"/>
                <circle cx="12" cy="10.5" r="2.3" fill="rgba(255,255,255,0.6)"/>
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-[.12em] text-white/60">
                Meu Caminho
              </span>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              {rota.origem} → {rota.destino}
            </p>
            <h3 className="text-xl font-bold text-white leading-tight">
              {resumo.titulo}
            </h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              {resumo.texto}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-white">
                  {rota.distancia_km.toLocaleString("pt-BR")}
                </p>
                <p className="text-[10px] text-white/60 font-medium">km percorridos</p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-white">
                  {Object.values(rota.perfis)[0]?.length ?? 0}
                </p>
                <p className="text-[10px] text-white/60 font-medium">marcos no caminho</p>
              </div>
            </div>
          </div>

          {/* Rodapé do card */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: COR_PRIMARIA }}
          >
            <span className="text-sm font-bold text-white">{resumo.destaque}</span>
            <span className="text-[11px] font-medium text-white/80">{MOCK_URL}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={copiar}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all"
            style={{ background: copiado ? "#2f9e72" : COR_PRIMARIA }}
          >
            {copiado ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Link copiado!
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="#fff" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Copiar link
              </>
            )}
          </button>
          <button
            onClick={onFechar}
            className="rounded-2xl border border-[#dbe7ec] px-4 py-3 text-sm font-semibold text-[#5b727c] transition-colors hover:bg-[#f3f8fa]"
          >
            Fechar
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-[#b0bec5]">
          Demo ilustrativa · dados não reais
        </p>
      </div>
    </div>
  );
}
