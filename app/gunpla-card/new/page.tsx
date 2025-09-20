"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, Suspense } from "react";
import { CardBuilderProvider } from "@/gunpla-card/context";
import { CardBuilder } from "@/gunpla-card/components/CardBuilder";

function NewGunplaCardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const kitSlug = searchParams.get("kit");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="mx-auto h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <CardBuilderProvider kitSlug={kitSlug}>
      <div className="mx-auto h-[calc(100vh-64px)]">
        <CardBuilder />
      </div>
    </CardBuilderProvider>
  );
}

export default function NewGunplaCardPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <NewGunplaCardPageContent />
    </Suspense>
  );
}


