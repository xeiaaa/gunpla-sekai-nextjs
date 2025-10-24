"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on customize page, gunpla card builder page, and maintenance page
  const shouldHide =
    pathname === "/customize" ||
    pathname === "/gunpla-card/new" ||
    pathname === "/maintenance";

  return <Footer className={shouldHide ? "customize-page-hidden" : ""} />;
}
