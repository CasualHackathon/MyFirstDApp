import type React from "react";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Providers } from "@/components/providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { Archivo_Black, Space_Grotesk } from "next/font/google";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "部落排行榜 - 学习勇士",
  description: "游戏化学习应用的部落排名与成员状态",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${space.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="scanlines">
        <Providers session={session}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
