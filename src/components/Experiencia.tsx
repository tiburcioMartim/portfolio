import Secao from "./Secao";
import { lerPerfil } from "@/lib/conteudo";

export default async function Experiencia() {
  const { experiencia, formacao } = await lerPerfil();

  return (
    <Secao id="experiencia" rotulo="Trajetória" titulo="Onde eu venho aplicando isso">
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <ol className="relative space-y-8 border-l border-line pl-6">
            {experiencia.map((e) => (
              <li key={`${e.empresa}-${e.periodo}`} className="relative">
                <span
                  className="absolute top-1.5 -left-[1.655rem] size-2.5 rounded-full border-2 border-bg bg-accent"
                  aria-hidden
                />
                <p className="font-mono text-xs text-faint">{e.periodo}</p>
                <h3 className="mt-1.5 font-semibold text-ink">{e.cargo}</h3>
                <p className="text-sm text-accent-ink">
                  {e.empresa} <span className="text-faint">· {e.local}</span>
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted text-pretty">
                  {e.descricao}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="eyebrow">Formação</p>
          <ul className="mt-5 space-y-5">
            {formacao.map((f) => (
              <li key={`${f.curso}-${f.instituicao}`} className="border-t border-line pt-4">
                <h3 className="text-sm font-medium text-ink">{f.curso}</h3>
                <p className="mt-1 text-sm text-muted">{f.instituicao}</p>
                <p className="mt-0.5 font-mono text-xs text-faint">{f.periodo}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Secao>
  );
}
