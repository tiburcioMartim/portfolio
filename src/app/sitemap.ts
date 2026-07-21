import type { MetadataRoute } from "next";
import { perfil } from "@/data/perfil";

// Exigido pelo `output: export`: gerado uma vez, no build.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${perfil.site}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
