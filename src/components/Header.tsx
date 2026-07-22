import ThemeToggle from "./ThemeToggle";
import { lerPerfil } from "@/lib/conteudo";

const links = [
  { href: "#projetos", rotulo: "Projetos" },
  { href: "#metodo", rotulo: "Como trabalho" },
  { href: "#experiencia", rotulo: "Experiência" },
];

export default async function Header() {
  const { perfil } = await lerPerfil();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <a href="#topo" className="font-mono text-sm font-medium tracking-tight text-ink">
          {perfil.nome.toLowerCase().replaceAll(" ", "-")}
          <span className="text-accent">.dev</span>
        </a>

        <nav aria-label="Seções do site" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {l.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contato"
            className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Falar comigo
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
