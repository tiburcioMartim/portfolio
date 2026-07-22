import Link from "next/link";
import type { Metadata } from "next";

import { sair } from "./acoes";
import { sessaoAtual } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "Painel",
  // O admin não deve aparecer em busca nem virar cartão de compartilhamento.
  robots: { index: false, follow: false },
};

const secoes = [
  { href: "/admin", rotulo: "Visão geral" },
  { href: "/admin/perfil", rotulo: "Perfil e fotos" },
  { href: "/admin/projetos", rotulo: "Projetos" },
];

export default async function LayoutDoAdmin({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAtual();

  // A tela de login é a única do /admin sem sessão. Ela se vira sozinha, sem a
  // casca de navegação — não haveria para onde navegar.
  if (!sessao) return <>{children}</>;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-mono text-sm font-medium text-ink">
              painel<span className="text-accent">.</span>
            </Link>

            <nav aria-label="Seções do painel" className="hidden items-center gap-5 sm:flex">
              {secoes.map((secao) => (
                <Link
                  key={secao.href}
                  href={secao.href}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {secao.rotulo}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-muted transition-colors hover:text-accent-ink"
            >
              Ver o site ↗
            </Link>
            <form action={sair}>
              <button
                type="submit"
                className="rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Seções do painel"
          className="flex items-center gap-5 border-t border-line px-6 py-2.5 sm:hidden"
        >
          {secoes.map((secao) => (
            <Link key={secao.href} href={secao.href} className="text-sm text-muted">
              {secao.rotulo}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
