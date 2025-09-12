import type { Metadata, Viewport } from "next";
import { Spline_Sans } from "next/font/google";
import { Providers } from "../components/providers";
import PWAInstallPrompt from "../components/ui/pwa-install-prompt";
import "./globals.css";

const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ARDN - Öğrenci Takip Sistemi",
  description: "Yatılı öğrenci kurumları için puan sistemli takip uygulaması",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ARDN",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#38e07b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${splineSans.variable} font-sans antialiased bg-background text-text-primary min-h-screen`}
      >
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
