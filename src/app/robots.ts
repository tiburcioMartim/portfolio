import type { MetadataRoute } from "next";

import { lerPerfil } from "@/lib/conteudo";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { perfil } = await lerPerfil();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // O admin não tem por que aparecer em buscador. Não é proteção — quem
      // protege é o login —, é só não anunciar a porta.
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${perfil.site}/sitemap.xml`,
  };
}
