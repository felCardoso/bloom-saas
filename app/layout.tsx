import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PwaUpdateBanner } from "@/components/PwaUpdateBanner";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://bloomcrm.com.br",
  ),
  title: {
    default: "Bloom — CRM para Revendedoras de Cosméticos",
    template: "%s — Bloom",
  },
  description:
    "Organize clientes, pedidos, estoque e agenda do seu negócio de cosméticos. CRM simples e bonito feito para revendedoras de Avon, Mary Kay, Natura e mais.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Bloom",
    title: "Bloom — CRM para Revendedoras de Cosméticos",
    description:
      "Organize clientes, pedidos, estoque e agenda do seu negócio de cosméticos. CRM simples e bonito feito para revendedoras.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bloom — CRM para Revendedoras de Cosméticos",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Bloom — CRM para Revendedoras de Cosméticos",
    description:
      "Organize clientes, pedidos, estoque e agenda do seu negócio de cosméticos.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <meta name="apple-mobile-web-app-title" content="Bloom" />
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <PwaUpdateBanner />
      </body>
    </html>
  );
}
