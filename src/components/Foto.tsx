import Image from "next/image";

type Props = {
  arquivo: string;
  alt: string;
  /** Proporção da moldura. A foto se ajusta dentro dela sem distorcer. */
  proporcao?: string;
  /** Dica de largura para o navegador escolher quando baixar. */
  sizes?: string;
  prioridade?: boolean;
  className?: string;
};

/**
 * Moldura padrão das fotos do site.
 *
 * Existe para que toda foto receba o mesmo tratamento — mesma borda, mesmo
 * arredondamento, mesma transição entre tema claro e escuro. Sem isso, cada
 * lugar inventaria o seu e o site pareceria montado por duas pessoas.
 */
export default function Foto({
  arquivo,
  alt,
  proporcao = "4 / 5",
  sizes = "(min-width: 1024px) 32rem, 100vw",
  prioridade = false,
  className = "",
}: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-inset ${className}`}
      style={{ aspectRatio: proporcao }}
    >
      <Image
        src={`/uploads/${arquivo}`}
        alt={alt}
        fill
        sizes={sizes}
        priority={prioridade}
        className="object-cover"
      />

      {/* Véu quase imperceptível que assenta a foto na paleta do site, para ela
          não brigar com o fundo em nenhum dos dois temas. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/25 to-transparent"
        aria-hidden
      />
    </div>
  );
}
