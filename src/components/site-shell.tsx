"use client";

import { usePathname } from "next/navigation";
import { MotionEnhancer } from "@/components/motion-enhancer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <div className="storefront-shell"><MotionEnhancer key={pathname}/><SiteHeader/><div className="page-transition" key={pathname}>{children}</div><SiteFooter/></div>;
}
