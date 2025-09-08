import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";

const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Öğrenci Takip Uygulaması",
  description: "Yatılı öğrenci kurumları için puan sistemli takip uygulaması",
  viewport: "width=device-width, initial-scale=1",
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
        {children}
      </body>
    </html>
  );
}
