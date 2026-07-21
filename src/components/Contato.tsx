import { perfil } from "@/data/perfil";

/**
 * Sem formulário: um formulário exigiria backend ou serviço de terceiro e mais
 * um ponto de falha. O mailto já chega classificado pelo assunto, que é o que
 * importa para separar recrutador de cliente.
 */
const assuntos = [
  {
    rotulo: "Tenho uma vaga",
    assunto: "Vaga — contato pelo portfólio",
    corpo: "Olá, Martim. Estamos com uma vaga e queria conversar sobre.",
  },
  {
    rotulo: "Tenho um projeto",
    assunto: "Projeto — contato pelo portfólio",
    corpo: "Olá, Martim. Preciso de um sistema e queria entender prazo e valor.",
  },
];

function mailto(assunto: string, corpo: string) {
  return `mailto:${perfil.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export default function Contato() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="rounded-2xl border border-line bg-elevated p-8 sm:p-12">
          <p className="eyebrow">Contato</p>
          <h2 id="contato-titulo" className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Vamos conversar
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted text-pretty">
            Respondo em até um dia útil. Se for projeto, me conte o problema que precisa resolver — não
            precisa chegar com a solução pronta.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {assuntos.map((a, i) => (
              <a
                key={a.rotulo}
                href={mailto(a.assunto, a.corpo)}
                className={`rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
                  i === 0
                    ? "bg-accent text-bg"
                    : "border border-line-strong text-ink hover:border-accent"
                }`}
              >
                {a.rotulo}
              </a>
            ))}
          </div>

          <div className="mt-10 grid gap-x-8 gap-y-4 border-t border-line pt-8 sm:grid-cols-3">
            <a href={`mailto:${perfil.email}`} className="group">
              <span className="eyebrow">E-mail</span>
              <span className="mt-1.5 block text-sm text-muted transition-colors group-hover:text-accent-ink">
                {perfil.email}
              </span>
            </a>
            <a href={perfil.linkedin} target="_blank" rel="noreferrer noopener" className="group">
              <span className="eyebrow">LinkedIn</span>
              <span className="mt-1.5 block text-sm text-muted transition-colors group-hover:text-accent-ink">
                /in/martimtiburcio-dev ↗
              </span>
            </a>
            <a href={perfil.github} target="_blank" rel="noreferrer noopener" className="group">
              <span className="eyebrow">GitHub</span>
              <span className="mt-1.5 block text-sm text-muted transition-colors group-hover:text-accent-ink">
                /tiburcioMartim ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
