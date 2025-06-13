import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nosso Amor - Dia dos Namorados",
  description:
    "Um micro-SaaS romântico para celebrar o amor com fotos e músicas especiais",
  keywords:
    "amor, dia dos namorados, romance, fotos, música, relacionamento",
  openGraph: {
    title: "Nosso Amor - Dia dos Namorados",
    description:
      "Celebrando nosso amor com memórias e músicas especiais",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta name="theme-color" content="#f43f5e" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>"
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-900`}>
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
