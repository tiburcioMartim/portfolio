import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projetos from "@/components/Projetos";
import Metodo from "@/components/Metodo";
import Experiencia from "@/components/Experiencia";
import Contato from "@/components/Contato";
import { perfil } from "@/data/perfil";

export default function Home() {
  return (
    <>
      <a
        href="#projetos"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
      >
        Pular para o conteúdo
      </a>

      <Header />

      <main className="flex-1">
        <Hero />
        <Projetos />
        <Metodo />
        <Experiencia />
        <Contato />
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {perfil.nome}
        </p>
        <p className="font-mono text-xs">Next.js · TypeScript · Tailwind</p>
      </footer>
    </>
  );
}
