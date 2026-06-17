"use client";

import { DESTINOS, COR_PRIMARIA } from "../data";

export default function HomeScreen({
  onEscolher,
}: {
  onEscolher: (id: string) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-3xl text-center">
        <p
          className="anim-subir mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary"
          style={{ animationDelay: "0.05s" }}
        >
          Meu Caminho
        </p>

        <h1
          className="anim-subir text-4xl font-bold leading-tight tracking-tight text-[#14323d] sm:text-6xl"
          style={{ animationDelay: "0.15s" }}
        >
          Para onde você
          <br />
          quer ir?
        </h1>

        <p
          className="anim-subir mx-auto mt-5 max-w-xl text-base text-[#5b727c] sm:text-lg"
          style={{ animationDelay: "0.28s" }}
        >
          Partindo de{" "}
          <span className="font-semibold text-[#14323d]">Brasília</span>, veja o
          que as concessionárias constroem em cada quilômetro do seu caminho.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {DESTINOS.map((d, i) => (
            <button
              key={d.id}
              onClick={() => onEscolher(d.id)}
              className="anim-subir group flex flex-col items-center gap-3 rounded-3xl border border-[#e6edf0] bg-white p-7 text-center shadow-[0_8px_30px_rgba(20,50,61,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-[0_18px_44px_rgba(37,150,190,0.22)]"
              style={{ animationDelay: `${0.4 + i * 0.12}s` }}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {d.emoji}
              </span>
              <span className="text-xl font-semibold text-[#14323d]">
                {d.nome}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                style={{ color: COR_PRIMARIA }}
              >
                Traçar rota
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <p
          className="anim-subir mt-12 text-xs text-[#9bacb3]"
          style={{ animationDelay: "0.85s" }}
        >
          Dados ilustrativos · Campanha das concessionárias de rodovias
        </p>
      </div>
    </div>
  );
}
