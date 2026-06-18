"use client";

import {
  COR_PRIMARIA,
  googleMapsLeg,
  googleMapsRotaCompleta,
  type PontoRota,
  type RotaDetalhe,
} from "../data";

interface Props {
  detalhe: RotaDetalhe;
  onFechar: () => void;
  onCompartilhar?: () => void;
}

function BotaoTrajeto({ de, ate }: { de: PontoRota; ate: PontoRota }) {
  return (
    <a
      href={googleMapsLeg(de, ate)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#dbe7ec] bg-white px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-[#f3f8fa]"
      style={{ color: COR_PRIMARIA }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={COR_PRIMARIA} />
        <circle cx="12" cy="9" r="2.5" fill="white" />
      </svg>
      Iniciar trajeto
    </a>
  );
}

export default function RotaTimelineModal({ detalhe, onFechar, onCompartilhar }: Props) {
  // Sequência completa de pontos: origem → paradas → destino
  const pontos: PontoRota[] = [detalhe.origem, ...detalhe.paradas, detalhe.destino];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#eef2f4] px-4 py-4">
        <button
          onClick={onFechar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2ecf0] bg-white text-[#5b727c] shadow-[0_2px_8px_rgba(20,50,61,0.06)]"
          aria-label="Fechar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9bacb3]">Linha do tempo da viagem</p>
          <h2 className="truncate text-[15px] font-bold text-[#14323d]">{detalhe.titulo}</h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-bold" style={{ color: COR_PRIMARIA }}>
            {detalhe.distancia_km.toLocaleString("pt-BR")} km
          </p>
          <p className="text-[10px] text-[#9bacb3]">{detalhe.paradas_count} paradas</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-md">
          {pontos.map((p, i) => {
            const ultimo = i === pontos.length - 1;
            const origem = i === 0;
            return (
              <div key={`${p.nome}-${i}`} className="relative flex gap-3 pb-2">
                {/* Coluna do trilho */}
                <div className="relative flex w-5 shrink-0 flex-col items-center">
                  <span
                    className="z-10 mt-1 block rounded-full border-2 border-white"
                    style={{
                      width: origem || ultimo ? 16 : 12,
                      height: origem || ultimo ? 16 : 12,
                      background: ultimo ? "#14323d" : COR_PRIMARIA,
                      boxShadow: "0 2px 6px rgba(20,50,61,0.25)",
                    }}
                  />
                  {!ultimo && (
                    <span className="absolute top-3 bottom-0 w-[3px] rounded-full" style={{ background: "#dbe7ec" }} />
                  )}
                </div>

                {/* Conteúdo do ponto */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-[#14323d]">{p.nome}</h3>
                    {p.uf && (
                      <span className="rounded-md bg-[#eef4f6] px-1.5 py-0.5 text-[9px] font-bold text-[#5b727c]">{p.uf}</span>
                    )}
                    {origem && (
                      <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: COR_PRIMARIA }}>PARTIDA</span>
                    )}
                    {ultimo && (
                      <span className="rounded-md bg-[#14323d] px-1.5 py-0.5 text-[9px] font-bold text-white">CHEGADA</span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#5b727c]">{p.descricao}</p>

                  {/* Trechos concedidos: mostrados logo após a partida */}
                  {origem && detalhe.trechos.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {detalhe.trechos.map((t, j) => (
                        <div
                          key={j}
                          className="rounded-xl border border-[#e8f0f3] bg-[#f7fbfc] px-3 py-2"
                        >
                          <p className="text-[11px] font-bold" style={{ color: COR_PRIMARIA }}>
                            {t.rodovia} · {t.concessionaria}
                          </p>
                          <p className="text-[10.5px] leading-snug text-[#8fa3ab]">{t.nota}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botão de iniciar o trajeto até o próximo ponto */}
                  {!ultimo && (
                    <div className="mt-2.5">
                      <BotaoTrajeto de={p} ate={pontos[i + 1]} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé: viagem completa + compartilhar */}
      <div className="mx-auto w-full max-w-md shrink-0 border-t border-[#eef2f4] px-4 py-4">
        <a
          href={googleMapsRotaCompleta(detalhe)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: COR_PRIMARIA }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" />
            <circle cx="12" cy="9" r="2.5" fill={COR_PRIMARIA} />
          </svg>
          Iniciar viagem completa no Google Maps
        </a>
        {onCompartilhar && (
          <button
            onClick={onCompartilhar}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#dbe7ec] py-2.5 text-[13px] font-semibold text-[#5b727c] hover:bg-[#f3f8fa]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Compartilhar rota
          </button>
        )}
      </div>
    </div>
  );
}
