"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DomeGallery from "@/components/ui/dome-gallery";
import { Button } from "@/components/ui/button";
import { Palette, ArrowLeft } from "lucide-react";

interface GunplaCard {
  id: string;
  src: string;
  alt: string;
  kitName: string;
  kitSlug: string;
  createdAt: string;
  originalFilename: string;
}

interface UserGunplaCardsData {
  user: {
    id: string;
    username: string;
  };
  cards: GunplaCard[];
}

export default function UserGunplaCardsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const [data, setData] = useState<UserGunplaCardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const username = params.username as string;

  // Check if current user is viewing their own page
  const isOwnPage = currentUser?.username === username;

  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${encodeURIComponent(username)}/gunpla-cards`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load gunpla cards");
          }
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching user gunpla cards:", err);
        setError("Failed to load gunpla cards");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserCards();
    }
  }, [username]);

  const handleCreateCard = () => {
    router.push("/gunpla-card/new");
  };

  const handleBackToProfile = () => {
    router.push(`/users/${username}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gunpla cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleBackToProfile} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Empty state
  if (data.cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Palette className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {isOwnPage ? "No Gunpla Cards Yet" : `${data.user.username} hasn't created any gunpla cards yet`}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isOwnPage
              ? "Create your first custom gunpla card by selecting images and arranging them into a unique design."
              : "This user hasn't created any custom gunpla cards yet."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleBackToProfile} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            {isOwnPage && (
              <Button onClick={handleCreateCard}>
                <Palette className="h-4 w-4 mr-2" />
                Create Your First Card
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Convert cards to images format for DomeGallery
  const images = data.cards.map(card => ({
    src: card.src,
    alt: `${card.kitName} - ${card.originalFilename}`
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToProfile}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {data.user.username}&apos;s Profile
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isOwnPage ? "My Gunpla Cards" : `${data.user.username}&apos;s Gunpla Cards`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {data.cards.length} card{data.cards.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {isOwnPage && (
              <Button onClick={handleCreateCard}>
                <Palette className="h-4 w-4 mr-2" />
                Create New Card
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dome Gallery */}
      <div style={{ width: '100vw', height: 'calc(100vh - 80px)' }}>
        <DomeGallery
          images={images}
          grayscale={false}
          imageBorderRadius="12px"
          openedImageBorderRadius="12px"
          openedImageWidth="600px"
          openedImageHeight="600px"
        />
      </div>
    </div>
  );
}
