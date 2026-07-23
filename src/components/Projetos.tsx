import Image from "next/image";

import Secao from "./Secao";
import { lerProjetosPublicados } from "@/lib/conteudo";
import type { Projeto } from "@/data/schema";

function Etiqueta({ tipo }: { tipo: Projeto["tipo"] }) {
  const destaque = tipo === "Cliente" || tipo === "Trabalho";
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-mono text-[0.68rem] tracking-wide uppercase ${
        destaque ? "bg-accent-soft text-accent-ink" : "bg-inset text-faint"
      }`}
    >
      {tipo}
    </span>
  );
}

/**
 * Capa do projeto. Só aparece quando existe imagem — um card sem capa continua
 * legítimo, enquanto uma faixa vazia de placeholder só sujaria a página.
 */
function Capa({ projeto }: { projeto: Projeto }) {
  const { capa } = projeto;
  if (!capa.arquivo) return null;

  return (
    <div className="relative aspect-[16/9] border-b border-line bg-inset">
      <Image
        src={`/uploads/${capa.arquivo}`}
        alt={`Interface do projeto ${projeto.nome}`}
        fill
        sizes="(min-width: 1024px) 34rem, 100vw"
        className="object-cover object-top"
      />

      {capa.modo === "automatica" && capa.capturadaEm ? (
        <span className="absolute right-3 bottom-3 rounded-md bg-bg/80 px-2 py-1 font-mono text-[0.65rem] text-faint backdrop-blur-sm">
          captura de {formatarData(capa.capturadaEm)}
        </span>
      ) : null}
    </div>
  );
}

function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function Card({ projeto }: { projeto: Projeto }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-elevated">
      <Capa projeto={projeto} />

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Etiqueta tipo={projeto.tipo} />
          <span className="font-mono text-xs text-faint">{projeto.periodo}</span>
        </div>

        <h3 className="mt-4 text-2xl font-semibold tracking-tight">{projeto.nome}</h3>
        <p className="mt-2 text-accent-ink">{projeto.tagline}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="eyebrow">O problema</p>
            <p className="mt-2 leading-relaxed text-muted text-pretty">{projeto.problema}</p>
          </div>
          <div>
            <p className="eyebrow">O que eu fiz</p>
            <p className="mt-2 leading-relaxed text-muted text-pretty">{projeto.solucao}</p>
          </div>
        </div>

        {projeto.numeros.length > 0 && (
          <dl className="mt-8 grid grid-cols-3 gap-4 rounded-lg border border-line bg-inset p-4">
            {projeto.numeros.map((n) => (
              <div key={n.label}>
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <span className="block font-mono text-xl font-semibold text-ink sm:text-2xl">
                    {n.valor}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-faint">{n.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {projeto.destaques.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow">Entregas</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {projeto.destaques.map((d) => (
                <li key={d} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-1 size-3.5 shrink-0 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden
                  >
                    <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* mt-auto ancora o rodapé na base para que cards vizinhos, de alturas
            diferentes, terminem alinhados na mesma linha da grade. */}
        <div className="mt-auto pt-8">
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-6">
            {projeto.stack.map((t) => (
              <span
                key={t}
                className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted"
              >
                {t}
              </span>
            ))}

            <span className="ml-auto flex items-center gap-4">
              {projeto.codigoFechado ? (
                <span className="font-mono text-xs text-faint">código fechado</span>
              ) : null}
              {projeto.link ? (
                <a
                  href={projeto.link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
                >
                  {projeto.link.rotulo} ↗
                </a>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function Projetos() {
  const projetos = await lerProjetosPublicados();

  return (
    <Secao
      id="projetos"
      rotulo="Projetos"
      titulo="Sistemas que sustentam operação real"
      descricao="Cada um destes está em uso ou em produção. Os números vieram do próprio código, não de estimativa. A maior parte é de código fechado — o que dá para mostrar é o problema, a decisão e o resultado."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {projetos.map((p) => (
          <Card key={p.slug} projeto={p} />
        ))}
      </div>
    </Secao>
  );
}
