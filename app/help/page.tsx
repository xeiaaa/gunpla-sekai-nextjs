import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help - Gunpla Sekai",
  description: "Get help and support for using Gunpla Sekai",
};

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Help</h1>
        <p className="text-muted-foreground">
          This page is still in progress. We're working on creating
          comprehensive help documentation and support resources.
        </p>
      </div>
    </div>
  );
}
