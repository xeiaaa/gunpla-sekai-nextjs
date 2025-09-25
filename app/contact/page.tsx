import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Gunpla Sekai",
  description: "Get in touch with the Gunpla Sekai team",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground">
          This page is still in progress. We're working on setting up contact
          forms and support channels.
        </p>
      </div>
    </div>
  );
}
