"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function HeaderWrapper() {
  const pathname = usePathname();

  // Hide header on maintenance page
  const shouldHide = pathname === "/maintenance";

  if (shouldHide) {
    return null;
  }

  return <Header />;
}
