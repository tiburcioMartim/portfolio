import type { ReactNode } from "react";

/**
 * Peças de formulário do admin.
 *
 * Todas usam os mesmos tokens de cor do site, então a área administrativa
 * acompanha o tema claro/escuro sem manter uma segunda paleta viva.
 */

const baseDoCampo =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink " +
  "placeholder:text-faint focus:border-accent focus:outline-none";

export function Rotulo({ children, dica }: { children: ReactNode; dica?: string }) {
  return (
    <span className="block">
      <span className="text-sm font-medium text-ink">{children}</span>
      {dica ? <span className="mt-0.5 block text-xs text-faint">{dica}</span> : null}
    </span>
  );
}

type CampoProps = {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  dica?: string;
  placeholder?: string;
  tipo?: string;
  obrigatorio?: boolean;
};

export function Campo({
  rotulo,
  valor,
  aoMudar,
  dica,
  placeholder,
  tipo = "text",
  obrigatorio,
}: CampoProps) {
  return (
    <label className="block space-y-1.5">
      <Rotulo dica={dica}>{rotulo}</Rotulo>
      <input
        type={tipo}
        value={valor}
        required={obrigatorio}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        className={baseDoCampo}
      />
    </label>
  );
}

type AreaProps = {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  dica?: string;
  linhas?: number;
  placeholder?: string;
};

export function Area({ rotulo, valor, aoMudar, dica, linhas = 4, placeholder }: AreaProps) {
  return (
    <label className="block space-y-1.5">
      <Rotulo dica={dica}>{rotulo}</Rotulo>
      <textarea
        value={valor}
        rows={linhas}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        className={`${baseDoCampo} resize-y leading-relaxed`}
      />
    </label>
  );
}

/**
 * Lista de textos editada como um texto só, uma por linha.
 *
 * É o jeito mais rápido de mexer numa lista: dá para colar de uma vez,
 * reordenar arrastando a linha e apagar sem caçar botão de lixeira.
 */
export function ListaPorLinha({
  rotulo,
  valores,
  aoMudar,
  dica,
  linhas = 6,
}: {
  rotulo: string;
  valores: string[];
  aoMudar: (valores: string[]) => void;
  dica?: string;
  linhas?: number;
}) {
  return (
    <Area
      rotulo={rotulo}
      dica={dica ?? "Uma por linha."}
      linhas={linhas}
      valor={valores.join("\n")}
      aoMudar={(texto) =>
        aoMudar(
          texto
            .split("\n")
            .map((linha) => linha.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

export function Selecao<T extends string>({
  rotulo,
  valor,
  opcoes,
  aoMudar,
  dica,
}: {
  rotulo: string;
  valor: T;
  opcoes: readonly T[];
  aoMudar: (valor: T) => void;
  dica?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <Rotulo dica={dica}>{rotulo}</Rotulo>
      <select
        value={valor}
        onChange={(e) => aoMudar(e.target.value as T)}
        className={baseDoCampo}
      >
        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Caixa({
  rotulo,
  dica,
  marcado,
  aoMudar,
}: {
  rotulo: string;
  dica?: string;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => aoMudar(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
      />
      <Rotulo dica={dica}>{rotulo}</Rotulo>
    </label>
  );
}

export function Botao({
  children,
  tipo = "button",
  variante = "primario",
  aoClicar,
  desabilitado,
  className = "",
}: {
  children: ReactNode;
  tipo?: "button" | "submit";
  variante?: "primario" | "neutro" | "perigo";
  aoClicar?: () => void;
  desabilitado?: boolean;
  className?: string;
}) {
  const estilos = {
    primario: "bg-accent text-bg hover:opacity-90",
    neutro: "border border-line-strong text-ink hover:border-accent",
    perigo: "border border-line-strong text-ink hover:border-red-500 hover:text-red-500",
  };

  return (
    <button
      type={tipo}
      onClick={aoClicar}
      disabled={desabilitado}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Aviso({ estado }: { estado?: { erro?: string; sucesso?: string } }) {
  if (!estado?.erro && !estado?.sucesso) return null;

  const erro = Boolean(estado.erro);

  return (
    <p
      role="status"
      className={`rounded-md border px-3 py-2 text-sm ${
        erro
          ? "border-red-500/40 bg-red-500/10 text-red-400"
          : "border-accent/40 bg-accent-soft text-accent-ink"
      }`}
    >
      {estado.erro ?? estado.sucesso}
    </p>
  );
}

/** Agrupa um bloco de campos com título, para o formulário não virar uma parede. */
export function Bloco({
  titulo,
  descricao,
  children,
  acao,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-elevated p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{titulo}</h2>
          {descricao ? <p className="mt-1 text-sm text-muted">{descricao}</p> : null}
        </div>
        {acao}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
