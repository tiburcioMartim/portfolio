import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { perfil } from "@/data/perfil";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// TODO: quando o domínio estiver registrado, definir metadataBase e a imagem
// de compartilhamento (opengraph-image.tsx) para os links no LinkedIn/WhatsApp.
export const metadata: Metadata = {
  title: `${perfil.nome} — ${perfil.papel}`,
  description: perfil.resumo,
  keywords: ["desenvolvedor full stack", "Laravel", "Vue.js", "PHP", "Rio de Janeiro", "Saquarema"],
  authors: [{ name: perfil.nome, url: perfil.linkedin }],
  openGraph: {
    title: `${perfil.nome} — ${perfil.papel}`,
    description: perfil.resumo,
    locale: "pt_BR",
    type: "profile",
  },
};

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
