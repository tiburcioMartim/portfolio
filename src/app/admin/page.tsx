import Link from "next/link";

import { exigirSessao } from "@/lib/autorizacao";
import { lerPerfil, lerProjetos } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

export default async function VisaoGeral() {
  await exigirSessao();

  const [{ perfil }, projetos] = await Promise.all([lerPerfil(), lerProjetos()]);

  const publicados = projetos.filter((p) => p.publicado);
  const semCapa = projetos.filter((p) => !p.capa.arquivo);
  const fotosFaltando = [
    !perfil.fotos.retrato && "o retrato do topo",
    !perfil.fotos.metodo && "a foto do método",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Painel</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Olá, {perfil.nome.split(" ")[0]}
        </h1>
        <p className="mt-2 text-muted">
          O que você mudar aqui aparece no site na hora — sem publicar de novo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Numero valor={String(publicados.length)} label="projetos no ar" />
        <Numero
          valor={String(projetos.length - publicados.length)}
          label="fora da vitrine"
        />
        <Numero valor={String(semCapa.length)} label="sem capa" />
      </div>

      {(semCapa.length > 0 || fotosFaltando.length > 0) && (
        <section className="rounded-xl border border-line bg-elevated p-6">
          <h2 className="text-base font-semibold text-ink">O que ainda falta</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {fotosFaltando.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-muted">
                <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                Falta {item} —{" "}
                <Link href="/admin/perfil" className="text-accent-ink hover:underline">
                  enviar
                </Link>
              </li>
            ))}
            {semCapa.map((projeto) => (
              <li key={projeto.slug} className="flex items-center gap-2.5 text-muted">
                <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span className="text-ink">{projeto.nome}</span> está sem capa —{" "}
                <Link
                  href={`/admin/projetos/${projeto.slug}`}
                  className="text-accent-ink hover:underline"
                >
                  resolver
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Atalho
          href="/admin/perfil"
          titulo="Perfil e fotos"
          texto="Seu nome, resumo, contatos, stack, método, experiência e as duas fotos do site."
        />
        <Atalho
          href="/admin/projetos"
          titulo="Projetos"
          texto="Adicionar, editar, reordenar, publicar ou tirar da vitrine. Links e capas ficam aqui."
        />
      </div>
    </div>
  );
}

function Numero({ valor, label }: { valor: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated p-5">
      <p className="font-mono text-3xl font-semibold text-ink">{valor}</p>
      <p className="mt-1 text-sm text-faint">{label}</p>
    </div>
  );
}

function Atalho({ href, titulo, texto }: { href: string; titulo: string; texto: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-line bg-elevated p-6 transition-colors hover:border-accent"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-medium text-ink">{titulo}</span>
        <span className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
          →
        </span>
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-muted">{texto}</span>
    </Link>
  );
}
