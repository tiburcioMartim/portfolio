import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O site inteiro é conhecido em tempo de build, então exportamos HTML puro.
  // Na VPS isso vira apenas arquivos servidos pelo nginx: nenhum processo Node
  // rodando ao lado da produção que já existe na máquina.
  output: "export",

  // Sem servidor, não há otimização de imagem sob demanda.
  images: { unoptimized: true },

  // Gera /projetos/index.html em vez de /projetos.html, que é o que o nginx
  // espera servir quando a URL não traz extensão.
  trailingSlash: true,
};

export default nextConfig;
