import type { MetadataRoute } from "next";
import { perfil } from "@/data/perfil";

// Exigido pelo `output: export`: gerado uma vez, no build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${perfil.site}/sitemap.xml`,
  };
}
