"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on customize page
  const shouldHide = pathname === "/customize";

  return <Footer className={shouldHide ? "customize-page-hidden" : ""} />;
}
