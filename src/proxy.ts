import { NextResponse, type NextRequest } from "next/server";

import { conferirToken, NOME_DO_COOKIE } from "@/lib/token";

/**
 * Primeira peneira do admin.
 *
 * No Next 16 isto se chama Proxy — é o que antes era o Middleware. Ele só
 * redireciona: a autorização que realmente protege os dados é a de
 * `exigirSessao()`, chamada dentro de cada página e ação. Aqui evitamos que uma
 * tela de admin chegue a ser renderizada para quem não entrou.
 *
 * Roda apenas em `/admin`; o resto do site é público e não precisa pagar por
 * esta verificação.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const telaDeLogin = pathname === "/admin/entrar";

  const sessao = await conferirToken(request.cookies.get(NOME_DO_COOKIE)?.value);

  if (!sessao && !telaDeLogin) {
    const destino = new URL("/admin/entrar", request.nextUrl);
    // Guarda onde a pessoa queria chegar, para voltar lá depois do login.
    if (pathname !== "/admin") destino.searchParams.set("destino", pathname);
    return NextResponse.redirect(destino);
  }

  // Já logado não tem o que fazer na tela de login.
  if (sessao && telaDeLogin) {
    return NextResponse.redirect(new URL("/admin", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
