"use client";

import { COR_PRIMARIA } from "../data";

const TAG_COLORS: Record<string, string> = {
  "Seguro com filhos":    "#2f9e72",
  "Trajeto mais rápido":  "#2596be",
  "Cobertura total":      "#0369a1",
  "Rota turística":       "#7c3aed",
  "Para caminhoneiros":   "#d97706",
  "Menor custo":          "#2f9e72",
  "Pista dupla integral": "#2596be",
};

const MOCK_ROTAS = [
  {
    cor: "#e1654f",
    origem: "Juiz de Fora",
    destino: "Rio de Janeiro",
    km: 182,
    paradas: 2,
    trechos_concedidos: 2,
    descricao: "Via BR-040. Trecho operado pela Elovias (ex-Concer). Serra das Araras com faixa de escape.",
    tags: ["Cobertura total", "Pista dupla integral", "Trajeto mais rápido"],
  },
  {
    cor: "#2f9e72",
    origem: "Brasília",
    destino: "São Paulo",
    km: 1004,
    paradas: 3,
    trechos_concedidos: 4,
    descricao: "BR-153 via Goiânia, Jataí e Ourinhos. Passa por CONCEBRA, Transbrasiliana e CCR AutoBAn.",
    tags: ["Para caminhoneiros", "Menor custo", "Cobertura total"],
  },
  {
    cor: "#7c3aed",
    origem: "Rio de Janeiro",
    destino: "Belo Horizonte",
    km: 438,
    paradas: 4,
    trechos_concedidos: 2,
    descricao: "Via BR-040. Passa por Petrópolis, Três Rios e Juiz de Fora. Elovias e EPR na rota.",
    tags: ["Rota turística", "Seguro com filhos", "Cobertura total"],
  },
  {
    cor: "#0369a1",
    origem: "Brasília",
    destino: "Belo Horizonte",
    km: 733,
    paradas: 2,
    trechos_concedidos: 2,
    descricao: "Via BR-040 pela Rota dos Cristais (Vinci Highways). Cristalina e Sete Lagoas na rota.",
    tags: ["Trajeto mais rápido", "Para caminhoneiros", "Pista dupla integral"],
  },
];

interface Props {
  onVoltar: () => void;
}

export default function RotasUsuarios({ onVoltar }: Props) {
  return (
    <div className="flex flex-1 flex-col">
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
          <h2 className="text-lg font-bold text-[#14323d]">Rotas dos Usuários</h2>
          <p className="text-[12px] text-[#9bacb3]">Percursos populares via rodovias concedidas</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-20">
        {MOCK_ROTAS.map((r, i) => (
          <div
            key={i}
            className="anim-subir rounded-3xl border border-[#e8f0f3] bg-white shadow-[0_4px_18px_rgba(20,50,61,0.07)]"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Cabeçalho da rota */}
            <div
              className="flex items-center justify-between rounded-t-3xl px-4 py-3"
              style={{ background: `${r.cor}12` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#14323d]">{r.origem}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#9bacb3]">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-bold text-[#14323d]">{r.destino}</span>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: `${r.cor}20`, color: r.cor }}
              >
                {r.km.toLocaleString("pt-BR")} km
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-[#f0f5f7] border-b border-[#f0f5f7] px-0">
              {[
                { valor: r.paradas, label: "paradas" },
                { valor: r.trechos_concedidos, label: "trechos conc." },
                { valor: `${r.km} km`, label: "percurso" },
              ].map((s, j) => (
                <div key={j} className="py-2.5 text-center">
                  <p className="text-[15px] font-bold" style={{ color: COR_PRIMARIA }}>{s.valor}</p>
                  <p className="text-[10px] font-medium text-[#9bacb3]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Descrição */}
            <div className="px-4 py-3">
              <p className="text-[12px] leading-relaxed text-[#5b727c]">{r.descricao}</p>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{
                      background: `${TAG_COLORS[tag] ?? COR_PRIMARIA}15`,
                      color: TAG_COLORS[tag] ?? COR_PRIMARIA,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <p className="pt-2 text-center text-[11px] text-[#b0bec5]">
          Dados ilustrativos · ABCR 2025
        </p>
      </div>
    </div>
  );
}
