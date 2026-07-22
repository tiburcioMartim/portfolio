"use client";

import type { ReactNode } from "react";

/**
 * Lista de registros com adicionar, remover e reordenar.
 *
 * Existe porque método, experiência, formação, grupos de stack e números de
 * projeto são todos a mesma interação. Uma peça só evita cinco variações
 * ligeiramente diferentes da mesma coisa.
 */
export default function Repetidor<T>({
  itens,
  aoMudar,
  novo,
  renderizar,
  rotuloDoItem,
  textoDeAdicionar,
  vazio,
}: {
  itens: T[];
  aoMudar: (itens: T[]) => void;
  /** Como é um registro recém-criado. */
  novo: () => T;
  renderizar: (item: T, atualizar: (item: T) => void, indice: number) => ReactNode;
  rotuloDoItem?: (item: T, indice: number) => string;
  textoDeAdicionar: string;
  vazio?: string;
}) {
  function trocar(de: number, para: number) {
    if (para < 0 || para >= itens.length) return;
    const copia = [...itens];
    [copia[de], copia[para]] = [copia[para], copia[de]];
    aoMudar(copia);
  }

  return (
    <div className="space-y-3">
      {itens.length === 0 && vazio ? <p className="text-sm text-faint">{vazio}</p> : null}

      {itens.map((item, indice) => (
        <div key={indice} className="rounded-lg border border-line bg-bg p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-faint">
              {rotuloDoItem?.(item, indice) ?? `#${indice + 1}`}
            </span>

            <div className="flex items-center gap-1">
              <BotaoIcone
                titulo="Mover para cima"
                desabilitado={indice === 0}
                aoClicar={() => trocar(indice, indice - 1)}
              >
                ↑
              </BotaoIcone>
              <BotaoIcone
                titulo="Mover para baixo"
                desabilitado={indice === itens.length - 1}
                aoClicar={() => trocar(indice, indice + 1)}
              >
                ↓
              </BotaoIcone>
              <BotaoIcone
                titulo="Remover"
                perigo
                aoClicar={() => aoMudar(itens.filter((_, i) => i !== indice))}
              >
                ✕
              </BotaoIcone>
            </div>
          </div>

          <div className="space-y-4">
            {renderizar(
              item,
              (atualizado) => aoMudar(itens.map((v, i) => (i === indice ? atualizado : v))),
              indice,
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => aoMudar([...itens, novo()])}
        className="w-full rounded-lg border border-dashed border-line-strong py-2.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent-ink"
      >
        + {textoDeAdicionar}
      </button>
    </div>
  );
}

function BotaoIcone({
  children,
  titulo,
  aoClicar,
  desabilitado,
  perigo,
}: {
  children: ReactNode;
  titulo: string;
  aoClicar: () => void;
  desabilitado?: boolean;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      onClick={aoClicar}
      disabled={desabilitado}
      className={`size-7 rounded-md border border-line text-xs transition-colors disabled:opacity-30 ${
        perigo
          ? "text-faint hover:border-red-500 hover:text-red-500"
          : "text-muted hover:border-accent hover:text-accent-ink"
      }`}
    >
      {children}
    </button>
  );
}
