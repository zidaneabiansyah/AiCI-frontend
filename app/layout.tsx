import type { Metadata } from "next";
import { Comfortaa, Inter } from "next/font/google";
import "./globals.css";
import { api } from "@/lib/api";
import PWARegistration from "@/components/PWARegistration";

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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await api.content.settings();
    return {
      title: {
        template: `%s | ${settings.site_name || "AiCI"}`,
        default: settings.site_name || "AiCI - Artificial Intelligence Center Indonesia",
      },
      description: "Artificial Intelligence Center Indonesia Gd. Laboratorium Riset Multidisiplin Pertamina FMIPA UI Lt. 4, Universitas Indonesia.",
      icons: {
        icon: "/icon/aici-logo-otak.png",
      },
      manifest: "/manifest.json",
    };
  } catch (e) {
    return {
      title: {
        template: "%s | Artificial Intelligence Center Indonesia",
        default: "Artificial Intelligence Center Indonesia",
      },
      description: "Artificial Intelligence Center Indonesia Gd. Laboratorium Riset Multidisiplin Pertamina FMIPA UI Lt. 4, Universitas Indonesia.",
      icons: {
        icon: "/icon/aici-logo-otak.png",
      },
      manifest: "/manifest.json",
    };
  }
}

export const viewport = {
  themeColor: "#255D74",
};

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
