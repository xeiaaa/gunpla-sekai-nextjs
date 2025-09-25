import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Gunpla Sekai",
  description: "Frequently asked questions about Gunpla Sekai",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          This page is still in progress. We're working on compiling the most
          common questions and answers about Gunpla Sekai.
        </p>
      </div>
    </div>
  );
}
