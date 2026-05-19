import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://bloomcrm.com.br";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/sobre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/suporte`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
