import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import {
  documentoPerfilSchema,
  documentoProjetosSchema,
  type DocumentoPerfil,
  type DocumentoProjetos,
} from "@/data/schema";
import perfilSeed from "@/data/seed/perfil.json";
import projetosSeed from "@/data/seed/projetos.json";

/**
 * Onde o conteúdo editável vive.
 *
 * Em desenvolvimento é a pasta `conteudo/` do repositório. Em produção aponta
 * para um diretório fora da aplicação (`CONTEUDO_DIR`), para que publicar uma
 * versão nova do site não apague o que você escreveu pelo admin.
 */
const DIRETORIO = process.env.CONTEUDO_DIR
  ? path.resolve(process.env.CONTEUDO_DIR)
  : path.join(process.cwd(), "conteudo");

const ARQUIVOS = {
  perfil: "perfil.json",
  projetos: "projetos.json",
} as const;

type Documentos = {
  perfil: DocumentoPerfil;
  projetos: DocumentoProjetos;
};

const schemas = {
  perfil: documentoPerfilSchema,
  projetos: documentoProjetosSchema,
};

/**
 * O conteúdo que veio no repositório. Serve de ponto de partida na primeira
 * execução e de rede de segurança: se o arquivo gravado sumir ou corromper, o
 * site continua no ar com o texto original em vez de quebrar.
 */
const semente: Documentos = {
  perfil: documentoPerfilSchema.parse(perfilSeed),
  projetos: documentoProjetosSchema.parse(projetosSeed),
};

async function ler<K extends keyof Documentos>(chave: K): Promise<Documentos[K]> {
  const caminho = path.join(DIRETORIO, ARQUIVOS[chave]);

  let cru: string;
  try {
    cru = await readFile(caminho, "utf8");
  } catch {
    // Ainda não houve nenhuma edição: o conteúdo do repositório é a verdade.
    return semente[chave];
  }

  const analisado = schemas[chave].safeParse(JSON.parse(cru));
  if (!analisado.success) {
    // Arquivo existe mas não bate com o schema — provavelmente uma edição manual
    // malfeita. Preferimos servir o conteúdo original a derrubar o site.
    console.error(`Conteúdo inválido em ${caminho}:`, analisado.error.issues);
    return semente[chave];
  }

  return analisado.data as Documentos[K];
}

/**
 * Grava de forma atômica: escreve num arquivo temporário e só então renomeia.
 * Assim uma falha no meio da escrita nunca deixa um JSON pela metade no lugar
 * do conteúdo bom.
 */
async function gravar<K extends keyof Documentos>(chave: K, dados: Documentos[K]): Promise<void> {
  await mkdir(DIRETORIO, { recursive: true });

  const caminho = path.join(DIRETORIO, ARQUIVOS[chave]);
  const temporario = `${caminho}.${process.pid}.tmp`;

  await writeFile(temporario, JSON.stringify(dados, null, 2) + "\n", "utf8");
  await rename(temporario, caminho);
}

/**
 * Memorizado por renderização: várias seções pedem o perfil na mesma página e
 * só uma leitura de disco acontece.
 */
export const lerPerfil = cache(() => ler("perfil"));
export const lerProjetos = cache(() => ler("projetos"));

/** Só o que deve aparecer na vitrine, na ordem em que está gravado. */
export const lerProjetosPublicados = cache(async () =>
  (await ler("projetos")).filter((projeto) => projeto.publicado),
);

export async function gravarPerfil(dados: DocumentoPerfil): Promise<void> {
  await gravar("perfil", documentoPerfilSchema.parse(dados));
}

export async function gravarProjetos(dados: DocumentoProjetos): Promise<void> {
  await gravar("projetos", documentoProjetosSchema.parse(dados));
}

export { DIRETORIO as diretorioDeConteudo };
