import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Gunpla Sekai",
  description: "Terms of service for Gunpla Sekai",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">
          This page is still in progress. We&apos;re working on creating clear
          terms of service that outline the rules and guidelines for using
          Gunpla Sekai.
        </p>
      </div>
    </div>
  );
}
