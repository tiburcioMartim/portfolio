import Link from "next/link";
import { notFound } from "next/navigation";

import { apagarProjeto } from "../../acoes";
import FormularioDeProjeto from "../FormularioDeProjeto";
import GerenciadorDeCapa from "../GerenciadorDeCapa";
import { exigirSessao } from "@/lib/autorizacao";
import { lerProjetos } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

export default async function EditarProjeto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await exigirSessao();

  const { slug } = await params;
  const projeto = (await lerProjetos()).find((p) => p.slug === slug);
  if (!projeto) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/projetos" className="text-sm text-muted hover:text-accent-ink">
          ← Projetos
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{projeto.nome}</h1>
        <p className="mt-2 font-mono text-sm text-faint">/{projeto.slug}</p>
      </div>

      <GerenciadorDeCapa slug={projeto.slug} capa={projeto.capa} />

      <FormularioDeProjeto inicial={projeto} />

      <section className="rounded-xl border border-line p-6">
        <h2 className="text-base font-semibold text-ink">Apagar projeto</h2>
        <p className="mt-1 text-sm text-muted">
          Some da lista e leva a capa junto, sem volta. Para apenas tirar do site, use
          &ldquo;Publicado&rdquo; ali em cima — o conteúdo continua guardado.
        </p>

        <form action={apagarProjeto} className="mt-4">
          <input type="hidden" name="slug" value={projeto.slug} />
          <button
            type="submit"
            className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-red-500 hover:text-red-500"
          >
            Apagar {projeto.nome}
          </button>
        </form>
      </section>
    </div>
  );
}
