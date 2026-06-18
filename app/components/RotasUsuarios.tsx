"use client";

import { useState } from "react";
import { COR_PRIMARIA, type PontoRota, type RotaDetalhe, type TrechoConcessao } from "../data";
import RotaTimelineModal from "./RotaTimelineModal";

const TAG_COLORS: Record<string, string> = {
  "Seguro com filhos":    "#2f9e72",
  "Trajeto mais rápido":  "#0c667f",
  "Cobertura total":      "#0369a1",
  "Rota turística":       "#7c3aed",
  "Para caminhoneiros":   "#d97706",
  "Menor custo":          "#2f9e72",
  "Pista dupla integral": "#0c667f",
};

interface RotaCard {
  cor: string;
  origem: PontoRota;
  destino: PontoRota;
  km: number;
  pontos: PontoRota[];
  trechos: TrechoConcessao[];
  porque: string;
  tags: string[];
}

const MOCK_ROTAS: RotaCard[] = [
  {
    cor: "#0369a1",
    origem: { nome: "Brasília", uf: "DF", descricao: "Partida no Planalto Central pela BR-040, a Rodovia JK." },
    destino: { nome: "Belo Horizonte", uf: "MG", descricao: "Chegada à capital mineira, porta da Estrada Real." },
    km: 746,
    pontos: [
      { nome: "Cristalina", uf: "GO", descricao: "Capital nacional do cristal. Daqui a Via Cristais cuida dos 594 km até BH." },
      { nome: "Sete Lagoas", uf: "MG", descricao: "A 60 km de BH, última parada com boa estrutura antes da capital." },
    ],
    trechos: [
      { rodovia: "BR-040", concessionaria: "Via Cristais", nota: "Cristalina → BH · R$ 12 bi · 168 km de faixas adicionais" },
      { rodovia: "BR-040", concessionaria: "EPR Via Mineira", nota: "Entrada de BH · 4 faixas/sentido até 2027" },
    ],
    porque: "O caminho mais rápido pela BR-040 (Rota dos Cristais): a Via Cristais investe R$ 12 bi com 168 km de faixas adicionais, e a chegada a BH terá 4 faixas por sentido até 2027.",
    tags: ["Trajeto mais rápido", "Pista dupla integral", "Cobertura total"],
  },
  {
    cor: "#7c3aed",
    origem: { nome: "Brasília", uf: "DF", descricao: "Partida pela BR-060 rumo ao Triângulo Mineiro." },
    destino: { nome: "Belo Horizonte", uf: "MG", descricao: "Chegada a BH após o circuito turístico do Triângulo." },
    km: 1160,
    pontos: [
      { nome: "Goiânia", uf: "GO", descricao: "Capital Art Déco e da boa gastronomia goiana." },
      { nome: "Uberaba", uf: "MG", descricao: "Terra dos fósseis (Peirópolis) e do Mercado Municipal histórico." },
      { nome: "Araxá", uf: "MG", descricao: "Águas sulfurosas, Grande Hotel Art Déco e o queijo premiado em Paris." },
    ],
    trechos: [
      { rodovia: "BR-060/153", concessionaria: "Triunfo Concebra", nota: "Brasília → Triângulo · 630 km · R$ 7,15 bi / 30 anos" },
      { rodovia: "BR-262", concessionaria: "Triunfo Concebra", nota: "Triângulo → BH · 546 km · socorro médico e mecânico" },
    ],
    porque: "Rota turística pelo Triângulo Mineiro: Uberaba, Araxá e suas termas, queijos premiados e dinossauros. A Triunfo Concebra mantém socorro em todos os ~1.160 km do percurso.",
    tags: ["Rota turística", "Cobertura total"],
  },
  {
    cor: "#2f9e72",
    origem: { nome: "Rio de Janeiro", uf: "RJ", descricao: "Subida da Serra de Petrópolis pela BR-040." },
    destino: { nome: "Belo Horizonte", uf: "MG", descricao: "Chegada a BH pela Zona da Mata mineira." },
    km: 438,
    pontos: [
      { nome: "Petrópolis", uf: "RJ", descricao: "Cidade Imperial: Museu Imperial e Casa de Santos Dumont encantam as crianças." },
      { nome: "Juiz de Fora", uf: "MG", descricao: "Maior cidade da Zona da Mata, ótima para esticar as pernas e almoçar." },
      { nome: "Congonhas", uf: "MG", descricao: "Os Doze Profetas de Aleijadinho, Patrimônio Mundial da UNESCO." },
    ],
    trechos: [
      { rodovia: "BR-040/495", concessionaria: "Elovias", nota: "Rio → Juiz de Fora · serra duplicada 4→6 faixas" },
      { rodovia: "BR-040", concessionaria: "EPR Via Mineira", nota: "Juiz de Fora → BH · 500 km de faixas requalificadas" },
    ],
    porque: "Rota turística pela Estrada Real: Petrópolis imperial e o barroco de Congonhas. Elovias e EPR Via Mineira mantêm pista renovada, câmeras e socorro 24h — tranquila para viajar em família.",
    tags: ["Rota turística", "Seguro com filhos", "Cobertura total"],
  },
  {
    cor: "#e1654f",
    origem: { nome: "Juiz de Fora", uf: "MG", descricao: "Início na Zona da Mata mineira, rumo ao litoral." },
    destino: { nome: "Rio de Janeiro", uf: "RJ", descricao: "Chegada ao Rio pela descida da serra." },
    km: 182,
    pontos: [
      { nome: "Três Rios", uf: "RJ", descricao: "Entrada do Rio, no encontro de três rios. Última parada antes da serra." },
      { nome: "Petrópolis", uf: "RJ", descricao: "No alto da serra, a Cidade Imperial; daqui é a descida para o Rio." },
    ],
    trechos: [
      { rodovia: "BR-040/495", concessionaria: "Elovias", nota: "Serra de Petrópolis 4→6 faixas · R$ 8,8 bi · túnel retomado" },
    ],
    porque: "Toda concedida pela Elovias: a Serra de Petrópolis está sendo duplicada de 4 para 6 faixas, com faixa de escape e socorro 24h — a descida mais segura para o Rio.",
    tags: ["Pista dupla integral", "Trajeto mais rápido", "Cobertura total"],
  },
];

