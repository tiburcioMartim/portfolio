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
          {projeto.problema ? (
            <div>
              <p className="eyebrow">O problema</p>
              <p className="mt-2 leading-relaxed text-muted text-pretty">{projeto.problema}</p>
            </div>
          ) : null}
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

/**
 * Card enxuto dos projetos secundários. Deliberadamente mais leve que o `Card`:
 * sem capa, sem números, sem lista de entregas e sem fundo elevado — o que
 * sobra é nome, chamada, o que foi feito e a stack. É esse contraste, e não uma
 * legenda dizendo "menos importante", que coloca cada grupo no seu lugar.
 */
function CardCompacto({ projeto }: { projeto: Projeto }) {
  return (
    <article className="flex flex-col rounded-lg border border-line p-5">
      <h4 className="text-base font-semibold tracking-tight text-ink">{projeto.nome}</h4>
      <p className="mt-1 text-sm text-accent-ink">{projeto.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{projeto.solucao}</p>

      {/* Mesmo princípio do card grande: stack e link ancorados na base, para
          que os cards de uma linha não terminem cada um numa altura. */}
      <div className="mt-auto pt-4">
        <p className="font-mono text-xs text-faint">{projeto.stack.join(" · ")}</p>

        {projeto.link ? (
          <a
            href={projeto.link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            {projeto.link.rotulo} ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default async function Projetos() {
  const projetos = await lerProjetosPublicados();
  const principais = projetos.filter((p) => !p.secundario);
  const secundarios = projetos.filter((p) => p.secundario);

  return (
    <Secao
      id="projetos"
      rotulo="Projetos"
      titulo="Sistemas que sustentam operação real"
      descricao="Cada um destes está em uso ou em produção. Os números vieram do próprio código, não de estimativa. A maior parte é de código fechado — o que dá para mostrar é o problema, a decisão e o resultado."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {principais.map((p) => (
          <Card key={p.slug} projeto={p} />
        ))}
      </div>

      {secundarios.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <p className="eyebrow">Também entreguei</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted text-pretty">
            Sistemas menores que os de cima, todos na Rede Hospital Casa e todos em produção.
            Estão aqui pelo volume e pela variedade do que a operação pediu — não como vitrine.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {secundarios.map((p) => (
              <CardCompacto key={p.slug} projeto={p} />
            ))}
          </div>
        </div>
      )}
    </Secao>
  );
}
