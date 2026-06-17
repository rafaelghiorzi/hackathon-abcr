// ============================================================================
// Dados da campanha "Meu Caminho"
// ATENÇÃO: todas as estatísticas são PLACEHOLDERS ILUSTRATIVOS.
// A equipe validará os números reais depois. Edite livremente este arquivo.
// ============================================================================

import rio from "@/routes/rio.json";
import sp from "@/routes/sp.json";
import bh from "@/routes/bh.json";

export type EventoTipo =
  | "concessionaria"
  | "pedagio"
  | "logistica"
  | "seguranca";

export interface Evento {
  /** posição ao longo da rota, de 0 (origem) a 1 (destino) */
  progress: number;
  tipo: EventoTipo;
  titulo: string;
  texto: string;
  destaque: string;
}

export interface RotaGeo {
  id: string;
  destino: string;
  uf: string;
  origem: string;
  distancia_km: number;
  duracao_h: number;
  coords: [number, number][];
}

export interface Rota extends RotaGeo {
  cor: string;
  eventos: Evento[];
  resumo: { titulo: string; texto: string; destaque: string };
}

// Cor primária da campanha (azul-petróleo)
export const COR_PRIMARIA = "#2596be";

// Rótulos e ícones por tipo de evento
export const TIPO_INFO: Record<EventoTipo, { rotulo: string; icone: string }> = {
  concessionaria: { rotulo: "Concessionária", icone: "🛣️" },
  pedagio: { rotulo: "Pedágio", icone: "🎫" },
  logistica: { rotulo: "Logística", icone: "🚚" },
  seguranca: { rotulo: "Segurança", icone: "🛟" },
};

const eventosRio: Evento[] = [
  {
    progress: 0.1,
    tipo: "concessionaria",
    titulo: "EPR Via 040",
    texto: "O trecho Brasília–Juiz de Fora da BR-040 é administrado pela concessionária, responsável por conservação, sinalização e atendimento 24h.",
    destaque: "937 km sob concessão",
  },
  {
    progress: 0.32,
    tipo: "seguranca",
    titulo: "Mais segurança na pista",
    texto: "Novas faixas adicionais, barreiras e iluminação reduziram acidentes neste corredor nos últimos anos.",
    destaque: "R$ 1,2 bi investidos em segurança",
  },
  {
    progress: 0.52,
    tipo: "logistica",
    titulo: "Corredor de cargas",
    texto: "Por aqui escoa boa parte da produção do Centro-Oeste rumo aos portos do Sudeste.",
    destaque: "2,8 mi de toneladas/mês",
  },
  {
    progress: 0.72,
    tipo: "concessionaria",
    titulo: "Concer",
    texto: "A descida da serra rumo ao Rio é operada com guincho, ambulância e monitoramento por câmeras ao longo de todo o trajeto.",
    destaque: "Atendimento médico em até 15 min",
  },
  {
    progress: 0.88,
    tipo: "pedagio",
    titulo: "Pedágio que vira estrada",
    texto: "Cada real arrecadado retorna em duplicação, recapeamento e novos dispositivos de acesso.",
    destaque: "R$ 600 mi reinvestidos/ano",
  },
];

