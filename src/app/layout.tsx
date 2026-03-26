import type { Metadata, Viewport } from "next";
import { PaletteProvider } from "@/lib/PaletteContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chief of Staff for Creatives",
  description: "A clarity tool for creatives who have too many ideas and not enough hours.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chief of Staff",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e8e4e0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Ibarra+Real+Nova:ital,wght@0,400;0,700;1,400&family=Roboto+Mono:wght@400;500&family=Libre+Franklin:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <PaletteProvider>
          {children}
        </PaletteProvider>
      </body>
    </html>
  );
}
