import Foto from "./Foto";
import Secao from "./Secao";
import { lerPerfil } from "@/lib/conteudo";

export default async function Metodo() {
  const { perfil, metodo, stack } = await lerPerfil();
  const foto = perfil.fotos.metodo;

  return (
    <Secao
      id="metodo"
      rotulo="Como trabalho"
      titulo="Migrar legado sem quebrar o que já funciona"
      descricao="Sistema em produção não perdoa reescrita otimista. Estes são os três princípios que aplico em todo projeto — e o motivo de eles existirem."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {metodo.map((m, i) => (
          <div key={m.titulo} className="rounded-xl border border-line bg-elevated p-6">
            <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-balance">{m.titulo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{m.texto}</p>
          </div>
        ))}
      </div>

      {/* A foto entra ao lado das ferramentas: dá rosto ao "como eu trabalho"
          sem interromper a leitura dos princípios, e equilibra uma seção que
          de outro modo seria só texto. */}
      <div className={`mt-14 ${foto ? "grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start" : ""}`}>
        {foto ? (
          <Foto
            arquivo={foto}
            alt={`${perfil.nome} trabalhando`}
            proporcao="4 / 3"
            sizes="(min-width: 1024px) 24rem, 100vw"
          />
        ) : null}

        <div>
          <p className="eyebrow">Ferramentas do dia a dia</p>
          <div className="mt-5 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {stack.map((g) => (
              <div key={g.grupo} className="border-t border-line pt-4">
                <h3 className="text-sm font-medium text-ink">{g.grupo}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.itens.map((item) => (
                    <li
                      key={item}
                      className="rounded-md bg-inset px-2.5 py-1 font-mono text-xs text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Secao>
  );
}
