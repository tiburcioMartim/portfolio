"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";

import {
  documentoPerfilSchema,
  projetoSchema,
  type DocumentoPerfil,
  type Projeto,
} from "@/data/schema";
import { apagarArquivo, salvarImagem } from "@/lib/arquivos";
import { exigirSessao } from "@/lib/autorizacao";
import { gravarPerfil, gravarProjetos, lerPerfil, lerProjetos } from "@/lib/conteudo";
import { credenciaisConferem } from "@/lib/credenciais";
import { esquecerTentativas, registrarTentativa } from "@/lib/limite";
import { criarSessao, encerrarSessao } from "@/lib/sessao";

/**
 * Ações do admin.
 *
 * Toda ação que grava começa por `exigirSessao()`. Server Actions são
 * endpoints públicos como qualquer outro: esconder o botão no formulário não
 * impede ninguém de chamar a ação direto.
 */

export type Estado = { erro?: string; sucesso?: string } | undefined;

// ---------------------------------------------------------------- sessão

/** Identifica quem está tentando entrar, para o freio de força bruta. */
async function origemDaTentativa(): Promise<string> {
  const cabecalhos = await headers();
  const encaminhado = cabecalhos.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || "desconhecido";
}

export async function entrar(_estado: Estado, formData: FormData): Promise<Estado> {
  const usuario = String(formData.get("usuario") ?? "");
  const senha = String(formData.get("senha") ?? "");
  const destino = String(formData.get("destino") ?? "/admin");

  if (!usuario || !senha) return { erro: "Preencha usuário e senha." };

  const origem = await origemDaTentativa();
  const veredito = registrarTentativa(origem);
  if (!veredito.permitido) {
    const minutos = Math.ceil(veredito.segundosRestantes / 60);
    return { erro: `Tentativas demais. Tente de novo em ${minutos} min.` };
  }

  if (!(await credenciaisConferem(usuario, senha))) {
    // Mensagem única de propósito: dizer "usuário não existe" entregaria de
    // graça qual metade da credencial já está certa.
    return { erro: "Usuário ou senha incorretos." };
  }

  esquecerTentativas(origem);
  await criarSessao(usuario);

  // Só aceita caminho interno — senão um link com `?destino=https://...`
  // transformaria o login numa ponte para o site de outra pessoa.
  redirect(destino.startsWith("/admin") ? destino : "/admin");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/admin/entrar");
}

// ---------------------------------------------------------------- perfil

export async function salvarPerfil(_estado: Estado, formData: FormData): Promise<Estado> {
  await exigirSessao();

  const analisado = analisarJson(formData.get("dados"), documentoPerfilSchema);
  if (!analisado.ok) return { erro: analisado.erro };

  // As fotos não vêm neste formulário — elas têm o próprio fluxo de envio.
  // Sem isto, salvar o texto apagaria as imagens já enviadas.
  const atual = await lerPerfil();
  const documento: DocumentoPerfil = {
    ...analisado.dados,
    perfil: { ...analisado.dados.perfil, fotos: atual.perfil.fotos },
  };

  await gravarPerfil(documento);
  revalidarSite();

  return { sucesso: "Perfil salvo." };
}

export async function enviarFotoDoPerfil(_estado: Estado, formData: FormData): Promise<Estado> {
  await exigirSessao();

  const posicao = formData.get("posicao");
  if (posicao !== "retrato" && posicao !== "metodo") return { erro: "Posição inválida." };

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File)) return { erro: "Nenhuma imagem escolhida." };

  const resultado = await salvarImagem(arquivo, "retrato", `perfil-${posicao}`);
  if (!resultado.ok) return { erro: resultado.erro };

  const documento = await lerPerfil();
  const anterior = documento.perfil.fotos[posicao];

  await gravarPerfil({
    ...documento,
    perfil: {
      ...documento.perfil,
      fotos: { ...documento.perfil.fotos, [posicao]: resultado.arquivo },
    },
  });

  // Só apaga a antiga depois que a nova está gravada no conteúdo — se algo
  // falhar no meio, sobra um arquivo órfão em vez de uma foto quebrada.
  if (anterior) await apagarArquivo(anterior);

  revalidarSite();
  return { sucesso: "Foto atualizada." };
}

export async function removerFotoDoPerfil(_estado: Estado, formData: FormData): Promise<Estado> {
  await exigirSessao();

  const posicao = formData.get("posicao");
  if (posicao !== "retrato" && posicao !== "metodo") return { erro: "Posição inválida." };

  const documento = await lerPerfil();
  const atual = documento.perfil.fotos[posicao];

  await gravarPerfil({
    ...documento,
    perfil: { ...documento.perfil, fotos: { ...documento.perfil.fotos, [posicao]: "" } },
  });

  if (atual) await apagarArquivo(atual);

  revalidarSite();
  return { sucesso: "Foto removida." };
}

// -------------------------------------------------------------- projetos

export async function salvarProjeto(_estado: Estado, formData: FormData): Promise<Estado> {
  await exigirSessao();

  const analisado = analisarJson(formData.get("dados"), projetoSchema);
  if (!analisado.ok) return { erro: analisado.erro };

  const original = String(formData.get("slugOriginal") ?? "");
  const projetos = await lerProjetos();
  const indice = projetos.findIndex((p) => p.slug === original);

  const conflito = projetos.some(
    (p, i) => p.slug === analisado.dados.slug && i !== indice,
  );
  if (conflito) return { erro: `Já existe um projeto com o endereço "${analisado.dados.slug}".` };

  // A capa tem fluxo próprio (envio e captura), então preservamos a que já
  // está gravada em vez de deixar o formulário de texto sobrescrevê-la.
  const capa = indice >= 0 ? projetos[indice].capa : analisado.dados.capa;
  const projeto: Projeto = { ...analisado.dados, capa };

  const atualizados = indice >= 0
    ? projetos.map((p, i) => (i === indice ? projeto : p))
    : [...projetos, projeto];

  await gravarProjetos(atualizados);
  revalidarSite();

  if (indice < 0) redirect(`/admin/projetos/${projeto.slug}`);
  if (projeto.slug !== original) redirect(`/admin/projetos/${projeto.slug}`);

  return { sucesso: "Projeto salvo." };
}

