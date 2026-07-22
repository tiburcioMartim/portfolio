"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";

import { definirOrigemDaCapa, enviarCapa, removerCapa, type Estado } from "../acoes";
import { Aviso, Botao, Campo, Selecao } from "@/components/admin/campos";
import type { Capa } from "@/data/schema";

const MODOS = ["nenhuma", "enviada", "automatica"] as const;

const EXPLICACAO: Record<Capa["modo"], string> = {
  nenhuma: "O card aparece sem imagem. É o certo para sistema interno que não pode ser mostrado.",
  enviada: "Você escolhe a imagem. Use para o que é privado ou depende de autorização.",
  automatica:
    "Um robô fotografa o endereço abaixo e atualiza a capa sozinho. Só funciona para site público.",
};

export default function GerenciadorDeCapa({ slug, capa }: { slug: string; capa: Capa }) {
  const [estadoDoEnvio, acaoDeEnvio, enviando] = useActionState<Estado, FormData>(
    enviarCapa,
    undefined,
  );
  const [estadoDaOrigem, acaoDaOrigem, salvandoOrigem] = useActionState<Estado, FormData>(
    definirOrigemDaCapa,
    undefined,
  );

  const entrada = useRef<HTMLInputElement>(null);
  const formularioDeEnvio = useRef<HTMLFormElement>(null);

  const [modo, setModo] = useState<Capa["modo"]>(capa.modo);
  const [urlOrigem, setUrlOrigem] = useState(capa.urlOrigem ?? "");

  return (
    <section className="rounded-xl border border-line bg-elevated p-6">
      <h2 className="text-base font-semibold text-ink">Capa</h2>
      <p className="mt-1 text-sm text-muted">
        A imagem que abre o card do projeto no site.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-inset">
            {capa.arquivo ? (
              <Image
                src={`/uploads/${capa.arquivo}`}
                alt="Capa atual"
                fill
                sizes="18rem"
                className="object-cover object-top"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-faint">
                sem capa
              </span>
            )}
          </div>

          {capa.capturadaEm ? (
            <p className="mt-2 font-mono text-xs text-faint">
              capturada em {new Date(capa.capturadaEm).toLocaleString("pt-BR")}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <form ref={formularioDeEnvio} action={acaoDeEnvio}>
              <input type="hidden" name="slug" value={slug} />
              <input
                ref={entrada}
                type="file"
                name="arquivo"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={() => formularioDeEnvio.current?.requestSubmit()}
              />
              <Botao
                variante="neutro"
                desabilitado={enviando}
                aoClicar={() => entrada.current?.click()}
              >
                {enviando ? "Enviando…" : capa.arquivo ? "Trocar imagem" : "Enviar imagem"}
              </Botao>
            </form>

            {capa.arquivo ? (
              <form action={removerCapa}>
                <input type="hidden" name="slug" value={slug} />
                <Botao tipo="submit" variante="perigo">
                  Remover
                </Botao>
              </form>
            ) : null}
          </div>

          <div className="mt-3">
            <Aviso estado={estadoDoEnvio} />
          </div>
        </div>

        <form action={acaoDaOrigem} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />

          <Selecao
            rotulo="De onde vem a capa"
            valor={modo}
            opcoes={MODOS}
            aoMudar={setModo}
            dica={EXPLICACAO[modo]}
          />
          {/* O select controla o estado local; o valor enviado vai aqui. */}
          <input type="hidden" name="modo" value={modo} />

          {modo === "automatica" ? (
            <Campo
              rotulo="Endereço a fotografar"
              dica="A página pública do sistema. Precisa abrir sem login."
              placeholder="https://saqualocal.com.br"
              valor={urlOrigem}
              aoMudar={setUrlOrigem}
            />
          ) : null}
          <input type="hidden" name="urlOrigem" value={urlOrigem} />

          <div className="flex flex-wrap items-center gap-3">
            <Botao tipo="submit" variante="neutro" desabilitado={salvandoOrigem}>
              {salvandoOrigem ? "Salvando…" : "Salvar origem"}
            </Botao>
            <div className="flex-1">
              <Aviso estado={estadoDaOrigem} />
            </div>
          </div>

          {modo === "automatica" ? (
            <p className="rounded-md border border-line bg-bg p-3 text-xs leading-relaxed text-faint">
              A captura roda pelo <span className="font-mono">npm run capturar</span> ou pela
              rotina semanal no GitHub — nunca dentro da VPS, para não disputar memória com a
              produção que já vive lá.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
