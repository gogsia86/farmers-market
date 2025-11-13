"use client";

import { Button } from "@/components/ui/button";

export function ExploreButton() {
  return (
    <Button
      size="lg"
      className="bg-primary-600 hover:bg-primary-700"
      onClick={() => {
        document.getElementById("featured-products")?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      Explore Products
    </Button>
  );
}