export async function apagarProjeto(formData: FormData): Promise<void> {
  await exigirSessao();

  const slug = String(formData.get("slug") ?? "");
  const projetos = await lerProjetos();
  const alvo = projetos.find((p) => p.slug === slug);

  await gravarProjetos(projetos.filter((p) => p.slug !== slug));
  if (alvo?.capa.arquivo) await apagarArquivo(alvo.capa.arquivo);

  revalidarSite();
  redirect("/admin/projetos");
}

export async function alternarPublicacao(formData: FormData): Promise<void> {
  await exigirSessao();

  const slug = String(formData.get("slug") ?? "");
  const projetos = await lerProjetos();

  await gravarProjetos(
    projetos.map((p) => (p.slug === slug ? { ...p, publicado: !p.publicado } : p)),
  );

  revalidarSite();
  revalidatePath("/admin/projetos");
}

/** Reordena a vitrine: a ordem do arquivo é a ordem que aparece no site. */
export async function moverProjeto(formData: FormData): Promise<void> {
  await exigirSessao();

  const slug = String(formData.get("slug") ?? "");
  const direcao = formData.get("direcao") === "cima" ? -1 : 1;

  const projetos = [...(await lerProjetos())];
  const de = projetos.findIndex((p) => p.slug === slug);
  const para = de + direcao;

  if (de < 0 || para < 0 || para >= projetos.length) return;

  [projetos[de], projetos[para]] = [projetos[para], projetos[de]];

  await gravarProjetos(projetos);
  revalidarSite();
  revalidatePath("/admin/projetos");
}

export async function enviarCapa(_estado: Estado, formData: FormData): Promise<Estado> {
  await exigirSessao();

  const slug = String(formData.get("slug") ?? "");
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File)) return { erro: "Nenhuma imagem escolhida." };

  const resultado = await salvarImagem(arquivo, "capa", `capa-${slug}`);
  if (!resultado.ok) return { erro: resultado.erro };

  const projetos = await lerProjetos();
  const anterior = projetos.find((p) => p.slug === slug)?.capa.arquivo;

  await gravarProjetos(
    projetos.map((p) =>
      p.slug === slug
        ? { ...p, capa: { ...p.capa, modo: "enviada" as const, arquivo: resultado.arquivo } }
        : p,
    ),
  );

  if (anterior) await apagarArquivo(anterior);

  revalidarSite();
  return { sucesso: "Capa atualizada." };
}

export async function removerCapa(formData: FormData): Promise<void> {
  await exigirSessao();

  const slug = String(formData.get("slug") ?? "");
  const projetos = await lerProjetos();
  const anterior = projetos.find((p) => p.slug === slug)?.capa.arquivo;

  await gravarProjetos(
    projetos.map((p) =>
      p.slug === slug ? { ...p, capa: { ...p.capa, arquivo: "", capturadaEm: undefined } } : p,
    ),
  );

  if (anterior) await apagarArquivo(anterior);

  revalidarSite();
  revalidatePath(`/admin/projetos/${slug}`);
}

/** Guarda o endereço que a captura automática deve fotografar. */
export async function definirOrigemDaCapa(_estado: Estado, formData: FormData): Promise<Estado> {
  await exigirSessao();

  const slug = String(formData.get("slug") ?? "");
  const modo = formData.get("modo");
  const urlOrigem = String(formData.get("urlOrigem") ?? "").trim();

  if (modo !== "automatica" && modo !== "enviada" && modo !== "nenhuma") {
    return { erro: "Modo inválido." };
  }

  if (modo === "automatica") {
    const url = z.url().safeParse(urlOrigem);
    if (!url.success) return { erro: "Informe o endereço completo do site, com https://" };
  }

  const projetos = await lerProjetos();
  await gravarProjetos(
    projetos.map((p) => (p.slug === slug ? { ...p, capa: { ...p.capa, modo, urlOrigem } } : p)),
  );

  revalidatePath(`/admin/projetos/${slug}`);
  return { sucesso: "Origem da capa salva." };
}

// ---------------------------------------------------------------- apoio

/**
 * Os formulários mandam o estado inteiro como JSON num campo só. Editar listas
 * (destaques, números, experiência) com campos indexados no HTML seria muito
 * mais frágil, e a validação do zod acontece igual dos dois jeitos.
 */
function analisarJson<T extends z.ZodType>(
  valor: FormDataEntryValue | null,
  schema: T,
): { ok: true; dados: z.infer<T> } | { ok: false; erro: string } {
  if (typeof valor !== "string") return { ok: false, erro: "Formulário incompleto." };

  let bruto: unknown;
  try {
    bruto = JSON.parse(valor);
  } catch {
    return { ok: false, erro: "Não consegui ler os dados do formulário." };
  }

  const resultado = schema.safeParse(bruto);
  if (!resultado.success) {
    const primeiro = resultado.error.issues[0];
    const onde = primeiro.path.join(" › ");
    return { ok: false, erro: onde ? `${onde}: ${primeiro.message}` : primeiro.message };
  }

  return { ok: true, dados: resultado.data };
}

/** O site inteiro depende do conteúdo, então uma edição invalida tudo. */
function revalidarSite(): void {
  revalidatePath("/", "layout");
}
