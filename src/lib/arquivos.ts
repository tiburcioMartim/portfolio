import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Imagens enviadas pelo admin.
 *
 * Tudo é convertido para WebP na chegada, no tamanho em que será exibido. Isso
 * resolve dois problemas de uma vez: uma foto de celular de 5 MB não vai parar
 * na página de quem abre o site pelo 4G, e o servidor não precisa otimizar
 * imagem a cada visita — o que na VPS significa não disputar CPU com a
 * aplicação da Celly.
 */

const DIRETORIO = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "conteudo", "uploads");

/** Limite de entrada. Acima disso é engano, não foto de portfólio. */
export const TAMANHO_MAXIMO = 12 * 1024 * 1024;

const TIPOS_ACEITOS = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type Formato = "retrato" | "capa";

/** Cada uso tem um tamanho máximo — não adianta guardar 4000px para exibir 600. */
const DIMENSOES: Record<Formato, { largura: number; altura: number }> = {
  retrato: { largura: 1000, altura: 1250 },
  capa: { largura: 1600, altura: 1000 },
};

export type ResultadoDoUpload =
  | { ok: true; arquivo: string }
  | { ok: false; erro: string };

export async function salvarImagem(
  entrada: File,
  formato: Formato,
  prefixo: string,
): Promise<ResultadoDoUpload> {
  if (entrada.size === 0) return { ok: false, erro: "Arquivo vazio." };
  if (entrada.size > TAMANHO_MAXIMO) {
    return { ok: false, erro: `A imagem passa de ${Math.round(TAMANHO_MAXIMO / 1024 / 1024)} MB.` };
  }
  if (!TIPOS_ACEITOS.has(entrada.type)) {
    return { ok: false, erro: "Formato não aceito. Use JPEG, PNG, WebP ou AVIF." };
  }

  const bytes = Buffer.from(await entrada.arrayBuffer());
  const { largura, altura } = DIMENSOES[formato];

  let processada: Buffer;
  try {
    processada = await sharp(bytes)
      // `inside` preserva a proporção original: a foto cabe na caixa sem cortar
      // nem esticar, e o enquadramento continua sendo escolha sua.
      .resize({ width: largura, height: altura, fit: "inside", withoutEnlargement: true })
      .rotate() // respeita a orientação EXIF, senão foto de celular vira de lado
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    // Extensão certa não garante conteúdo válido; quem decide é o decodificador.
    return { ok: false, erro: "Não consegui ler essa imagem. O arquivo pode estar corrompido." };
  }

  // O nome é gerado aqui. O que veio do navegador nunca vira caminho no disco.
  const nome = `${limpar(prefixo)}-${randomBytes(6).toString("hex")}.webp`;

  await mkdir(DIRETORIO, { recursive: true });
  const destino = path.join(DIRETORIO, nome);
  const temporario = `${destino}.tmp`;
  await writeFile(temporario, processada);
  await rename(temporario, destino);

  return { ok: true, arquivo: nome };
}

/** Grava bytes já prontos (usado pela captura automática de capas). */
export async function salvarBytes(bytes: Buffer, prefixo: string): Promise<string> {
  const processada = await sharp(bytes)
    .resize({
      width: DIMENSOES.capa.largura,
      height: DIMENSOES.capa.altura,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const nome = `${limpar(prefixo)}-${randomBytes(6).toString("hex")}.webp`;

  await mkdir(DIRETORIO, { recursive: true });
  const destino = path.join(DIRETORIO, nome);
  const temporario = `${destino}.tmp`;
  await writeFile(temporario, processada);
  await rename(temporario, destino);

  return nome;
}

/**
 * Resolve um nome de arquivo para um caminho absoluto, recusando qualquer coisa
 * que tente sair da pasta de uploads. Sem isto, `../../etc/passwd` numa URL
 * viraria leitura de arquivo do sistema.
 */
export function caminhoSeguro(nome: string): string | null {
  if (!nome || nome.includes("\0")) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(nome)) return null;
  if (nome.startsWith(".")) return null;

  const resolvido = path.resolve(DIRETORIO, nome);
  if (path.dirname(resolvido) !== DIRETORIO) return null;

  return resolvido;
}

export async function lerArquivo(nome: string): Promise<Buffer | null> {
  const caminho = caminhoSeguro(nome);
  if (!caminho) return null;

  try {
    return await readFile(caminho);
  } catch {
    return null;
  }
}

export async function apagarArquivo(nome: string): Promise<void> {
  const caminho = caminhoSeguro(nome);
  if (!caminho) return;

  try {
    await unlink(caminho);
  } catch {
    // Já não existe: o objetivo era esse.
  }
}

function limpar(texto: string): string {
  const limpo = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira os acentos que o NFD separou
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return limpo || "imagem";
}

export { DIRETORIO as diretorioDeUploads };
