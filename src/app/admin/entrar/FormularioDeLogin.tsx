"use client";

import { useActionState } from "react";

import { entrar, type Estado } from "../acoes";
import { Aviso } from "@/components/admin/campos";

export default function FormularioDeLogin({ destino }: { destino: string }) {
  const [estado, acao, enviando] = useActionState<Estado, FormData>(entrar, undefined);

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="destino" value={destino} />

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Usuário</span>
        <input
          name="usuario"
          autoComplete="username"
          required
          autoFocus
          className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Senha</span>
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </label>

      <Aviso estado={estado} />

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
