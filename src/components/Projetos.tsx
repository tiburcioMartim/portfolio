import Secao from "./Secao";
import { projetos, type Projeto } from "@/data/projetos";

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

function Card({ projeto }: { projeto: Projeto }) {
  return (
    <article className="rounded-xl border border-line bg-elevated p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <Etiqueta tipo={projeto.tipo} />
        <span className="font-mono text-xs text-faint">{projeto.periodo}</span>
      </div>

      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{projeto.nome}</h3>
      <p className="mt-2 text-accent-ink">{projeto.tagline}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
                <span className="block font-mono text-xl font-semibold text-ink sm:text-2xl">{n.valor}</span>
                <span className="mt-1 block text-xs leading-snug text-faint">{n.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8">
        <p className="eyebrow">Entregas</p>
        <ul className="mt-3 grid gap-2 lg:grid-cols-2">
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

      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-6">
        {projeto.stack.map((t) => (
          <span key={t} className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted">
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
    </article>
  );
}

export default function Projetos() {
  return (
    <Secao
      id="projetos"
      rotulo="Projetos"
      titulo="Sistemas que sustentam operação real"
      descricao="Cada um destes está em uso ou em produção. Os números vieram do próprio código, não de estimativa. A maior parte é de código fechado — o que dá para mostrar é o problema, a decisão e o resultado."
    >
      <div className="grid gap-6">
        {projetos.map((p) => (
          <Card key={p.slug} projeto={p} />
        ))}
      </div>
    </Secao>
  );
}
