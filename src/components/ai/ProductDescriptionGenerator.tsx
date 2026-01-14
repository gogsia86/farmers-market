"use client";

/**
 * 🤖 PRODUCT DESCRIPTION GENERATOR
 * AI-powered product description generation with preview and editing
 *
 * Features:
 * - Form inputs for product details
 * - Tone and length customization
 * - Real-time generation with loading states
 * - Editable preview with copy/apply
 * - SEO metadata display
 * - Cost and confidence indicators
 *
 * @module components/ai/ProductDescriptionGenerator
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface ProductDescriptionGeneratorProps {
  productName?: string;
  category?: string;
  farmName?: string;
  onApply?: (description: ProductDescription) => void;
  className?: string;
}

export interface ProductDescription {
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoMetaDescription: string;
  suggestedTags: string[];
  wordCount: number;
  confidence: number;
}

interface GenerationMetadata {
  model: string;
  tokensUsed: number;
  requestId: string;
  processingTime: number;
}

// ============================================================================
// Component
// ============================================================================

export function ProductDescriptionGenerator({
  productName: initialProductName = "",
  category: initialCategory = "",
  farmName: initialFarmName = "",
  onApply,
  className = "",
}: ProductDescriptionGeneratorProps) {
  // Form state
  const [productName, setProductName] = useState(initialProductName);
  const [category, setCategory] = useState(initialCategory);
  const [farmName, setFarmName] = useState(initialFarmName);
  const [variety, setVariety] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [culinaryUses, setCulinaryUses] = useState("");
  const [storageInstructions, setStorageInstructions] = useState("");
  const [nutritionalHighlights, setNutritionalHighlights] = useState("");
  const [tone, setTone] = useState<string>("casual");
  const [length, setLength] = useState<string>("medium");
  const [farmingPractices, setFarmingPractices] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [includeKeywords, setIncludeKeywords] = useState("");

  // Result state
  const [result, setResult] = useState<ProductDescription | null>(null);
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleGenerate = async () => {
    if (!productName.trim() || !category.trim()) {
      toast.error("Please provide at least product name and category");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          category: category.trim(),
          farmName: farmName.trim() || undefined,
          variety: variety.trim() || undefined,
          harvestDate: harvestDate.trim() || undefined,
          flavorProfile: flavorProfile.trim() || undefined,
          culinaryUses: culinaryUses.trim() || undefined,
          storageInstructions: storageInstructions.trim() || undefined,
          nutritionalHighlights: nutritionalHighlights.trim() || undefined,
          tone,
          length,
          farmingPractices:
            farmingPractices.length > 0 ? farmingPractices : undefined,
          certifications:
            certifications.length > 0 ? certifications : undefined,
          includeKeywords: includeKeywords
            ? includeKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message || "Failed to generate description",
        );
      }

      setResult(data.data);
      setMetadata(data.metadata);
      setEditedDescription(data.data.description);

      toast.success("Description generated successfully!", {
        description: `Confidence: ${(data.data.confidence * 100).toFixed(0)}% • ${data.data.wordCount} words`,
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error("Failed to generate description", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!editedDescription) return;
    navigator.clipboard.writeText(editedDescription);
    toast.success("Copied to clipboard!");
  };

  const handleApply = () => {
    if (!result) return;

    const finalResult = {
      ...result,
      description: editedDescription,
    };

    onApply?.(finalResult);
    toast.success("Description applied!");
  };

  const handleReset = () => {
    setResult(null);
    setMetadata(null);
    setEditedDescription("");
  };

  const togglePractice = (practice: string) => {
    setFarmingPractices((prev) =>
      prev.includes(practice)
        ? prev.filter((p) => p !== practice)
        : [...prev, practice],
    );
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Product Description Generator
          </CardTitle>
          <CardDescription>
            Generate compelling, SEO-optimized product descriptions using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="e.g., Heirloom Tomatoes"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category"
                placeholder="e.g., Vegetables"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmName">Farm Name</Label>
              <Input
                id="farmName"
                placeholder="e.g., Green Valley Farm"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                placeholder="e.g., Cherokee Purple"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
              />
            </div>
          </div>

          {/* Detailed Info */}
          <div className="space-y-2">
            <Label htmlFor="flavorProfile">Flavor Profile</Label>
            <Textarea
              id="flavorProfile"
              placeholder="Describe the taste, texture, and aroma..."
              value={flavorProfile}
              onChange={(e) => setFlavorProfile(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="culinaryUses">Culinary Uses</Label>
              <Textarea
                id="culinaryUses"
                placeholder="How to use in cooking..."
                value={culinaryUses}
                onChange={(e) => setCulinaryUses(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageInstructions">Storage Instructions</Label>
              <Textarea
                id="storageInstructions"
                placeholder="How to store and preserve..."
                value={storageInstructions}
                onChange={(e) => setStorageInstructions(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Practices & Certifications */}
          <div className="space-y-2">
            <Label>Farming Practices</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "ORGANIC",
                "CONVENTIONAL",
                "PERMACULTURE",
                "HYDROPONIC",
                "REGENERATIVE",
              ].map((practice) => (
                <Button
                  key={practice}
                  type="button"
                  variant={
                    farmingPractices.includes(practice) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => togglePractice(practice)}
                >
                  {practice}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex flex-wrap gap-2">
              {["ORGANIC", "NON_GMO", "BIODYNAMIC", "FAIR_TRADE"].map(
                (cert) => (
                  <Button
                    key={cert}
                    type="button"
                    variant={
                      certifications.includes(cert) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleCertification(cert)}
                  >
                    {cert.replace("_", " ")}
                  </Button>
                ),
              )}
            </div>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (50-100 words)</SelectItem>
                  <SelectItem value="medium">Medium (150-250 words)</SelectItem>
                  <SelectItem value="long">Long (300-500 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="fresh, organic, local"
                value={includeKeywords}
                onChange={(e) => setIncludeKeywords(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !productName.trim() || !category.trim()}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Generate Description
              </>
            )}
          </Button>
          {result && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Description</span>
              <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="text-lg">📊</span>
                  Confidence: {(result.confidence * 100).toFixed(0)}%
                </span>
                <span>•</span>
                <span>{result.wordCount} words</span>
                {metadata && (
                  <>
                    <span>•</span>
                    <span>{(metadata.processingTime / 1000).toFixed(1)}s</span>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Description */}
            <div className="space-y-2">
              <Label htmlFor="editedDescription">Description (Editable)</Label>
              <Textarea
                id="editedDescription"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={8}
                className="font-normal"
              />
            </div>

            {/* SEO Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={result.seoTitle} readOnly className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input
                  value={result.shortDescription}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>SEO Meta Description</Label>
              <Textarea
                value={result.seoMetaDescription}
                readOnly
                className="bg-muted"
                rows={2}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Suggested Tags</Label>
              <div className="flex flex-wrap gap-2">
                {result.suggestedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            {metadata && (
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Model: {metadata.model}</p>
                  <p>Tokens Used: {metadata.tokensUsed.toLocaleString()}</p>
                  <p>Request ID: {metadata.requestId}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              📋 Copy Description
            </Button>
            {onApply && (
              <Button onClick={handleApply} className="flex-1">
                ✅ Apply Description
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
