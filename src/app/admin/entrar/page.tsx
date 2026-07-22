import Link from "next/link";

import FormularioDeLogin from "./FormularioDeLogin";

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}) {
  const { destino } = await searchParams;

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-elevated p-8">
          <p className="eyebrow">Área restrita</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Entrar no painel</h1>
          <p className="mt-2 text-sm text-muted">
            Daqui você edita o conteúdo do site e as fotos.
          </p>

          <div className="mt-7">
            <FormularioDeLogin destino={destino ?? "/admin"} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-faint">
          <Link href="/" className="transition-colors hover:text-accent-ink">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
