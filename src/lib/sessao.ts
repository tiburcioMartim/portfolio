import "server-only";

import { cookies } from "next/headers";

import {
  assinarToken,
  conferirToken,
  DURACAO_EM_SEGUNDOS,
  NOME_DO_COOKIE,
  type ConteudoDaSessao,
} from "./token";

/**
 * Sessão do admin, do lado do servidor.
 *
 * É um usuário só — você. Então não existe banco de usuários: a senha vive como
 * hash numa variável de ambiente e a sessão é um cookie assinado. Menos peças
 * significa menos superfície para dar errado numa VPS que hospeda produção de
 * cliente.
 */

export async function criarSessao(usuario: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(NOME_DO_COOKIE, await assinarToken(usuario), {
    httpOnly: true,
    // Em desenvolvimento o site roda em http, onde um cookie `secure` nunca
    // seria enviado de volta e o login pareceria falhar sem motivo.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_EM_SEGUNDOS,
  });
}

export async function encerrarSessao(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_DO_COOKIE);
}

/** Lê a sessão do cookie. Retorna `null` quando não há sessão válida. */
export async function sessaoAtual(): Promise<ConteudoDaSessao | null> {
  const cookieStore = await cookies();
  return conferirToken(cookieStore.get(NOME_DO_COOKIE)?.value);
}
