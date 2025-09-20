import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { FooterWrapper } from "@/components/footer-wrapper";
import { ProgressBar } from "@/components/progress-bar";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gunpla Sekai",
  description: "Your ultimate Gunpla collection management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
          <QueryProvider>
            <ProgressBar>
              <Header />
              <main className="flex-1">{children}</main>
              <FooterWrapper />
            </ProgressBar>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
