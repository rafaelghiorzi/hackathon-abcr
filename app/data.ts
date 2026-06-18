// ============================================================================
// Dados da campanha "Meu Caminho"
// As ROTAS (geometria + eventos/popups) vivem em routes/*.json — edite lá.
// Cada evento tem `duracao_ms`: quanto tempo ele permanece na timeline.
// ATENÇÃO: todas as estatísticas são PLACEHOLDERS ILUSTRATIVOS.
// ============================================================================

import bh    from "@/routes/bh.json";
import bhtri from "@/routes/bh-triangulo.json";
import rio   from "@/routes/rio.json";

export type EventoTipo =
  | "concessionaria"
  | "logistica"
  | "seguranca"
  | "parada"
  | "curiosidade"
  | "pernoite"
  | "cidade";

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

export interface TrechoConcessao {
  rodovia: string;
  concessionaria: string;
  nota: string;
}

export interface Rota {
  id: string;
  destino: string;
  uf: string;
  origem: string;
  origem_uf?: string;
  distancia_km: number;
  duracao_h: number;
  perfis: Record<string, Evento[]>;
  cidades?: Evento[];
  trechos?: TrechoConcessao[];
  coords: [number, number][];
}

// Estrutura genérica consumida pelo modal de timeline (RotaTimelineModal).
export interface PontoRota {
  nome: string;
  uf: string;
  descricao: string;
}

export interface RotaDetalhe {
  titulo: string;
  distancia_km: number;
  paradas_count: number;
  origem: PontoRota;
  destino: PontoRota;
  paradas: PontoRota[];
  trechos: TrechoConcessao[];
}

// Paleta da marca ABCR "Melhores Rodovias"
export const COR_PRIMARIA = "#0c667f";       // azul
export const COR_ACENTO = "#93d22a";         // verde (energia / "siga")
export const COR_ACENTO_DARK = "#5f9417";    // verde legível como texto sobre branco
export const COR_TINTA = "#08323d";          // tinta escura (texto forte)

export const TIPO_INFO: Record<EventoTipo, { rotulo: string; cor: string }> = {
  concessionaria: { rotulo: "Concessionária", cor: "#0c667f" },
  logistica:      { rotulo: "Logística",      cor: "#2f9e72" },
  seguranca:      { rotulo: "Segurança",       cor: "#e1654f" },
  parada:         { rotulo: "Parada",          cor: "#d97706" },
  curiosidade:    { rotulo: "Curiosidade",     cor: "#7c3aed" },
  pernoite:       { rotulo: "Pernoite",        cor: "#0369a1" },
  cidade:         { rotulo: "Cidade",          cor: "#0891b2" },
};

export const ROTAS: Record<string, Rota> = {
  rio:   rio   as unknown as Rota,
  bh:    bh    as unknown as Rota,
  bhtri: bhtri as unknown as Rota,
};

// Brasília → BH tem dois caminhos. Turismo histórico/culinário seguem pelo
// Triângulo Mineiro (bhtri); viagem rápida e com crianças vão pela BR-040 direta.
export function resolveRotaId(destinoRotaId: string, perfil: PerfilViagem): string {
  if (destinoRotaId === "bh" && (perfil === "historico" || perfil === "culinaria")) {
    return "bhtri";
  }
  return destinoRotaId;
}

export const PARADAS_POR_ROTA: Record<string, Parada[]> = {
  rio: [
    { progress: 0.19, nome: "Cristalina",  uf: "GO" },
    { progress: 0.44, nome: "Congonhas",   uf: "MG" },
    { progress: 0.53, nome: "C. Lafaiete", uf: "MG" },
    { progress: 0.69, nome: "Juiz de Fora",uf: "MG" },
    { progress: 0.80, nome: "Três Rios",   uf: "RJ" },
    { progress: 0.87, nome: "Petrópolis",  uf: "RJ" },
  ],
  bh: [
    { progress: 0.25, nome: "Cristalina",  uf: "GO" },
    { progress: 0.62, nome: "Paraopeba",   uf: "MG" },
    { progress: 0.77, nome: "Sete Lagoas", uf: "MG" },
  ],
  bhtri: [
    { progress: 0.18, nome: "Goiânia",     uf: "GO" },
    { progress: 0.34, nome: "Itumbiara",   uf: "GO" },
    { progress: 0.45, nome: "Uberlândia",  uf: "MG" },
    { progress: 0.55, nome: "Uberaba",     uf: "MG" },
    { progress: 0.68, nome: "Araxá",       uf: "MG" },
    { progress: 0.82, nome: "Bom Despacho",uf: "MG" },
  ],
};

export const RESUMOS: Record<string, { titulo: string; texto: string; destaque: string }> = {
  rio: {
    titulo: "Chegamos ao Rio de Janeiro",
    texto: "1.162 km gerenciados por concessionárias do Planalto Central à Baía de Guanabara.",
    destaque: "Uma estrada melhor para todos",
  },
  bh: {
    titulo: "Chegamos a Belo Horizonte",
    texto: "746 km pela Rota dos Cristais (BR-040): Via Cristais e EPR Via Mineira aproximando a capital federal do coração industrial do Brasil.",
    destaque: "Uma estrada melhor para todos",
  },
  bhtri: {
    titulo: "Chegamos a Belo Horizonte",
    texto: "1.160 km de turismo pelo Triângulo Mineiro (BR-060/153/262), sob a Triunfo Concebra — Goiânia, Uberaba e Araxá no caminho.",
    destaque: "Uma estrada melhor para todos",
  },
};

// Descrição curta de origens (não estão em PARADAS_POR_ROTA).
const ORIGEM_DESC: Record<string, string> = {
  "Brasília": "Partida no Planalto Central. Capital federal projetada por Niemeyer, ponto zero das rodovias para o Sudeste.",
};

