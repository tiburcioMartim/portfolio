import { ImageResponse } from "next/og";

import { lerPerfil } from "@/lib/conteudo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Cartão de compartilhamento do portfólio";

/**
 * Regerado no máximo uma vez por hora. Acompanha o conteúdo editado sem gastar
 * CPU desenhando um PNG a cada visita de crawler.
 */
export const revalidate = 3600;

/**
 * Cartão que aparece ao compartilhar o link no LinkedIn e no WhatsApp.
 *
 * É gerado a cada pedido a partir do conteúdo atual, então mudar seu nome ou
 * resumo pelo admin já reflete no cartão — sem precisar publicar de novo.
 */
export default async function Image() {
  const { perfil } = await lerPerfil();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0d10",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#e8a33d" }} />
          <div
            style={{
              fontSize: 26,
              color: "#6b7681",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {perfil.papel}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, color: "#e9ecf1", fontWeight: 600, letterSpacing: -2 }}>
            {perfil.nome}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#98a2b0",
              marginTop: 24,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {perfil.resumo}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#6b7681" }}>
          {perfil.site.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size,
  );
}
