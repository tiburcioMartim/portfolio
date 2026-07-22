import * as z from "zod";

/**
 * Fonte única da forma do conteúdo.
 *
 * O site lê estes tipos para renderizar e o admin usa os mesmos schemas para
 * validar o que você grava. Se um campo mudar aqui, o TypeScript aponta todos
 * os lugares que precisam acompanhar — em vez de descobrirmos em produção que
 * um projeto ficou sem `tagline`.
 */

const textoCurto = z.string().trim().min(1, { error: "Não pode ficar vazio." });

/** Lista digitada uma por linha no admin; linhas em branco são descartadas. */
const listaDeTextos = z.array(z.string().trim().min(1)).default([]);

/** Nome de arquivo dentro da pasta de uploads — nunca um caminho. */
export const nomeDeArquivo = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9._-]+$/, { error: "Nome de arquivo inválido." });

export const capaSchema = z.object({
  /**
   * `automatica` captura o site em `urlOrigem` e atualiza sozinha; `enviada` usa
   * a imagem que você subiu; `nenhuma` cai no cartão gerado por código.
   */
  modo: z.enum(["automatica", "enviada", "nenhuma"]).default("nenhuma"),
  urlOrigem: z.url({ error: "Precisa ser uma URL completa." }).optional().or(z.literal("")),
  arquivo: nomeDeArquivo.optional().or(z.literal("")),
  capturadaEm: z.string().optional(),
});

export const projetoSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, { error: "Use apenas minúsculas, números e hífen." }),
  nome: textoCurto,
  tipo: z.enum(["Trabalho", "Cliente", "Produto próprio", "Open source"]),
  periodo: textoCurto,
  /** Chamada curta, entendível por quem não é técnico. */
  tagline: textoCurto,
  problema: textoCurto,
  solucao: textoCurto,
  /** Entregas concretas — o que existe e funciona. */
  destaques: listaDeTextos,
  /** Números medidos no próprio repositório, não estimados. */
  numeros: z.array(z.object({ valor: textoCurto, label: textoCurto })).default([]),
  stack: listaDeTextos,
  link: z
    .object({ href: z.url({ error: "Precisa ser uma URL completa." }), rotulo: textoCurto })
    .optional(),
  /** Código fechado: sem link de repositório. */
  codigoFechado: z.boolean().default(true),
  capa: capaSchema.default({ modo: "nenhuma" }),
  /** Fora da vitrine, mas preservado — despublicar não é apagar. */
  publicado: z.boolean().default(true),
});

export const perfilSchema = z.object({
  nome: textoCurto,
  papel: textoCurto,
  local: textoCurto,
  /** Uma frase, sem jargão, que funciona para recrutador e para cliente. */
  resumo: textoCurto,
  site: z.url(),
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
  fotos: z
    .object({
      /** Retrato ao lado da apresentação, no topo. */
      retrato: nomeDeArquivo.optional().or(z.literal("")),
      /** Foto mais informal, que dá rosto ao "como eu trabalho". */
      metodo: nomeDeArquivo.optional().or(z.literal("")),
    })
    .default({}),
});

export const grupoDeStackSchema = z.object({
  grupo: textoCurto,
  itens: listaDeTextos,
});

export const principioSchema = z.object({
  titulo: textoCurto,
  texto: textoCurto,
});

export const experienciaSchema = z.object({
  cargo: textoCurto,
  empresa: textoCurto,
  periodo: textoCurto,
  local: textoCurto,
  descricao: textoCurto,
});

export const formacaoSchema = z.object({
  curso: textoCurto,
  instituicao: textoCurto,
  periodo: textoCurto,
});

/** Tudo que não é projeto vive num documento só — é editado junto. */
export const documentoPerfilSchema = z.object({
  perfil: perfilSchema,
  stack: z.array(grupoDeStackSchema).default([]),
  metodo: z.array(principioSchema).default([]),
  experiencia: z.array(experienciaSchema).default([]),
  formacao: z.array(formacaoSchema).default([]),
});

export const documentoProjetosSchema = z.array(projetoSchema);

export type Capa = z.infer<typeof capaSchema>;
export type Projeto = z.infer<typeof projetoSchema>;
export type Perfil = z.infer<typeof perfilSchema>;
export type GrupoDeStack = z.infer<typeof grupoDeStackSchema>;
export type Principio = z.infer<typeof principioSchema>;
export type Experiencia = z.infer<typeof experienciaSchema>;
export type Formacao = z.infer<typeof formacaoSchema>;
export type DocumentoPerfil = z.infer<typeof documentoPerfilSchema>;
export type DocumentoProjetos = z.infer<typeof documentoProjetosSchema>;
