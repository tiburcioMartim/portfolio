import Link from "next/link";

import FormularioDeProjeto from "../FormularioDeProjeto";
import { exigirSessao } from "@/lib/autorizacao";
import type { Projeto } from "@/data/schema";

export const dynamic = "force-dynamic";

/** Um projeto em branco. A capa é configurada depois de o projeto existir. */
const vazio: Projeto = {
  slug: "",
  nome: "",
  tipo: "Produto próprio",
  periodo: "",
  tagline: "",
  problema: "",
  solucao: "",
  destaques: [],
  numeros: [],
  stack: [],
  codigoFechado: true,
  capa: { modo: "nenhuma" },
  secundario: false,
  publicado: false,
};

export default async function NovoProjeto() {
  await exigirSessao();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/projetos" className="text-sm text-muted hover:text-accent-ink">
          ← Projetos
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Novo projeto</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Ele nasce fora da vitrine, para você escrever com calma. A capa aparece para configurar
          depois de salvar.
        </p>
      </div>

      <FormularioDeProjeto inicial={vazio} novo />
    </div>
  );
}
