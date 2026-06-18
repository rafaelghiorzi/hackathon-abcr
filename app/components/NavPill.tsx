"use client";

import { COR_PRIMARIA } from "../data";

export type TabId = "exploracao" | "roteiro" | "usuarios" | "responsaveis";

interface Props {
  ativa: TabId | null;
  onTab: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "exploracao",
    label: "Meu Mapa",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 3C12 3 8.5 7 8.5 12s3.5 9 3.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 3c0 0 3.5 4 3.5 9s-3.5 9-3.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3.5 12h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "roteiro",
    label: "Minha Rota",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="6" r="2.5" fill="currentColor"/>
        <circle cx="16" cy="12" r="2.5" fill="currentColor"/>
        <circle cx="8" cy="18" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "usuarios",
    label: "Rotas dos Usuários",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="18" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 20c0-2.21-1.343-4.105-3.25-4.785" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "responsaveis",
    label: "Responsáveis",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function NavPill({ ativa, onTab }: Props) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 popup-entra">
      <div className="flex gap-1 rounded-2xl border border-[#e2ecf0] bg-white p-1.5 shadow-[0_8px_32px_rgba(20,50,61,0.22)]">
        {TABS.map((tab) => {
          const isAtiva = ativa === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTab(tab.id)}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all duration-200"
              style={
                isAtiva
                  ? { background: COR_PRIMARIA, color: "#fff" }
                  : { color: "#5b727c" }
              }
            >
              {tab.icon}
              <span
                className="text-center font-bold leading-tight"
                style={{ fontSize: 9 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
