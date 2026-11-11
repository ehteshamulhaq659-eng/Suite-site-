import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-context";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "E&H Fabrics — Wear Elegance. Live in Style.", template: "%s | E&H Fabrics" },
  description: "Discover thoughtfully selected ladies' suits and premium fabric collections at E&H Fabrics.",
  applicationName: "E&H Fabrics",
  icons: { icon: "/brand/eh-fabrics-icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><SiteShell>{children}</SiteShell></CartProvider></body></html>;
}
