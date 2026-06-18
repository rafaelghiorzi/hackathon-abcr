"use client";

import {
  COR_ACENTO_DARK,
  concessionariasDasRotas,
  CONCESSIONARIAS,
  type Concessionaria,
} from "../data";

interface Props {
  onVoltar: () => void;
  rotasPercorridas?: string[];
}

export default function Concessionarias({ onVoltar, rotasPercorridas = [] }: Props) {
  // Quem o usuário cruzou na viagem; sem viagem ainda, mostra todas (demo).
  const cruzadas = concessionariasDasRotas(rotasPercorridas);
  const lista: Concessionaria[] = cruzadas.length > 0 ? cruzadas : Object.values(CONCESSIONARIAS);

  return (
    <div className="flex flex-1 flex-col">
      <div className="anim-subir mb-4 flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2ecf0] bg-white text-[#5b727c] shadow-[0_2px_8px_rgba(20,50,61,0.06)] transition-colors hover:bg-[#f3f8fa]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h2 className="font-display text-lg font-extrabold tracking-tight text-[#08323d]">Quem cuida da sua viagem</h2>
          <p className="text-[12px] text-[#9bacb3]">As concessionárias que você cruzou no caminho</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-24">
        {lista.map((c, i) => (
          <div
            key={c.nome}
            className="anim-subir overflow-hidden rounded-3xl border border-[#e8f0f3] bg-white shadow-[0_4px_18px_rgba(20,50,61,0.07)]"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Cabeçalho */}
            <div className="px-4 py-3.5" style={{ background: `${c.cor}12`, borderLeft: `4px solid ${c.cor}` }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-[17px] font-extrabold tracking-tight" style={{ color: c.cor }}>
                  {c.nome}
                </span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-[#5b727c]">{c.grupo}</span>
              </div>
              <p className="mt-0.5 text-[11px] font-semibold text-[#5b727c]">
                {c.rodovia} · {c.trecho}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 divide-x divide-[#f0f5f7] border-b border-[#f0f5f7]">
              {c.stats.map((s, j) => (
                <div key={j} className="px-1 py-2.5 text-center">
                  <p className="text-[13px] font-extrabold" style={{ color: COR_ACENTO_DARK }}>{s.valor}</p>
                  <p className="text-[8.5px] font-medium leading-tight text-[#9bacb3]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* O que fazem por você */}
            <div className="px-4 py-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9bacb3]">O que fazem por você</p>
              <ul className="flex flex-col gap-1.5">
                {c.oQueFaz.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-[12px] leading-snug text-[#5b727c]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-[2px] shrink-0">
                      <circle cx="12" cy="12" r="11" fill={`${COR_ACENTO_DARK}1a`} />
                      <path d="M7 12.5l3 3 7-7" stroke={COR_ACENTO_DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* História humana */}
            <div className="mx-4 mb-4 rounded-2xl border-l-[3px] p-3" style={{ background: "#f3faea", borderColor: "#93d22a" }}>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 11h4v4a4 4 0 0 1-4 4M13 11h4v4a4 4 0 0 1-4 4M7 11V8a4 4 0 0 1 4-4M13 11V8a4 4 0 0 1 4-4" stroke="#5f9417" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[12px] font-extrabold text-[#3f6310]">{c.historia.titulo}</p>
              </div>
              <p className="mt-1 text-[12px] italic leading-relaxed text-[#4a6a1f]">“{c.historia.texto}”</p>
              <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#7aa32f]">{c.historia.pessoa}</p>
            </div>
          </div>
        ))}

        <p className="pt-1 text-center text-[11px] text-[#b0bec5]">
          Investimentos e obras: dados públicos · Histórias ilustrativas · ABCR 2025
        </p>
      </div>
    </div>
  );
}
