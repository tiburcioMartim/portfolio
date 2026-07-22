"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";

import { enviarFotoDoPerfil, removerFotoDoPerfil, type Estado } from "../acoes";
import { Aviso, Botao } from "@/components/admin/campos";

/**
 * Envio de uma das fotos do site.
 *
 * A imagem é redimensionada e convertida para WebP no servidor, então não
 * precisa se preocupar com o tamanho do arquivo: pode mandar direto da câmera.
 */
export default function GerenciadorDeFoto({
  posicao,
  titulo,
  descricao,
  arquivo,
  proporcao,
}: {
  posicao: "retrato" | "metodo";
  titulo: string;
  descricao: string;
  arquivo?: string;
  proporcao: string;
}) {
  const [estado, acaoDeEnvio, enviando] = useActionState<Estado, FormData>(
    enviarFotoDoPerfil,
    undefined,
  );
  const [estadoDaRemocao, acaoDeRemocao, removendo] = useActionState<Estado, FormData>(
    removerFotoDoPerfil,
    undefined,
  );

  const entrada = useRef<HTMLInputElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const [nomeEscolhido, setNomeEscolhido] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-line bg-bg p-4">
      <h3 className="text-sm font-medium text-ink">{titulo}</h3>
      <p className="mt-1 text-xs text-faint">{descricao}</p>

      <div className="mt-4 flex flex-wrap items-start gap-5">
        <div
          className="relative w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-inset"
          style={{ aspectRatio: proporcao }}
        >
          {arquivo ? (
            <Image
              src={`/uploads/${arquivo}`}
              alt={titulo}
              fill
              sizes="8rem"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-faint">
              sem foto
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <form ref={formulario} action={acaoDeEnvio} className="space-y-3">
            <input type="hidden" name="posicao" value={posicao} />
            <input
              ref={entrada}
              type="file"
              name="arquivo"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                setNomeEscolhido(e.target.files?.[0]?.name ?? null);
                // Enviar assim que a imagem é escolhida: um segundo clique em
                // "enviar" não acrescentaria decisão nenhuma.
                formulario.current?.requestSubmit();
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Botao
                variante="neutro"
                aoClicar={() => entrada.current?.click()}
                desabilitado={enviando}
              >
                {enviando ? "Enviando…" : arquivo ? "Trocar foto" : "Escolher foto"}
              </Botao>

              {arquivo ? null : (
                <span className="text-xs text-faint">JPEG, PNG, WebP ou AVIF · até 12 MB</span>
              )}
            </div>

            {nomeEscolhido && enviando ? (
              <p className="truncate font-mono text-xs text-faint">{nomeEscolhido}</p>
            ) : null}
          </form>

          {arquivo ? (
            <form action={acaoDeRemocao}>
              <input type="hidden" name="posicao" value={posicao} />
              <Botao tipo="submit" variante="perigo" desabilitado={removendo}>
                {removendo ? "Removendo…" : "Remover"}
              </Botao>
            </form>
          ) : null}

          <Aviso estado={estado ?? estadoDaRemocao} />
        </div>
      </div>
    </div>
  );
}
