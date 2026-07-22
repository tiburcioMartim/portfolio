"use client";

import { useActionState, useState } from "react";

import { salvarPerfil, type Estado } from "../acoes";
import { Area, Aviso, Bloco, Botao, Campo, ListaPorLinha } from "@/components/admin/campos";
import Repetidor from "@/components/admin/Repetidor";
import type { DocumentoPerfil } from "@/data/schema";

/**
 * O documento inteiro vive no estado e é enviado como um JSON só.
 *
 * Campos indexados no HTML (`metodo[2].titulo`) dariam o mesmo resultado com
 * muito mais chance de erro — e o zod valida igual dos dois jeitos, do lado do
 * servidor, que é o que importa.
 */
export default function FormularioDePerfil({ inicial }: { inicial: DocumentoPerfil }) {
  const [documento, setDocumento] = useState(inicial);
  const [estado, acao, salvando] = useActionState<Estado, FormData>(salvarPerfil, undefined);

  function mudarPerfil<K extends keyof DocumentoPerfil["perfil"]>(
    chave: K,
    valor: DocumentoPerfil["perfil"][K],
  ) {
    setDocumento((d) => ({ ...d, perfil: { ...d.perfil, [chave]: valor } }));
  }

  return (
    <form action={acao} className="space-y-6">
      <input type="hidden" name="dados" value={JSON.stringify(documento)} />

      <Bloco titulo="Quem é você" descricao="O que aparece no topo do site e nos metadados.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            rotulo="Nome"
            valor={documento.perfil.nome}
            aoMudar={(v) => mudarPerfil("nome", v)}
            obrigatorio
          />
          <Campo
            rotulo="Papel"
            dica="Aparece acima do nome, em maiúsculas."
            valor={documento.perfil.papel}
            aoMudar={(v) => mudarPerfil("papel", v)}
            obrigatorio
          />
        </div>

        <Campo
          rotulo="Local"
          valor={documento.perfil.local}
          aoMudar={(v) => mudarPerfil("local", v)}
          obrigatorio
        />

        <Area
          rotulo="Resumo"
          dica="Uma frase, sem jargão, que funcione para recrutador e para cliente."
          linhas={3}
          valor={documento.perfil.resumo}
          aoMudar={(v) => mudarPerfil("resumo", v)}
        />
      </Bloco>

      <Bloco titulo="Contato e links">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            rotulo="E-mail"
            tipo="email"
            valor={documento.perfil.email}
            aoMudar={(v) => mudarPerfil("email", v)}
          />
          <Campo
            rotulo="Endereço do site"
            dica="Com https://. Usado no sitemap e nos metadados."
            valor={documento.perfil.site}
            aoMudar={(v) => mudarPerfil("site", v)}
          />
          <Campo
            rotulo="LinkedIn"
            valor={documento.perfil.linkedin}
            aoMudar={(v) => mudarPerfil("linkedin", v)}
          />
          <Campo
            rotulo="GitHub"
            valor={documento.perfil.github}
            aoMudar={(v) => mudarPerfil("github", v)}
          />
        </div>
      </Bloco>

      <Bloco
        titulo="Como você trabalha"
        descricao="Os princípios que aparecem na seção de método."
      >
        <Repetidor
          itens={documento.metodo}
          aoMudar={(metodo) => setDocumento((d) => ({ ...d, metodo }))}
          novo={() => ({ titulo: "", texto: "" })}
          rotuloDoItem={(_, i) => String(i + 1).padStart(2, "0")}
          textoDeAdicionar="adicionar princípio"
          renderizar={(item, atualizar) => (
            <>
              <Campo
                rotulo="Título"
                valor={item.titulo}
                aoMudar={(titulo) => atualizar({ ...item, titulo })}
              />
              <Area
                rotulo="Texto"
                linhas={4}
                valor={item.texto}
                aoMudar={(texto) => atualizar({ ...item, texto })}
              />
            </>
          )}
        />
      </Bloco>

      <Bloco titulo="Ferramentas do dia a dia" descricao="Agrupadas por área.">
        <Repetidor
          itens={documento.stack}
          aoMudar={(stack) => setDocumento((d) => ({ ...d, stack }))}
          novo={() => ({ grupo: "", itens: [] })}
          rotuloDoItem={(item) => item.grupo || "novo grupo"}
          textoDeAdicionar="adicionar grupo"
          renderizar={(item, atualizar) => (
            <>
              <Campo
                rotulo="Grupo"
                placeholder="Backend, Frontend, Infra…"
                valor={item.grupo}
                aoMudar={(grupo) => atualizar({ ...item, grupo })}
              />
              <ListaPorLinha
                rotulo="Ferramentas"
                valores={item.itens}
                aoMudar={(itens) => atualizar({ ...item, itens })}
              />
            </>
          )}
        />
      </Bloco>

      <Bloco titulo="Trajetória" descricao="Do mais recente para o mais antigo.">
        <Repetidor
          itens={documento.experiencia}
          aoMudar={(experiencia) => setDocumento((d) => ({ ...d, experiencia }))}
          novo={() => ({ cargo: "", empresa: "", periodo: "", local: "", descricao: "" })}
          rotuloDoItem={(item) => item.empresa || "nova posição"}
          textoDeAdicionar="adicionar posição"
          renderizar={(item, atualizar) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  rotulo="Cargo"
                  valor={item.cargo}
                  aoMudar={(cargo) => atualizar({ ...item, cargo })}
                />
                <Campo
                  rotulo="Empresa"
                  valor={item.empresa}
                  aoMudar={(empresa) => atualizar({ ...item, empresa })}
                />
                <Campo
                  rotulo="Período"
                  placeholder="mar/2026 — atual"
                  valor={item.periodo}
                  aoMudar={(periodo) => atualizar({ ...item, periodo })}
                />
                <Campo
                  rotulo="Local"
                  placeholder="Rio de Janeiro · presencial"
                  valor={item.local}
                  aoMudar={(local) => atualizar({ ...item, local })}
                />
              </div>
              <Area
                rotulo="Descrição"
                linhas={3}
                valor={item.descricao}
                aoMudar={(descricao) => atualizar({ ...item, descricao })}
              />
            </>
          )}
        />
      </Bloco>

      <Bloco titulo="Formação">
        <Repetidor
          itens={documento.formacao}
          aoMudar={(formacao) => setDocumento((d) => ({ ...d, formacao }))}
          novo={() => ({ curso: "", instituicao: "", periodo: "" })}
          rotuloDoItem={(item) => item.curso || "nova formação"}
          textoDeAdicionar="adicionar formação"
          renderizar={(item, atualizar) => (
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo
                rotulo="Curso"
                valor={item.curso}
                aoMudar={(curso) => atualizar({ ...item, curso })}
              />
              <Campo
                rotulo="Instituição"
                valor={item.instituicao}
                aoMudar={(instituicao) => atualizar({ ...item, instituicao })}
              />
              <Campo
                rotulo="Período"
                valor={item.periodo}
                aoMudar={(periodo) => atualizar({ ...item, periodo })}
              />
            </div>
          )}
        />
      </Bloco>

      {/* Barra fixa: em formulário longo, procurar o botão de salvar no fim da
          página é atrito puro. */}
      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-elevated/95 p-4 backdrop-blur-md">
        <Botao tipo="submit" desabilitado={salvando}>
          {salvando ? "Salvando…" : "Salvar alterações"}
        </Botao>
        <div className="flex-1">
          <Aviso estado={estado} />
        </div>
      </div>
    </form>
  );
}
