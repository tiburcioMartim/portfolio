import type { MetadataRoute } from "next";

import { lerPerfil } from "@/lib/conteudo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { perfil } = await lerPerfil();

  return [
    {
      url: `${perfil.site}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
