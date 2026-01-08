import type { Metadata } from "next";
import { Comfortaa, Inter } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AiCi ShowCase",
  description: "AiCi ShowCase - Portofolio Anak Anak Didik Artificial Intelligence Center Indonesia",
  icons: {
    icon: "/aici-logo-otak.png",
  },
  manifest: "/manifest.json",
  themeColor: "#255D74",
};

import PWARegistration from "@/components/PWARegistration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${comfortaa.variable} ${inter.variable} antialiased`}
      >
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
