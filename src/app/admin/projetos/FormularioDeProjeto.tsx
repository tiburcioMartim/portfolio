"use client";

import { useActionState, useState } from "react";

import { salvarProjeto, type Estado } from "../acoes";
import {
  Area,
  Aviso,
  Bloco,
  Botao,
  Caixa,
  Campo,
  ListaPorLinha,
  Selecao,
} from "@/components/admin/campos";
import Repetidor from "@/components/admin/Repetidor";
import type { Projeto } from "@/data/schema";

const TIPOS = ["Trabalho", "Cliente", "Produto próprio", "Open source"] as const;

/** Gera o endereço a partir do nome, para não ter que pensar nele. */
function comoEndereco(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function FormularioDeProjeto({
  inicial,
  novo = false,
}: {
  inicial: Projeto;
  novo?: boolean;
}) {
  const [projeto, setProjeto] = useState(inicial);
  const [estado, acao, salvando] = useActionState<Estado, FormData>(salvarProjeto, undefined);

  // Num projeto novo o endereço acompanha o nome; num já existente ele está
  // congelado, porque mudar significa mudar a URL de algo que já circula.
  const [seguirNome, setSeguirNome] = useState(novo);

  function mudar<K extends keyof Projeto>(chave: K, valor: Projeto[K]) {
    setProjeto((p) => ({ ...p, [chave]: valor }));
  }

  return (
    <form action={acao} className="space-y-6">
      <input type="hidden" name="dados" value={JSON.stringify(projeto)} />
      <input type="hidden" name="slugOriginal" value={inicial.slug} />

      <Bloco titulo="Identificação">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            rotulo="Nome"
            valor={projeto.nome}
            obrigatorio
            aoMudar={(nome) => {
              mudar("nome", nome);
              if (seguirNome) mudar("slug", comoEndereco(nome));
            }}
          />
          <Campo
            rotulo="Endereço"
            dica="Identificador interno, só letras minúsculas e hífen."
            valor={projeto.slug}
            obrigatorio
            aoMudar={(slug) => {
              setSeguirNome(false);
              mudar("slug", slug);
            }}
          />
          <Selecao
            rotulo="Tipo"
            valor={projeto.tipo}
            opcoes={TIPOS}
            aoMudar={(tipo) => mudar("tipo", tipo)}
          />
          <Campo
            rotulo="Período"
            placeholder="2026 · MIT"
            valor={projeto.periodo}
            aoMudar={(periodo) => mudar("periodo", periodo)}
          />
        </div>

        <Campo
          rotulo="Chamada"
          dica="Uma linha que alguém de fora da área entenda."
          valor={projeto.tagline}
          aoMudar={(tagline) => mudar("tagline", tagline)}
        />
      </Bloco>

      <Bloco
        titulo="A história"
        descricao="O formato que o site usa: qual era o problema, e o que você fez."
      >
        <Area
          rotulo="O problema"
          linhas={5}
          valor={projeto.problema}
          aoMudar={(problema) => mudar("problema", problema)}
        />
        <Area
          rotulo="O que eu fiz"
          linhas={5}
          valor={projeto.solucao}
          aoMudar={(solucao) => mudar("solucao", solucao)}
        />
        <ListaPorLinha
          rotulo="Entregas"
          dica="Uma por linha. O que existe e funciona, não o que estava planejado."
          linhas={7}
          valores={projeto.destaques}
          aoMudar={(destaques) => mudar("destaques", destaques)}
        />
      </Bloco>

      <Bloco
        titulo="Números"
        descricao="Aparecem em destaque no card. Medidos, não estimados."
      >
        <Repetidor
          itens={projeto.numeros}
          aoMudar={(numeros) => mudar("numeros", numeros)}
          novo={() => ({ valor: "", label: "" })}
          rotuloDoItem={(item) => item.valor || "novo número"}
          textoDeAdicionar="adicionar número"
          vazio="Nenhum número. O card simplesmente não mostra a faixa."
          renderizar={(item, atualizar) => (
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <Campo
                rotulo="Valor"
                placeholder="642"
                valor={item.valor}
                aoMudar={(valor) => atualizar({ ...item, valor })}
              />
              <Campo
                rotulo="Legenda"
                placeholder="testes automatizados"
                valor={item.label}
                aoMudar={(label) => atualizar({ ...item, label })}
              />
            </div>
          )}
        />
      </Bloco>

      <Bloco titulo="Stack e link">
        <ListaPorLinha
          rotulo="Tecnologias"
          valores={projeto.stack}
          aoMudar={(stack) => mudar("stack", stack)}
        />

        <Caixa
          rotulo="Código fechado"
          dica="Mostra o aviso 'código fechado' no rodapé do card."
          marcado={projeto.codigoFechado}
          aoMudar={(codigoFechado) => mudar("codigoFechado", codigoFechado)}
        />

        <Caixa
          rotulo="Tem link público"
          dica="Repositório, site no ar, loja — o que der para abrir."
          marcado={Boolean(projeto.link)}
          aoMudar={(tem) =>
            mudar("link", tem ? { href: "", rotulo: "Ver projeto" } : undefined)
          }
        />

        {projeto.link ? (
          <div className="grid gap-4 rounded-lg border border-line bg-bg p-4 sm:grid-cols-2">
            <Campo
              rotulo="Endereço"
              placeholder="https://exemplo.com.br"
              valor={projeto.link.href}
              aoMudar={(href) => mudar("link", { ...projeto.link!, href })}
            />
            <Campo
              rotulo="Texto do link"
              placeholder="Ver no GitHub"
              valor={projeto.link.rotulo}
              aoMudar={(rotulo) => mudar("link", { ...projeto.link!, rotulo })}
            />
          </div>
        ) : null}

        <Caixa
          rotulo="Publicado"
          dica="Desmarcado, o projeto some do site mas continua guardado aqui."
          marcado={projeto.publicado}
          aoMudar={(publicado) => mudar("publicado", publicado)}
        />
      </Bloco>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-elevated/95 p-4 backdrop-blur-md">
        <Botao tipo="submit" desabilitado={salvando}>
          {salvando ? "Salvando…" : novo ? "Criar projeto" : "Salvar alterações"}
        </Botao>
        <div className="flex-1">
          <Aviso estado={estado} />
        </div>
      </div>
    </form>
  );
}
