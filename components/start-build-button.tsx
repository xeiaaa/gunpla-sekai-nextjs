"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Hammer, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { StartBuildDialog } from "./start-build-dialog";

interface StartBuildButtonProps {
  kit: {
    id: string;
    name: string;
    slug: string | null;
    productLine?: {
      name: string;
      grade?: {
        name: string;
      } | null;
    } | null;
  };
}

export default function StartBuildButton({ kit }: StartBuildButtonProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Hammer className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Start a Build</h3>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to document your {kit.name} build progress
            </p>
            <Button
              onClick={() => router.push("/sign-in")}
              className="mt-4"
              variant="outline"
            >
              Sign In to Start Build
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <Hammer className="mx-auto h-12 w-12 text-blue-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Start a Build</h3>
          <p className="mt-1 text-sm text-gray-500">
            Document your {kit.name} build progress with milestones and images
          </p>
          <StartBuildDialog kit={kit}>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Start a Build
            </Button>
          </StartBuildDialog>
        </div>
      </CardContent>
    </Card>
  );
}
