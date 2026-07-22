import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivar = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
) => Promise<Buffer>;

const TAMANHO_DA_CHAVE = 64;

/**
 * Gera o valor que vai em `ADMIN_SENHA_HASH`. Usado pelo script
 * `npm run senha` — a senha em texto puro nunca chega ao servidor nem ao repo.
 */
export async function gerarHash(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const chave = await derivar(senha, sal, TAMANHO_DA_CHAVE);
  return `${sal.toString("hex")}:${chave.toString("hex")}`;
}

/**
 * Compara a senha digitada com o hash guardado.
 *
 * A comparação é em tempo constante: um `===` vazaria, pelo tempo de resposta,
 * quantos caracteres iniciais estavam certos.
 */
export async function senhaConfere(senha: string, hashGuardado: string): Promise<boolean> {
  const [salHex, chaveHex] = hashGuardado.split(":");
  if (!salHex || !chaveHex) return false;

  let esperado: Buffer;
  try {
    esperado = Buffer.from(chaveHex, "hex");
  } catch {
    return false;
  }
  if (esperado.length !== TAMANHO_DA_CHAVE) return false;

  const obtido = await derivar(senha, Buffer.from(salHex, "hex"), TAMANHO_DA_CHAVE);
  return timingSafeEqual(obtido, esperado);
}

/**
 * Confere usuário e senha contra o que está no ambiente.
 *
 * Deriva a chave mesmo quando o usuário está errado, para que "usuário
 * inexistente" e "senha errada" levem o mesmo tempo e não dê para descobrir o
 * nome de usuário por cronômetro.
 */
export async function credenciaisConferem(usuario: string, senha: string): Promise<boolean> {
  const usuarioEsperado = process.env.ADMIN_USUARIO;
  const hash = process.env.ADMIN_SENHA_HASH;

  if (!usuarioEsperado || !hash) {
    throw new Error(
      "ADMIN_USUARIO ou ADMIN_SENHA_HASH ausente. Rode `npm run senha` e preencha o .env.",
    );
  }

  const usuarioBate = comparaEmTempoConstante(usuario, usuarioEsperado);
  const senhaBate = await senhaConfere(senha, hash);

  return usuarioBate && senhaBate;
}

function comparaEmTempoConstante(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  // `timingSafeEqual` exige tamanhos iguais; comparar o tamanho antes já vaza
  // essa informação, mas o tamanho do nome de usuário não é o segredo aqui.
  if (bufferA.length !== bufferB.length) return false;

  return timingSafeEqual(bufferA, bufferB);
}
