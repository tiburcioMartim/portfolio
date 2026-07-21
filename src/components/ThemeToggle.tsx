"use client";

import { useSyncExternalStore } from "react";

type Tema = "claro" | "escuro";

/**
 * O tema real mora no DOM: a classe do <html> é escrita antes da primeira
 * pintura pelo script inline do layout. Aqui apenas lemos essa fonte única,
 * em vez de manter um estado paralelo que pode divergir dela.
 */
const ouvintes = new Set<() => void>();

function assinar(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

function lerTema(): Tema {
  const classes = document.documentElement.classList;
  if (classes.contains("light")) return "claro";
  if (classes.contains("dark")) return "escuro";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro";
}

// No servidor não existe tema definido — devolvemos null para não renderizar
// o ícone errado antes da hidratação.
function lerTemaNoServidor(): Tema | null {
  return null;
}

export default function ThemeToggle() {
  const tema = useSyncExternalStore(assinar, lerTema, lerTemaNoServidor);

  function alternar() {
    const proximo: Tema = tema === "claro" ? "escuro" : "claro";
    const classes = document.documentElement.classList;
    classes.toggle("light", proximo === "claro");
    classes.toggle("dark", proximo === "escuro");
    try {
      localStorage.setItem("tema", proximo);
    } catch {
      // Navegação privada pode bloquear o armazenamento; o tema ainda vale
      // para esta sessão.
    }
    ouvintes.forEach((aoMudar) => aoMudar());
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === "claro" ? "Ativar tema escuro" : "Ativar tema claro"}
      className="grid size-9 place-items-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {tema === null ? null : tema === "claro" ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
