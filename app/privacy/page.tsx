import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Gunpla Sekai",
  description: "Privacy policy for Gunpla Sekai",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">
          This page is still in progress. We&apos;re working on creating a
          comprehensive privacy policy that protects your data and explains how
          we use it.
        </p>
      </div>
    </div>
  );
}
