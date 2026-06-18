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

// ---- Concessionárias (Seção "Responsáveis") ----
export interface Concessionaria {
  nome: string;
  grupo: string;
  rodovia: string;
  trecho: string;
  cor: string;
  investimento: string;
  stats: { valor: string; label: string }[];
  oQueFaz: string[];
  historia: { titulo: string; pessoa: string; texto: string };
}

// Dados reais de investimento/obras; as histórias pessoais são ILUSTRATIVAS.
export const CONCESSIONARIAS: Record<string, Concessionaria> = {
  "Via Cristais": {
    nome: "Via Cristais",
    grupo: "Vinci Highways",
    rodovia: "BR-040",
    trecho: "Cristalina (GO) → Belo Horizonte (MG) · 594 km",
    cor: "#0c667f",
    investimento: "R$ 12 bilhões em 30 anos",
    stats: [
      { valor: "R$ 12 bi", label: "investimento" },
      { valor: "168 km", label: "faixas adicionais" },
      { valor: "228", label: "câmeras 24h" },
      { valor: "91 mil", label: "empregos gerados" },
    ],
    oQueFaz: [
      "SAU 24h com guincho e ambulância gratuitos",
      "168 km de faixas adicionais e 10 km de duplicação",
      "Detecção automática de incidentes em 228 câmeras",
      "4 faixas por sentido entre BH e a Ceasa até 2027",
    ],
    historia: {
      titulo: "Da pista nova à sala de aula",
      pessoa: "Joana, 19 anos · Cristalina (GO)",
      texto: "A viagem noturna até a faculdade em BH assustava a família. Com a pista duplicada, o monitoramento 24h e o socorro garantido, Joana faz o trajeto sem medo — e foi a primeira da casa a entrar na universidade.",
    },
  },
  "EPR Via Mineira": {
    nome: "EPR Via Mineira",
    grupo: "Grupo EPR",
    rodovia: "BR-040",
    trecho: "Belo Horizonte → Juiz de Fora (MG) · 232 km, 15 municípios",
    cor: "#2f9e72",
    investimento: "R$ 8,7 bilhões em 30 anos",
    stats: [
      { valor: "R$ 8,7 bi", label: "investimento" },
      { valor: "500 km", label: "faixas refeitas" },
      { valor: "66", label: "pontes restauradas" },
      { valor: "114 mil t", label: "asfalto aplicado" },
    ],
    oQueFaz: [
      "Recuperou 500 km de faixas só no 1º ano",
      "Restaurou 66 pontes e viadutos",
      "Centro de Controle Operacional 24h",
      "Duplicação completa do trecho até 2031",
    ],
    historia: {
      titulo: "O caminhão que não para mais na ponte",
      pessoa: "Seu Antônio · caminhoneiro",
      texto: "As pontes antigas obrigavam desvios e atrasos. Depois da restauração de 66 estruturas, a carga de Antônio chega no prazo — e ele dorme em casa mais cedo.",
    },
  },
  "Elovias": {
    nome: "Elovias",
    grupo: "Triunfo + Construcap",
    rodovia: "BR-040/495",
    trecho: "Juiz de Fora (MG) → Rio de Janeiro (RJ)",
    cor: "#0369a1",
    investimento: "R$ 8,8 bilhões em 30 anos",
    stats: [
      { valor: "R$ 8,8 bi", label: "investimento" },
      { valor: "4 → 6", label: "faixas na serra" },
      { valor: "−5 km", label: "com o novo túnel" },
      { valor: "R$ 5 bi", label: "em capacidade" },
    ],
    oQueFaz: [
      "Duplica a Serra de Petrópolis (4 → 6 faixas)",
      "Retoma o túnel que encurta 5 km do trajeto",
      "Faixa de escape e socorro 24h na serra",
      "R$ 5 bi destinados a ampliar a capacidade",
    ],
    historia: {
      titulo: "A serra que deixou de assustar",
      pessoa: "Família Ribeiro · Petrópolis (RJ)",
      texto: "A descida da serra era o trecho mais temido do passeio de fim de semana. Com mais faixas e faixa de escape, a viagem virou rotina tranquila com as crianças.",
    },
  },
  "Triunfo Concebra": {
    nome: "Triunfo Concebra",
    grupo: "Triunfo",
    rodovia: "BR-060/153/262",
    trecho: "DF / GO / MG · ~1.176 km",
    cor: "#7c3aed",
    investimento: "R$ 7,15 bilhões em 30 anos",
    stats: [
      { valor: "R$ 7,15 bi", label: "investimento" },
      { valor: "1.176 km", label: "sob concessão" },
      { valor: "24h", label: "socorro médico" },
      { valor: "3", label: "rodovias integradas" },
    ],
    oQueFaz: [
      "Socorro médico e mecânico em toda a malha",
      "Conserva e recupera 1.176 km de pista",
      "Integra o Centro-Oeste ao Sudeste",
      "Pesagem e fiscalização para mais segurança",
    ],
    historia: {
      titulo: "O atendimento que chegou a tempo",
      pessoa: "Marcos · Uberlândia (MG)",
      texto: "Depois de um pneu estourado à noite, a ambulância da concessionária chegou em minutos. 'Saber que tem socorro 24h muda tudo na estrada', conta Marcos.",
    },
  },
};

// Concessionárias presentes nas rotas informadas (sem duplicar, mantendo a ordem).
export function concessionariasDasRotas(rotaIds: string[]): Concessionaria[] {
  const vistos = new Set<string>();
  const out: Concessionaria[] = [];
  for (const id of rotaIds) {
    for (const t of ROTAS[id]?.trechos ?? []) {
      const c = CONCESSIONARIAS[t.concessionaria];
      if (c && !vistos.has(c.nome)) {
        vistos.add(c.nome);
        out.push(c);
      }
    }
  }
  return out;
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
  // Pegada nacional: rotas do eixo central + viagens espalhadas pelo Brasil
  estados: ["DF", "GO", "MG", "RJ", "SP", "MT", "AL", "BA", "PE", "CE", "AM", "RS"],
  cidades: [
    // Eixo central percorrido
    { nome: "Brasília",       uf: "DF", lat: -15.7942, lng: -47.8825 },
    { nome: "Belo Horizonte", uf: "MG", lat: -19.9167, lng: -43.9345 },
    { nome: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729 },
    { nome: "Uberaba",        uf: "MG", lat: -19.7472, lng: -47.9381 },
    // Espalhadas pelo Brasil
    { nome: "Cuiabá",         uf: "MT", lat: -15.6010, lng: -56.0974 },
    { nome: "Maceió",         uf: "AL", lat: -9.6498,  lng: -35.7089 },
    { nome: "Salvador",       uf: "BA", lat: -12.9777, lng: -38.5016 },
    { nome: "Recife",         uf: "PE", lat: -8.0476,  lng: -34.8770 },
    { nome: "Fortaleza",      uf: "CE", lat: -3.7319,  lng: -38.5267 },
    { nome: "Manaus",         uf: "AM", lat: -3.1190,  lng: -60.0217 },
    { nome: "Porto Alegre",   uf: "RS", lat: -30.0346, lng: -51.2177 },
    { nome: "São Paulo",      uf: "SP", lat: -23.5505, lng: -46.6333 },
    { nome: "Chapada dos Guimarães", uf: "MT", lat: -15.4606, lng: -55.7497 },
  ] as CidadeExplorada[],
  pct_brasil: 31,
};
