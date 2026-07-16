import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Borrel 34 Wrapped",
  description:
    "De 34e editie van de Kopstoot Kompanen — de pre-borrel enquête, gewrapt. Lange mensen, gekke antwoorden.",
  openGraph: {
    title: "Borrel 34 Wrapped",
    description: "Lange mensen, gekke antwoorden. Tot vrijdag 17 juli!",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0510",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
