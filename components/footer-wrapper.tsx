"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on customize page and gunpla card builder page
  const shouldHide = pathname === "/customize" || pathname === "/gunpla-card/new";

  return <Footer className={shouldHide ? "customize-page-hidden" : ""} />;
}
