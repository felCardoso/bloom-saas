import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://bloomcrm.com.br";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sobre", "/suporte", "/termos", "/privacidade", "/login", "/registro", "/recuperar-senha"],
      disallow: ["/dashboard", "/clientes", "/pedidos", "/produtos", "/agenda", "/relatorios", "/configuracoes", "/pricing", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
