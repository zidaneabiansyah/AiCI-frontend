import type { Metadata } from "next";
import { Comfortaa, Inter } from "next/font/google";
import "./globals.css";
import { api } from "@/lib/api";
import PWARegistration from "@/components/PWARegistration";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import SkipToContent from "@/components/SkipToContent";

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
    const siteName = settings.site_name || "AiCI";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aici.id";
    
    return {
      metadataBase: new URL(siteUrl),
      title: {
        template: `%s | ${siteName}`,
        default: `${siteName} - Artificial Intelligence Center Indonesia`,
      },
      description: "Pusat pembelajaran dan riset Artificial Intelligence terkemuka di Indonesia. Bergabunglah dengan program kelas AI, robotika, dan teknologi terkini.",
      keywords: ["AI", "Artificial Intelligence", "Machine Learning", "Robotika", "Kursus AI", "Pendidikan AI", "AICI", "Indonesia"],
      authors: [{ name: siteName }],
      creator: siteName,
      publisher: siteName,
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      icons: {
        icon: "/icon/aici-logo-otak.png",
        apple: "/icon/aici-logo-otak.png",
      },
      manifest: "/manifest.json",
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: siteUrl,
        siteName: siteName,
        title: `${siteName} - Artificial Intelligence Center Indonesia`,
        description: "Pusat pembelajaran dan riset Artificial Intelligence terkemuka di Indonesia",
        images: [
          {
            url: "/icon/aici-logo-otak.png",
            width: 1200,
            height: 630,
            alt: `${siteName} Logo`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${siteName} - Artificial Intelligence Center Indonesia`,
        description: "Pusat pembelajaran dan riset Artificial Intelligence terkemuka di Indonesia",
        images: ["/icon/aici-logo-otak.png"],
        creator: "@aici_id",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      },
    };
  } catch (e) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aici.id";
    return {
      metadataBase: new URL(siteUrl),
      title: {
        template: "%s | Artificial Intelligence Center Indonesia",
        default: "Artificial Intelligence Center Indonesia",
      },
      description: "Pusat pembelajaran dan riset Artificial Intelligence terkemuka di Indonesia",
      icons: {
        icon: "/icon/aici-logo-otak.png",
        apple: "/icon/aici-logo-otak.png",
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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${comfortaa.variable} ${inter.variable} antialiased`}
      >
        <QueryProvider>
          <SkipToContent />
          <PWARegistration />
          <ToastProvider />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
