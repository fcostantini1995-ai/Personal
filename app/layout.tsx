import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pasta & Paste · Cassa",
  description: "Contabilità di Pasta & Paste, gastronomia a Pescara.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
