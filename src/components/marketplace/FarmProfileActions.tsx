"use client";

import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/utils/logger";
import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

const farmActionsLogger = createLogger("FarmProfileActions");

interface FarmProfileActionsProps {
  farmId: string;
  farmName: string;
}

export function FarmProfileActions({
  farmId,
  farmName,
}: FarmProfileActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial favorite status
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const response = await fetch("/api/users/favorites");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const isFarmFavorited = data.data.some(
              (fav: any) => fav.farmId === farmId,
            );
            setIsFavorited(isFarmFavorited);
          }
        }
      } catch (error) {
        farmActionsLogger.error("Failed to load favorite status", error instanceof Error ? error : new Error(String(error)), {
          farmId,
        });
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteStatus();
  }, [farmId]);

  const toggleFavorite = async () => {
    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    try {
      if (isFavorited) {
        // Unfavorite - DELETE request
        const response = await fetch(`/api/users/favorites?farmId=${farmId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to unfavorite farm");
        }
      } else {
        // Favorite - POST request
        const response = await fetch("/api/users/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ farmId }),
        });

        if (!response.ok) {
          throw new Error("Failed to favorite farm");
        }
      }
    } catch (error) {
      farmActionsLogger.error("Failed to toggle favorite", error instanceof Error ? error : new Error(String(error)), {
        farmId,
        action: isFavorited ? "unfavorite" : "favorite",
      });

      // Rollback on error
      setIsFavorited(previousState);

      // Show error to user
      alert("Failed to update favorite. Please try again.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: farmName,
      text: `Check out ${farmName} on our Farmers Market Platform!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      farmActionsLogger.warn("Failed to share farm", {
        farmId,
        farmName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        size="lg"
        variant="outline"
        className="gap-2"
        onClick={toggleFavorite}
        disabled={loading}
      >
        <Heart
          className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
        />
        {isFavorited ? "Saved" : "Save Farm"}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="gap-2"
        onClick={handleShare}
      >
        <Share2 className="h-5 w-5" />
        Share
      </Button>
    </div>
  );
}
