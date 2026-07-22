import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O site deixou de ser HTML puro quando ganhou área administrativa: login e
  // gravação de conteúdo precisam de servidor. `standalone` empacota o que roda
  // em produção junto das dependências necessárias, então a VPS recebe uma
  // pasta pronta e não precisa de `npm install` a cada publicação.
  output: "standalone",

  images: {
    // As fotos já chegam redimensionadas e em WebP pelo próprio admin. Otimizar
    // de novo a cada visita gastaria CPU da VPS — compartilhada com produção de
    // cliente — para refazer um trabalho que já foi feito no envio.
    unoptimized: true,
  },

  experimental: {
    serverActions: {
      // O padrão é 1 MB, o que reprova qualquer foto vinda de celular.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
