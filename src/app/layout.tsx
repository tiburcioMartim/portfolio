import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { lerPerfil } from "@/lib/conteudo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Os metadados saem do conteúdo editável, então trocar o resumo no admin muda
 * também o título da aba e o texto que o LinkedIn mostra — sem republicar.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { perfil } = await lerPerfil();

  return {
    metadataBase: new URL(perfil.site),
    title: `${perfil.nome} — ${perfil.papel}`,
    description: perfil.resumo,
    keywords: [
      "desenvolvedor full stack",
      "Laravel",
      "Vue.js",
      "PHP",
      "Rio de Janeiro",
      "Saquarema",
    ],
    authors: [{ name: perfil.nome, url: perfil.linkedin }],
    alternates: { canonical: "/" },
    openGraph: {
      title: `${perfil.nome} — ${perfil.papel}`,
      description: perfil.resumo,
      url: "/",
      siteName: perfil.nome,
      locale: "pt_BR",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${perfil.nome} — ${perfil.papel}`,
      description: perfil.resumo,
    },
  };
}

/**
 * Aplica o tema salvo antes da primeira pintura. Sem isso, quem escolheu o tema
 * claro vê um flash escuro a cada carregamento.
 */
const scriptTema = `
(function () {
  try {
    var salvo = localStorage.getItem('tema');
    if (salvo === 'claro') document.documentElement.classList.add('light');
    if (salvo === 'escuro') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
