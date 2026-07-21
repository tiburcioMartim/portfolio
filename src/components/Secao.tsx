import type { ReactNode } from "react";

type Props = {
  id: string;
  rotulo: string;
  titulo: string;
  descricao?: string;
  children: ReactNode;
};

/** Cabeçalho padrão das seções, para que todas tenham o mesmo ritmo vertical. */
export default function Secao({ id, rotulo, titulo, descricao, children }: Props) {
  const tituloId = `${id}-titulo`;

  return (
    <section id={id} aria-labelledby={tituloId} className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <p className="eyebrow">{rotulo}</p>
        <h2 id={tituloId} className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {titulo}
        </h2>
        {descricao ? (
          <p className="mt-4 max-w-2xl leading-relaxed text-muted text-pretty">{descricao}</p>
        ) : null}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
