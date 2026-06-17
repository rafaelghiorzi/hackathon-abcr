// ============================================================================
// Dados da campanha "Meu Caminho"
// As ROTAS (geometria + eventos/popups) vivem em routes/*.json — edite lá.
// Cada evento tem `duracao_ms`: quanto tempo ele permanece na timeline.
// ATENÇÃO: todas as estatísticas são PLACEHOLDERS ILUSTRATIVOS.
// ============================================================================

import bh from "@/routes/bh.json";
import bhrio from "@/routes/bh-rio.json";
import rio from "@/routes/rio.json";
import sp from "@/routes/sp.json";

export type EventoTipo =
  | "concessionaria"
  | "logistica"
  | "seguranca"
  | "parada"
  | "curiosidade"
  | "pernoite";

export interface Evento {
  progress: number;
  tipo: EventoTipo;
  titulo: string;
  texto: string;
  destaque: string;
  duracao_ms: number;
}

export interface Parada {
  progress: number;
  nome: string;
  uf: string;
}

export interface Rota {
  id: string;
  destino: string;
  uf: string;
  origem: string;
  distancia_km: number;
  duracao_h: number;
  eventos: Evento[];
  eventosTrabalho?: Evento[];
  coords: [number, number][];
}

export const COR_PRIMARIA = "#2596be";

export const TIPO_INFO: Record<EventoTipo, { rotulo: string; cor: string }> = {
  concessionaria: { rotulo: "Concessionária", cor: "#2596be" },
  logistica:      { rotulo: "Logística",      cor: "#2f9e72" },
  seguranca:      { rotulo: "Segurança",       cor: "#e1654f" },
  parada:         { rotulo: "Parada",          cor: "#d97706" },
  curiosidade:    { rotulo: "Curiosidade",     cor: "#7c3aed" },
  pernoite:       { rotulo: "Pernoite",        cor: "#0369a1" },
};

export const ROTAS: Record<string, Rota> = {
  rio:    rio    as Rota,
  sp:     sp     as Rota,
  bh:     bh     as Rota,
  "bh-rio": bhrio as Rota,
};

export const PARADAS_POR_ROTA: Record<string, Parada[]> = {
  "bh-rio": [
    { progress: 0.17, nome: "Barbacena", uf: "MG" },
    { progress: 0.46, nome: "Juiz de Fora", uf: "MG" },
    { progress: 0.71, nome: "Três Rios", uf: "RJ" },
  ],
  rio: [
    { progress: 0.26, nome: "Cristalina", uf: "GO" },
    { progress: 0.55, nome: "C. Lafaiete", uf: "MG" },
  ],
  bh: [
    { progress: 0.28, nome: "Unaí", uf: "MG" },
    { progress: 0.76, nome: "Sete Lagoas", uf: "MG" },
  ],
  sp: [
    { progress: 0.40, nome: "Jataí", uf: "GO" },
    { progress: 0.70, nome: "Ourinhos", uf: "SP" },
  ],
};

export const RESUMOS: Record<string, { titulo: string; texto: string; destaque: string }> = {
  rio: {
    titulo: "Chegamos ao Rio de Janeiro",
    texto: "1.162 km gerenciados por concessionárias — do Planalto Central à Baía de Guanabara.",
    destaque: "Uma estrada melhor para todos",
  },
  sp: {
    titulo: "Chegamos a São Paulo",
    texto: "As concessionárias transformaram o principal corredor logístico do país.",
    destaque: "Uma estrada melhor para todos",
  },
  bh: {
    titulo: "Chegamos a Belo Horizonte",
    texto: "733 km de parceria público-privada que aproximou a capital federal ao coração industrial do Brasil.",
    destaque: "Uma estrada melhor para todos",
  },
  "bh-rio": {
    titulo: "Chegamos ao Rio de Janeiro",
    texto: "438 km gerenciados do início ao fim — pista duplicada, iluminada e patrulhada 24h.",
    destaque: "Uma estrada melhor para todos",
  },
};

// ---- Chat de entrada (Tela 1) ----
export interface CidadeOpcao {
  id: string;
  nome: string;
  uf: string;
}

// Somente Brasília como origem — BH como cidade de partida foi removido
export const ORIGENS: CidadeOpcao[] = [
  { id: "bsb", nome: "Brasília", uf: "DF" },
];

export const DESTINOS_POR_ORIGEM: Record<string, (CidadeOpcao & { rotaId: string })[]> = {
  bsb: [
    { id: "rio",  nome: "Rio de Janeiro",  uf: "RJ", rotaId: "rio"    },
    { id: "sp",   nome: "São Paulo",       uf: "SP", rotaId: "sp"     },
    { id: "bh",   nome: "Belo Horizonte",  uf: "MG", rotaId: "bh"     },
  ],
};

// Rota especial BH→Rio disponível via URL direta ou seleção avançada
export const DESTINOS: { id: string; nome: string; uf: string }[] = [
  { id: "rio", nome: "Rio de Janeiro", uf: "RJ" },
  { id: "sp",  nome: "São Paulo",      uf: "SP" },
  { id: "bh",  nome: "Belo Horizonte", uf: "MG" },
];

export const BRASILIA: [number, number] = [-15.7942, -47.8825];

// ---- Exploração (Tela 4) ----
export interface CidadeExplorada {
  nome: string;
  uf: string;
  lat: number;
  lng: number;
}

export const EXPLORACAO_MOCK = {
  estados: ["SP", "RJ", "MG", "DF", "GO", "PR"],
  cidades: [
    { nome: "São Paulo",      uf: "SP", lat: -23.5505, lng: -46.6333 },
    { nome: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729 },
    { nome: "Belo Horizonte", uf: "MG", lat: -19.9167, lng: -43.9345 },
    { nome: "Brasília",       uf: "DF", lat: -15.7942, lng: -47.8825 },
    { nome: "Campinas",       uf: "SP", lat: -22.9056, lng: -47.0608 },
    { nome: "Curitiba",       uf: "PR", lat: -25.4297, lng: -49.2715 },
    { nome: "Juiz de Fora",   uf: "MG", lat: -21.7611, lng: -43.3500 },
    { nome: "Petrópolis",     uf: "RJ", lat: -22.5050, lng: -43.1791 },
  ] as CidadeExplorada[],
  pct_brasil: 8,
};
