import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart-context";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "E&H Fabrics — Wear Elegance. Live in Style.", template: "%s | E&H Fabrics" },
  description: "Discover thoughtfully selected ladies' suits and premium fabric collections at E&H Fabrics.",
  applicationName: "E&H Fabrics",
  icons: { icon: "/brand/eh-fabrics-icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}><body><CartProvider><SiteShell>{children}</SiteShell></CartProvider></body></html>;
}
