import { perfil } from "@/data/perfil";

/** As "duas portas": o site atende recrutador e cliente, e cada um entra por um caminho. */
const portas = [
  {
    href: "#projetos",
    titulo: "Vim ver o trabalho",
    texto: "Sistemas em produção, com o problema que resolviam e como foram construídos.",
  },
  {
    href: "#contato",
    titulo: "Preciso de um sistema",
    texto: "Do banco ao deploy: loja, painel interno, integração de pagamento ou modernização de legado.",
  },
];

export default function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <p className="eyebrow">{perfil.papel}</p>

        <h1 className="mt-5 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
          {perfil.nome}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">
          {perfil.resumo}
        </p>

        <p className="mt-5 flex items-center gap-2 font-mono text-xs text-faint">
          <span className="inline-block size-1.5 rounded-full bg-accent" aria-hidden />
          {perfil.local}
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {portas.map((porta) => (
            <a
              key={porta.href}
              href={porta.href}
              className="group rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-accent"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink">{porta.titulo}</span>
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">{porta.texto}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
