import { ImageResponse } from "next/og";
import { perfil } from "@/data/perfil";

// Exigido pelo `output: export`: a imagem é gerada uma vez, no build.
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${perfil.nome} — ${perfil.papel}`;

/** Cartão que aparece ao compartilhar o link no LinkedIn e no WhatsApp. */
export default function Image() {
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
          <div style={{ fontSize: 26, color: "#6b7681", letterSpacing: 4, textTransform: "uppercase" }}>
            {perfil.papel}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, color: "#e9ecf1", fontWeight: 600, letterSpacing: -2 }}>
            {perfil.nome}
          </div>
          <div style={{ fontSize: 34, color: "#98a2b0", marginTop: 24, maxWidth: 900, lineHeight: 1.4 }}>
            {perfil.resumo}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#6b7681" }}>
          martimtiburciodev.com.br
        </div>
      </div>
    ),
    size,
  );
}
