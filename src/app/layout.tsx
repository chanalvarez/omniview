import { Sidebar } from "@/components/Sidebar";
import { PortfolioEntitiesProvider } from "@/context/portfolio-entities-context";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OmniView — Executive Dashboard",
  description: "Multi-business portfolio command center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <div className="ov-canvas" aria-hidden />
        <PortfolioEntitiesProvider>
          <div className="relative z-[1] flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
          </div>
        </PortfolioEntitiesProvider>
      </body>
    </html>
  );
}