// Monta a estrutura de timeline a partir de uma rota de simulação.
export function montarRotaDetalhe(rotaId: string): RotaDetalhe | null {
  const rota = ROTAS[rotaId];
  if (!rota) return null;
  const cidades = rota.cidades ?? [];
  const descricaoDe = (nome: string) => {
    const c = cidades.find((e) =>
      e.titulo.toLowerCase().startsWith(nome.toLowerCase()),
    );
    return c?.texto ?? "Parada com estrutura de apoio ao longo da rodovia concedida.";
  };
  const paradas = (PARADAS_POR_ROTA[rotaId] ?? []).map((p) => ({
    nome: p.nome,
    uf: p.uf,
    descricao: descricaoDe(p.nome),
  }));
  return {
    titulo: `${rota.origem} → ${rota.destino}`,
    distancia_km: rota.distancia_km,
    paradas_count: paradas.length,
    origem: {
      nome: rota.origem,
      uf: rota.origem_uf ?? "",
      descricao: ORIGEM_DESC[rota.origem] ?? "Ponto de partida da viagem.",
    },
    destino: {
      nome: rota.destino,
      uf: rota.uf,
      descricao: RESUMOS[rotaId]?.texto ?? "Destino final do trajeto.",
    },
    paradas,
    trechos: rota.trechos ?? [],
  };
}

// Link do Google Maps entre dois pontos "Cidade, UF".
export function googleMapsLeg(de: PontoRota, ate: PontoRota): string {
  const fmt = (p: PontoRota) =>
    encodeURIComponent(p.uf ? `${p.nome}, ${p.uf}` : p.nome);
  return `https://www.google.com/maps/dir/?api=1&origin=${fmt(de)}&destination=${fmt(ate)}&travelmode=driving`;
}

// Link do Google Maps da viagem inteira (com paradas como waypoints).
export function googleMapsRotaCompleta(d: RotaDetalhe): string {
  const fmt = (p: PontoRota) =>
    encodeURIComponent(p.uf ? `${p.nome}, ${p.uf}` : p.nome);
  const wp = d.paradas.map(fmt).join("|");
  const base = `https://www.google.com/maps/dir/?api=1&origin=${fmt(d.origem)}&destination=${fmt(d.destino)}&travelmode=driving`;
  return wp ? `${base}&waypoints=${wp}` : base;
}

// ---- Chat de entrada (Tela 1) ----
export interface CidadeOpcao {
  id: string;
  nome: string;
  uf: string;
}

export const ORIGENS: CidadeOpcao[] = [
  { id: "bsb", nome: "Brasília", uf: "DF" },
];

export const DESTINOS_POR_ORIGEM: Record<string, (CidadeOpcao & { rotaId: string })[]> = {
  bsb: [
    { id: "rio", nome: "Rio de Janeiro", uf: "RJ", rotaId: "rio" },
    { id: "bh",  nome: "Belo Horizonte", uf: "MG", rotaId: "bh"  },
  ],
};

export const TIPOS_VIAGEM = [
  { id: "criancas",  rotulo: "Com crianças",     abrev: "KID", desc: "Paradas family-friendly" },
  { id: "rapida",    rotulo: "Viagem rápida",    abrev: "RAP", desc: "Direto, sem paradas" },
  { id: "historico", rotulo: "Turismo histórico", abrev: "HIS", desc: "Patrimônio e cultura" },
  { id: "culinaria", rotulo: "Turismo culinário", abrev: "CUL", desc: "Gastronomia regional" },
] as const;

export type PerfilViagem = typeof TIPOS_VIAGEM[number]["id"];

export const DESTINOS: { id: string; nome: string; uf: string }[] = [
  { id: "rio", nome: "Rio de Janeiro", uf: "RJ" },
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
  estados: ["SP", "RJ", "MG", "DF", "GO", "PR", "ES", "SC"],
  cidades: [
    // Eixo das rotas percorridas
    { nome: "Brasília",       uf: "DF", lat: -15.7942, lng: -47.8825 },
    { nome: "Cristalina",     uf: "GO", lat: -16.7675, lng: -47.6147 },
    { nome: "Belo Horizonte", uf: "MG", lat: -19.9167, lng: -43.9345 },
    { nome: "Juiz de Fora",   uf: "MG", lat: -21.7611, lng: -43.3500 },
    { nome: "Petrópolis",     uf: "RJ", lat: -22.5050, lng: -43.1791 },
    { nome: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729 },
    // Triângulo Mineiro
    { nome: "Goiânia",        uf: "GO", lat: -16.6869, lng: -49.2648 },
    { nome: "Uberaba",        uf: "MG", lat: -19.7472, lng: -47.9381 },
    { nome: "Araxá",          uf: "MG", lat: -19.5933, lng: -46.9403 },
    // Lugares legais visitados (bate-volta a partir das rotas)
    { nome: "Ouro Preto",     uf: "MG", lat: -20.3856, lng: -43.5035 },
    { nome: "Tiradentes",     uf: "MG", lat: -21.1100, lng: -44.1772 },
    { nome: "São Paulo",      uf: "SP", lat: -23.5505, lng: -46.6333 },
    { nome: "Paraty",         uf: "RJ", lat: -23.2178, lng: -44.7131 },
    { nome: "Vitória",        uf: "ES", lat: -20.3155, lng: -40.3128 },
    { nome: "Curitiba",       uf: "PR", lat: -25.4297, lng: -49.2715 },
    { nome: "Florianópolis",  uf: "SC", lat: -27.5949, lng: -48.5482 },
  ] as CidadeExplorada[],
  pct_brasil: 14,
};
