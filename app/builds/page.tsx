import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Builds - Gunpla Sekai",
  description: "Browse and discover Gunpla builds from the community",
};

export default function BuildsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Builds</h1>
        <p className="text-muted-foreground">
          This page is still in progress. We&apos;re working on bringing you a
          comprehensive view of all community builds.
        </p>
      </div>
    </div>
  );
}
