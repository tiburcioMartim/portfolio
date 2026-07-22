import Image from "next/image";
import Link from "next/link";

import { alternarPublicacao, moverProjeto } from "../acoes";
import { exigirSessao } from "@/lib/autorizacao";
import { lerProjetos } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

export default async function ListaDeProjetos() {
  await exigirSessao();

  const projetos = await lerProjetos();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Conteúdo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Projetos</h1>
          <p className="mt-2 text-muted">A ordem desta lista é a ordem que aparece no site.</p>
        </div>

        <Link
          href="/admin/projetos/novo"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Novo projeto
        </Link>
      </div>

      <div className="space-y-3">
        {projetos.map((projeto, indice) => (
          <article
            key={projeto.slug}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-elevated p-4"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-inset">
              {projeto.capa.arquivo ? (
                <Image
                  src={`/uploads/${projeto.capa.arquivo}`}
                  alt=""
                  fill
                  sizes="6rem"
                  className="object-cover object-top"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[0.65rem] text-faint">
                  sem capa
                </span>
              )}
            </div>

            <div className="min-w-48 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium text-ink">{projeto.nome}</h2>
                {!projeto.publicado ? (
                  <span className="rounded-full bg-inset px-2 py-0.5 font-mono text-[0.65rem] text-faint">
                    fora da vitrine
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-sm text-muted">{projeto.tagline}</p>
              <p className="mt-1 font-mono text-xs text-faint">
                {projeto.tipo} · {projeto.periodo}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <form action={moverProjeto}>
                <input type="hidden" name="slug" value={projeto.slug} />
                <input type="hidden" name="direcao" value="cima" />
                <BotaoDeLinha titulo="Mover para cima" desabilitado={indice === 0}>
                  ↑
                </BotaoDeLinha>
              </form>

              <form action={moverProjeto}>
                <input type="hidden" name="slug" value={projeto.slug} />
                <input type="hidden" name="direcao" value="baixo" />
                <BotaoDeLinha
                  titulo="Mover para baixo"
                  desabilitado={indice === projetos.length - 1}
                >
                  ↓
                </BotaoDeLinha>
              </form>

              <form action={alternarPublicacao}>
                <input type="hidden" name="slug" value={projeto.slug} />
                <button
                  type="submit"
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent-ink"
                >
                  {projeto.publicado ? "Despublicar" : "Publicar"}
                </button>
              </form>

              <Link
                href={`/admin/projetos/${projeto.slug}`}
                className="rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent"
              >
                Editar
              </Link>
            </div>
          </article>
        ))}

        {projetos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-muted">
            Nenhum projeto ainda.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BotaoDeLinha({
  children,
  titulo,
  desabilitado,
}: {
  children: React.ReactNode;
  titulo: string;
  desabilitado?: boolean;
}) {
  return (
    <button
      type="submit"
      title={titulo}
      aria-label={titulo}
      disabled={desabilitado}
      className="size-8 rounded-md border border-line text-sm text-muted transition-colors hover:border-accent hover:text-accent-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
