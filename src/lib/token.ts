import { jwtVerify, SignJWT } from "jose";

/**
 * Assinatura e conferência do token de sessão.
 *
 * Separado de `sessao.ts` de propósito: o `proxy.ts` roda no Edge runtime, onde
 * boa parte das APIs do Node não existe. Este arquivo depende só do `jose`, que
 * funciona nos dois runtimes, então serve tanto ao proxy quanto ao servidor.
 */

/** Uma semana. Curto o bastante para um cookie roubado expirar sozinho. */
export const DURACAO_EM_SEGUNDOS = 7 * 24 * 60 * 60;

export const NOME_DO_COOKIE = "sessao_admin";

export type ConteudoDaSessao = { sub: string };

function segredo(): Uint8Array {
  const valor = process.env.SESSION_SECRET;

  // Sem segredo, qualquer um forjaria um cookie de admin. Falhar aqui é o
  // comportamento correto — o site subir "quase seguro" seria pior.
  if (!valor || valor.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres). Gere com: openssl rand -base64 32",
    );
  }

  return new TextEncoder().encode(valor);
}

export async function assinarToken(usuario: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario)
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_EM_SEGUNDOS}s`)
    .sign(segredo());
}

export async function conferirToken(
  token: string | undefined,
): Promise<ConteudoDaSessao | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, segredo(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? { sub: payload.sub } : null;
  } catch {
    // Assinatura inválida, expirado ou adulterado — tudo é "não autenticado".
    return null;
  }
}
