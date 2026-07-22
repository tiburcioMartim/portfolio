import "server-only";

import { redirect } from "next/navigation";

import { sessaoAtual } from "./sessao";

/**
 * Portão único de autorização.
 *
 * Toda página, Server Action e rota do admin chama isto antes de ler ou gravar
 * qualquer coisa. O `proxy.ts` também barra o acesso, mas ele é só a primeira
 * peneira: a checagem que vale é esta, colada no dado.
 */
export async function exigirSessao(): Promise<{ sub: string }> {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/entrar");
  return sessao;
}

/**
 * Versão para rotas de API, onde redirecionar não faz sentido — o cliente
 * espera um status, não uma página de login.
 */
export async function sessaoOuNulo(): Promise<{ sub: string } | null> {
  return sessaoAtual();
}
