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

// Sync hydration script — runs before paint. Reads localStorage and applies
// dark class + data-primary on <html> to prevent FOUC. Matches the
// route-gating logic in lib/theme-context.tsx (data-primary only on dashboard
// routes; landing/auth/public stay rose).
const themeBootstrap = `(function(){try{
  var t=localStorage.getItem('bloom-theme');
  if(t==='dark')document.documentElement.classList.add('dark');
  var c=localStorage.getItem('bloom-primary');
  if(c&&c!=='rose'){
    var p=location.pathname;
    var dash=['/dashboard','/clientes','/pedidos','/produtos','/agenda','/mensagens','/relatorios','/configuracoes','/pricing','/feedback'];
    for(var i=0;i<dash.length;i++){
      if(p===dash[i]||p.indexOf(dash[i]+'/')===0){
        document.documentElement.setAttribute('data-primary',c);
        break;
      }
    }
  }
}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Bloom" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <PwaUpdateBanner />
      </body>
    </html>
  );
}
