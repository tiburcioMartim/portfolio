import { timingSafeEqual } from "node:crypto";

import { salvarBytes, apagarArquivo } from "@/lib/arquivos";
import { gravarProjetos, lerProjetos } from "@/lib/conteudo";

/**
 * Recebe as capas capturadas automaticamente.
 *
 * A captura precisa de um navegador de verdade, e um navegador na VPS
 * significa algumas centenas de MB de RAM disputando com a loja da Celly toda
 * vez que rodasse. Então ela acontece fora — na sua máquina pelo
 * `npm run capturar`, ou no runner do GitHub uma vez por semana — e o
 * resultado chega aqui.
 *
 * A autorização é um token próprio, e não a sessão do admin, porque quem chama
 * é um script sem navegador. O estrago máximo de um token vazado é trocar a
 * imagem de capa de um projeto: nada de conteúdo, nada de sessão.
 */

function tokenConfere(recebido: string | null): boolean {
  const esperado = process.env.CAPTURA_TOKEN;
  if (!esperado || esperado.length < 24) return false;
  if (!recebido) return false;

  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

function autorizado(pedido: Request): boolean {
  const cabecalho = pedido.headers.get("authorization");
  return tokenConfere(cabecalho?.replace(/^Bearer\s+/i, "") ?? null);
}

/** Diz ao script o que precisa ser fotografado. */
export async function GET(pedido: Request) {
  if (!autorizado(pedido)) return new Response("Não autorizado", { status: 401 });

  const projetos = await lerProjetos();

  const alvos = projetos
    .filter((p) => p.capa.modo === "automatica" && p.capa.urlOrigem)
    .map((p) => ({ slug: p.slug, url: p.capa.urlOrigem }));

  return Response.json({ alvos });
}

export async function POST(pedido: Request) {
  if (!autorizado(pedido)) return new Response("Não autorizado", { status: 401 });

  const formulario = await pedido.formData();
  const slug = String(formulario.get("slug") ?? "");
  const imagem = formulario.get("imagem");

  if (!(imagem instanceof File)) {
    return Response.json({ erro: "Faltou a imagem." }, { status: 400 });
  }

  const projetos = await lerProjetos();
  const projeto = projetos.find((p) => p.slug === slug);

  if (!projeto) {
    return Response.json({ erro: `Projeto "${slug}" não existe.` }, { status: 404 });
  }

  // Só aceita capa automática em projeto configurado para isso. Sem esta
  // checagem, o token viraria uma forma de trocar a capa que você escolheu à
  // mão para o ERP ou para a loja da cliente.
  if (projeto.capa.modo !== "automatica") {
    return Response.json(
      { erro: `"${slug}" não está em modo automático.` },
      { status: 409 },
    );
  }

  const bytes = Buffer.from(await imagem.arrayBuffer());

  let arquivo: string;
  try {
    arquivo = await salvarBytes(bytes, `capa-${slug}`);
  } catch {
    return Response.json({ erro: "Não consegui processar a imagem." }, { status: 400 });
  }

  const anterior = projeto.capa.arquivo;

  await gravarProjetos(
    projetos.map((p) =>
      p.slug === slug
        ? { ...p, capa: { ...p.capa, arquivo, capturadaEm: new Date().toISOString() } }
        : p,
    ),
  );

  if (anterior) await apagarArquivo(anterior);

  return Response.json({ ok: true, arquivo });
}