const eventosSp: Evento[] = [
  {
    progress: 0.12,
    tipo: "concessionaria",
    titulo: "Ecovias do Cerrado",
    texto: "A BR-050, ligando Brasília a Uberlândia e ao interior paulista, recebeu obras de duplicação e novos contornos urbanos.",
    destaque: "436 km em modernização",
  },
  {
    progress: 0.34,
    tipo: "seguranca",
    titulo: "Tecnologia que salva",
    texto: "Painéis de mensagem variável e sensores de tráfego alertam motoristas sobre neblina, acidentes e filas em tempo real.",
    destaque: "120 câmeras inteligentes",
  },
  {
    progress: 0.54,
    tipo: "logistica",
    titulo: "Eixo do agronegócio",
    texto: "Este corredor conecta a produção agrícola do interior ao maior mercado consumidor do país.",
    destaque: "3,5 mi de toneladas/mês",
  },
  {
    progress: 0.74,
    tipo: "concessionaria",
    titulo: "CCR AutoBAn",
    texto: "As rodovias Anhanguera e Bandeirantes formam um dos sistemas mais movimentados do Brasil, com pavimento de alto padrão.",
    destaque: "Até 1 mi de veículos/dia",
  },
  {
    progress: 0.9,
    tipo: "pedagio",
    titulo: "Pedágio que vira estrada",
    texto: "A tarifa sustenta a manutenção contínua e o atendimento ao usuário em todo o sistema.",
    destaque: "R$ 800 mi reinvestidos/ano",
  },
];

const eventosBh: Evento[] = [
  {
    progress: 0.15,
    tipo: "concessionaria",
    titulo: "EPR Via 040",
    texto: "O caminho de Brasília a Belo Horizonte pela BR-040 cruza o cerrado mineiro com pista conservada e sinalização renovada.",
    destaque: "Conservação em 100% do trecho",
  },
  {
    progress: 0.4,
    tipo: "seguranca",
    titulo: "Resgate na estrada",
    texto: "Bases operacionais distribuídas ao longo da via garantem socorro mecânico e médico a qualquer hora.",
    destaque: "Bases a cada 70 km",
  },
  {
    progress: 0.62,
    tipo: "logistica",
    titulo: "Integração regional",
    texto: "Mineração, indústria e turismo dependem deste eixo para conectar o interior de Minas à capital federal.",
    destaque: "1,9 mi de toneladas/mês",
  },
  {
    progress: 0.82,
    tipo: "concessionaria",
    titulo: "Chegada a Minas",
    texto: "A aproximação de Belo Horizonte conta com contornos e marginais que aliviam o trânsito na região metropolitana.",
    destaque: "R$ 900 mi em obras de acesso",
  },
  {
    progress: 0.93,
    tipo: "pedagio",
    titulo: "Pedágio que vira estrada",
    texto: "O investimento privado permite obras que antes levariam décadas para sair do papel.",
    destaque: "R$ 500 mi reinvestidos/ano",
  },
];

export const ROTAS: Record<string, Rota> = {
  rio: {
    ...(rio as RotaGeo),
    cor: COR_PRIMARIA,
    eventos: eventosRio,
    resumo: {
      titulo: "Viagem concluída: Rio de Janeiro",
      texto: "De Brasília ao Rio, cada quilômetro contou com investimento privado em segurança, conservação e tecnologia.",
      destaque: "Uma estrada melhor para todos",
    },
  },
  sp: {
    ...(sp as RotaGeo),
    cor: COR_PRIMARIA,
    eventos: eventosSp,
    resumo: {
      titulo: "Viagem concluída: São Paulo",
      texto: "De Brasília a São Paulo, as concessionárias transformaram o principal corredor logístico do país.",
      destaque: "Uma estrada melhor para todos",
    },
  },
  bh: {
    ...(bh as RotaGeo),
    cor: COR_PRIMARIA,
    eventos: eventosBh,
    resumo: {
      titulo: "Viagem concluída: Belo Horizonte",
      texto: "De Brasília a Belo Horizonte, o cuidado com a via aproximou pessoas, negócios e regiões.",
      destaque: "Uma estrada melhor para todos",
    },
  },
};

export const DESTINOS: { id: string; nome: string; uf: string; emoji: string }[] = [
  { id: "rio", nome: "Rio de Janeiro", uf: "RJ", emoji: "🌊" },
  { id: "sp", nome: "São Paulo", uf: "SP", emoji: "🏙️" },
  { id: "bh", nome: "Belo Horizonte", uf: "MG", emoji: "⛰️" },
];

// Coordenada de origem fixa (Brasília)
export const BRASILIA: [number, number] = [-15.7942, -47.8825];