interface Props {
  onVoltar: () => void;
}

export default function RotasUsuarios({ onVoltar }: Props) {
  const [aberta, setAberta] = useState<number | null>(null);

  const detalheDe = (r: RotaCard): RotaDetalhe => ({
    titulo: `${r.origem.nome} → ${r.destino.nome}`,
    distancia_km: r.km,
    paradas_count: r.pontos.length,
    origem: r.origem,
    destino: r.destino,
    paradas: r.pontos,
    trechos: r.trechos,
  });

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
          <button
            key={i}
            onClick={() => setAberta(i)}
            className="anim-subir w-full overflow-hidden rounded-3xl border border-[#e8f0f3] bg-white text-left shadow-[0_4px_18px_rgba(20,50,61,0.07)] transition-all hover:border-[#cfe1e8] hover:shadow-[0_8px_26px_rgba(20,50,61,0.12)] active:scale-[0.99]"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Cabeçalho da rota */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: `${r.cor}12` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#14323d]">{r.origem.nome}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#9bacb3]">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-bold text-[#14323d]">{r.destino.nome}</span>
              </div>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold" style={{ color: r.cor }}>
                ver rota
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-[#f0f5f7] border-b border-[#f0f5f7] px-0">
              {[
                { valor: r.pontos.length, label: "paradas" },
                { valor: r.trechos.length, label: "trechos concedidos" },
                { valor: `${r.km} km`, label: "percurso" },
              ].map((s, j) => (
                <div key={j} className="py-2.5 text-center">
                  <p className="text-[15px] font-bold" style={{ color: COR_PRIMARIA }}>{s.valor}</p>
                  <p className="text-[10px] font-medium text-[#9bacb3]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Por que essa rota é boa */}
            <div className="px-4 py-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9bacb3]">Por que essa rota é boa</p>
              <p className="text-[12px] leading-relaxed text-[#5b727c]">{r.porque}</p>

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
          </button>
        ))}

        <p className="pt-2 text-center text-[11px] text-[#b0bec5]">
          Dados ilustrativos · ABCR 2025
        </p>
      </div>

      {/* Modal de timeline da rota selecionada */}
      {aberta !== null && (
        <RotaTimelineModal
          detalhe={detalheDe(MOCK_ROTAS[aberta])}
          onFechar={() => setAberta(null)}
        />
      )}
    </div>
  );
}
