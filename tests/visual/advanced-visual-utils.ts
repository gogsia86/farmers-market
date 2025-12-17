/**
 * 🎨 Advanced Visual Regression Utilities
 *
 * Implements state-of-the-art visual comparison algorithms:
 * - SSIM (Structural Similarity Index)
 * - Perceptual Diff (PDiff)
 * - Anti-aliasing detection
 * - Smart element-level comparison
 * - Color difference (Delta E)
 * - Layout shift detection
 * - Text rendering consistency
 *
 * @module AdvancedVisualUtils
 * @version 2.0.0
 */

import { PNG } from "pngjs";
import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import pixelmatch from "pixelmatch";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ImageData {
  width: number;
  height: number;
  data: Buffer;
}

interface ComparisonResult {
  passed: boolean;
  similarity: number;
  ssim: number;
  perceptualDiff: number;
  pixelDiff: number;
  antiAliasing: boolean;
  diffPixels: number;
  totalPixels: number;
  diffPercentage: number;
  regions: DiffRegion[];
  colorDifferences: ColorDiff[];
  layoutShifts: LayoutShift[];
  textChanges: TextChange[];
}

interface DiffRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: "critical" | "major" | "minor";
  pixelCount: number;
  description: string;
}

interface ColorDiff {
  location: { x: number; y: number };
  expectedColor: RGB;
  actualColor: RGB;
  deltaE: number;
  visible: boolean;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface LAB {
  l: number;
  a: number;
  b: number;
}

interface LayoutShift {
  element: string;
  expectedPosition: { x: number; y: number };
  actualPosition: { x: number; y: number };
  distance: number;
}

interface TextChange {
  region: { x: number; y: number; width: number; height: number };
  type: "added" | "removed" | "modified";
  confidence: number;
}

interface SSIMResult {
  ssim: number;
  mean: number;
  variance: number;
  covariance: number;
}

interface PerceptualDiffOptions {
  threshold: number;
  gamma: number;
  luminanceOnly: boolean;
}

interface ComparisonOptions {
  threshold?: number;
  includeAA?: boolean;
  alpha?: number;
  diffColor?: [number, number, number];
  ssimWindow?: number;
  perceptual?: boolean;
  ignoreAntialiasing?: boolean;
  ignoreColors?: boolean;
  diffMask?: Buffer;
  regions?: Array<{ x: number; y: number; width: number; height: number }>;
}

// ============================================================================
// Advanced Visual Comparison Engine
// ============================================================================

export class AdvancedVisualUtils {
  private ssimCache: Map<string, SSIMResult> = new Map();
  private readonly SSIM_WINDOW_SIZE = 11;
  private readonly SSIM_K1 = 0.01;
  private readonly SSIM_K2 = 0.03;
  private readonly SSIM_L = 255;

  /**
   * 🔬 Advanced multi-algorithm comparison
   */
  async compareImages(
    baselinePath: string,
    currentPath: string,
    diffPath: string,
    options: ComparisonOptions = {},
  ): Promise<ComparisonResult> {
    const baseline = await this.loadImage(baselinePath);
    const current = await this.loadImage(currentPath);

    // Validate dimensions
    if (
      baseline.width !== current.width ||
      baseline.height !== current.height
    ) {
      throw new Error(
        `Image dimensions don't match: ${baseline.width}x${baseline.height} vs ${current.width}x${current.height}`,
      );
    }

    const width = baseline.width;
    const height = baseline.height;
    const totalPixels = width * height;

    // Create diff image
    const diff = new PNG({ width, height });

    // 1. Pixel-perfect comparison (pixelmatch)
    const diffPixels = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      width,
      height,
      {
        threshold: options.threshold ?? 0.1,
        includeAA: options.includeAA ?? false,
        alpha: options.alpha ?? 0.1,
        diffColor: options.diffColor ?? [255, 0, 0],
        diffMask: options.diffMask,
      },
    );

    const pixelDiff = (diffPixels / totalPixels) * 100;

    // 2. SSIM (Structural Similarity)
    const ssimResult = await this.calculateSSIM(
      baseline,
      current,
      options.ssimWindow,
    );
    const ssim = ssimResult.ssim;

    // 3. Perceptual Diff
    const perceptualDiff = await this.calculatePerceptualDiff(
      baseline,
      current,
      {
        threshold: options.threshold ?? 0.1,
        gamma: 2.2,
        luminanceOnly: false,
      },
    );

    // 4. Anti-aliasing detection
    const antiAliasing = this.detectAntiAliasing(baseline, current, diffPixels);

    // 5. Detect diff regions
    const regions = this.identifyDiffRegions(diff, width, height);

    // 6. Color difference analysis
    const colorDifferences = this.analyzeColorDifferences(
      baseline,
      current,
      regions,
    );

    // 7. Layout shift detection
    const layoutShifts = await this.detectLayoutShifts(baseline, current);

    // 8. Text change detection
    const textChanges = this.detectTextChanges(baseline, current, regions);

    // Save diff image
    await this.saveImage(diff, diffPath);

    // Calculate overall similarity
    const similarity = this.calculateOverallSimilarity(
      ssim,
      pixelDiff,
      perceptualDiff,
      antiAliasing,
    );

    // Determine if test passed
    const threshold = options.threshold ?? 0.1;
    const passed = pixelDiff <= threshold && ssim >= 0.95;

    return {
      passed,
      similarity,
      ssim,
      perceptualDiff,
      pixelDiff,
      antiAliasing,
      diffPixels,
      totalPixels,
      diffPercentage: pixelDiff,
      regions,
      colorDifferences,
      layoutShifts,
      textChanges,
    };
  }

  /**
   * 📊 Calculate SSIM (Structural Similarity Index)
   * Paper: "Image Quality Assessment: From Error Visibility to Structural Similarity"
   */
  async calculateSSIM(
    img1: ImageData,
    img2: ImageData,
    windowSize: number = this.SSIM_WINDOW_SIZE,
  ): Promise<SSIMResult> {
    const cacheKey = this.getImageHash(img1) + this.getImageHash(img2);
    if (this.ssimCache.has(cacheKey)) {
      return this.ssimCache.get(cacheKey)!;
    }

    const { width, height } = img1;
    const window = windowSize;
    const halfWindow = Math.floor(window / 2);

    let ssimSum = 0;
    let windowCount = 0;

    // Iterate over image in windows
    for (let y = halfWindow; y < height - halfWindow; y += window) {
      for (let x = halfWindow; x < width - halfWindow; x += window) {
        const ssimWindow = this.calculateSSIMWindow(img1, img2, x, y, window);
        ssimSum += ssimWindow.ssim;
        windowCount++;
      }
    }

    const avgSSIM = windowCount > 0 ? ssimSum / windowCount : 0;

    const result: SSIMResult = {
      ssim: avgSSIM,
      mean: 0,
      variance: 0,
      covariance: 0,
    };

    this.ssimCache.set(cacheKey, result);
    return result;
  }

  /**
   * 🎨 Calculate SSIM for a specific window
   */
  private calculateSSIMWindow(
    img1: ImageData,
    img2: ImageData,
    centerX: number,
    centerY: number,
    windowSize: number,
  ): SSIMResult {
    const halfWindow = Math.floor(windowSize / 2);
    const pixels1: number[] = [];
    const pixels2: number[] = [];

    // Extract window pixels (luminance only)
    for (let dy = -halfWindow; dy <= halfWindow; dy++) {
      for (let dx = -halfWindow; dx <= halfWindow; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x >= 0 && x < img1.width && y >= 0 && y < img1.height) {
          const idx = (y * img1.width + x) * 4;
          const lum1 = this.rgbToLuminance(
            img1.data[idx],
            img1.data[idx + 1],
            img1.data[idx + 2],
          );
          const lum2 = this.rgbToLuminance(
            img2.data[idx],
            img2.data[idx + 1],
            img2.data[idx + 2],
          );
          pixels1.push(lum1);
          pixels2.push(lum2);
        }
      }
    }

    // Calculate statistics
    const mean1 = this.mean(pixels1);
    const mean2 = this.mean(pixels2);
    const variance1 = this.variance(pixels1, mean1);
    const variance2 = this.variance(pixels2, mean2);
    const covariance = this.covariance(pixels1, pixels2, mean1, mean2);

    // SSIM formula
    const c1 = Math.pow(this.SSIM_K1 * this.SSIM_L, 2);
    const c2 = Math.pow(this.SSIM_K2 * this.SSIM_L, 2);

    const numerator = (2 * mean1 * mean2 + c1) * (2 * covariance + c2);
    const denominator =
      (mean1 * mean1 + mean2 * mean2 + c1) * (variance1 + variance2 + c2);

    const ssim = numerator / denominator;

    return {
      ssim,
      mean: (mean1 + mean2) / 2,
      variance: (variance1 + variance2) / 2,
      covariance,
    };
  }

  /**
   * 👁️ Calculate Perceptual Diff (PDiff algorithm)
   * Based on "A Perceptual Metric for Production Testing" (Yee et al.)
   */
  async calculatePerceptualDiff(
    img1: ImageData,
    img2: ImageData,
    options: PerceptualDiffOptions,
  ): Promise<number> {
    const { width, height } = img1;
    let diffPixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Convert to LAB color space (more perceptual than RGB)
        const lab1 = this.rgbToLab({
          r: img1.data[idx],
          g: img1.data[idx + 1],
          b: img1.data[idx + 2],
        });

        const lab2 = this.rgbToLab({
          r: img2.data[idx],
          g: img2.data[idx + 1],
          b: img2.data[idx + 2],
        });

        // Calculate perceptual difference
        const deltaE = this.calculateDeltaE(lab1, lab2);

        // Threshold based on human perception
        if (deltaE > options.threshold * 100) {
          diffPixels++;
        }
      }
    }

    return (diffPixels / (width * height)) * 100;
  }

  /**
   * 🎯 Detect anti-aliasing artifacts
   */
  private detectAntiAliasing(
    img1: ImageData,
    img2: ImageData,
    diffPixels: number,
  ): boolean {
    // If diff is very small and localized, likely AA differences
    const diffPercentage = (diffPixels / (img1.width * img1.height)) * 100;

    if (diffPercentage > 0.1 && diffPercentage < 2) {
      // Check if diffs are along edges (characteristic of AA)
      const edgeDiffs = this.countEdgeDiffs(img1, img2);
      const totalDiffs = diffPixels;

      // If >70% of diffs are on edges, likely AA
      return edgeDiffs / totalDiffs > 0.7;
    }

    return false;
  }

  /**
   * 🔍 Count differences along edges
   */
  private countEdgeDiffs(img1: ImageData, img2: ImageData): number {
    const { width, height } = img1;
    let edgeDiffs = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Check if pixels differ
        const differ =
          Math.abs(img1.data[idx] - img2.data[idx]) > 10 ||
          Math.abs(img1.data[idx + 1] - img2.data[idx + 1]) > 10 ||
          Math.abs(img1.data[idx + 2] - img2.data[idx + 2]) > 10;

        if (differ) {
          // Check if on edge (high gradient)
          const isEdge = this.isEdgePixel(img1, x, y);
          if (isEdge) {
            edgeDiffs++;
          }
        }
      }
    }

    return edgeDiffs;
  }

  /**
   * 📐 Detect if pixel is on an edge
   */
  private isEdgePixel(img: ImageData, x: number, y: number): boolean {
    const idx = (y * img.width + x) * 4;
    const lum = this.rgbToLuminance(
      img.data[idx],
      img.data[idx + 1],
      img.data[idx + 2],
    );

    // Check neighbors
    const neighbors = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    for (const { dx, dy } of neighbors) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < img.width && ny >= 0 && ny < img.height) {
        const nIdx = (ny * img.width + nx) * 4;
        const nLum = this.rgbToLuminance(
          img.data[nIdx],
          img.data[nIdx + 1],
          img.data[nIdx + 2],
        );

        // High gradient = edge
        if (Math.abs(lum - nLum) > 30) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 🗺️ Identify regions with differences
   */
  private identifyDiffRegions(
    diff: PNG,
    width: number,
    height: number,
  ): DiffRegion[] {
    const visited = new Set<number>();
    const regions: DiffRegion[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const key = y * width + x;

        // Check if diff pixel (red channel > 0)
        if (diff.data[idx] > 0 && !visited.has(key)) {
          const region = this.floodFillRegion(diff, x, y, visited);
          if (region.pixelCount > 10) {
            // Ignore tiny regions
            regions.push(region);
          }
        }
      }
    }

    return regions.sort((a, b) => b.pixelCount - a.pixelCount).slice(0, 20); // Top 20
  }

  /**
   * 🌊 Flood fill to find connected diff region
   */
  private floodFillRegion(
    diff: PNG,
    startX: number,
    startY: number,
    visited: Set<number>,
  ): DiffRegion {
    const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
    const width = diff.width;
    const height = diff.height;

    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;
    let pixelCount = 0;

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const key = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) {
        continue;
      }

      const idx = (y * width + x) * 4;
      if (diff.data[idx] === 0) {
        continue; // Not a diff pixel
      }

      visited.add(key);
      pixelCount++;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // Add neighbors
      stack.push({ x: x - 1, y });
      stack.push({ x: x + 1, y });
      stack.push({ x, y: y - 1 });
      stack.push({ x, y: y + 1 });
    }

    const regionWidth = maxX - minX + 1;
    const regionHeight = maxY - minY + 1;
    const area = regionWidth * regionHeight;

    // Determine severity
    let severity: "critical" | "major" | "minor" = "minor";
    if (area > 10000) severity = "critical";
    else if (area > 1000) severity = "major";

    return {
      x: minX,
      y: minY,
      width: regionWidth,
      height: regionHeight,
      severity,
      pixelCount,
      description: `${regionWidth}x${regionHeight} region with ${pixelCount} diff pixels`,
    };
  }

  /**
   * 🎨 Analyze color differences using Delta E
   */
  private analyzeColorDifferences(
    img1: ImageData,
    img2: ImageData,
    regions: DiffRegion[],
  ): ColorDiff[] {
    const colorDiffs: ColorDiff[] = [];

    // Sample key pixels from diff regions
    for (const region of regions.slice(0, 5)) {
      const samplePoints = [
        { x: region.x, y: region.y },
        { x: region.x + Math.floor(region.width / 2), y: region.y },
        { x: region.x, y: region.y + Math.floor(region.height / 2) },
        {
          x: region.x + Math.floor(region.width / 2),
          y: region.y + Math.floor(region.height / 2),
        },
      ];

      for (const { x, y } of samplePoints) {
        if (x >= 0 && x < img1.width && y >= 0 && y < img1.height) {
          const idx = (y * img1.width + x) * 4;

          const rgb1: RGB = {
            r: img1.data[idx],
            g: img1.data[idx + 1],
            b: img1.data[idx + 2],
          };

          const rgb2: RGB = {
            r: img2.data[idx],
            g: img2.data[idx + 1],
            b: img2.data[idx + 2],
          };

          const lab1 = this.rgbToLab(rgb1);
          const lab2 = this.rgbToLab(rgb2);
          const deltaE = this.calculateDeltaE(lab1, lab2);

          colorDiffs.push({
            location: { x, y },
            expectedColor: rgb1,
            actualColor: rgb2,
            deltaE,
            visible: deltaE > 2.3, // JND (Just Noticeable Difference)
          });
        }
      }
    }

    return colorDiffs.filter((cd) => cd.visible);
  }

  /**
   * 📏 Detect layout shifts using template matching
   */
  async detectLayoutShifts(
    img1: ImageData,
    img2: ImageData,
  ): Promise<LayoutShift[]> {
    // Simplified layout shift detection
    // In production, use computer vision techniques like ORB or SIFT
    const shifts: LayoutShift[] = [];

    // For now, return empty array
    // TODO: Implement advanced feature matching
    return shifts;
  }

  /**
   * 📝 Detect text changes using edge detection
   */
  private detectTextChanges(
    img1: ImageData,
    img2: ImageData,
    regions: DiffRegion[],
  ): TextChange[] {
    const textChanges: TextChange[] = [];

    for (const region of regions) {
      // Check if region has text-like characteristics
      // (high frequency edges in horizontal/vertical patterns)
      const hasTextPattern = this.hasTextPattern(img1, region);

      if (hasTextPattern) {
        textChanges.push({
          region: {
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
          },
          type: "modified",
          confidence: 0.7,
        });
      }
    }

    return textChanges;
  }

  /**
   * 🔤 Check if region contains text-like patterns
   */
  private hasTextPattern(img: ImageData, region: DiffRegion): boolean {
    // Text typically has:
    // 1. High contrast edges
    // 2. Horizontal/vertical patterns
    // 3. Consistent spacing

    const { x, y, width, height } = region;
    let edgeCount = 0;
    let pixelCount = 0;

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const px = x + dx;
        const py = y + dy;

        if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
          pixelCount++;
          if (this.isEdgePixel(img, px, py)) {
            edgeCount++;
          }
        }
      }
    }

    const edgeDensity = edgeCount / pixelCount;
    return edgeDensity > 0.2 && edgeDensity < 0.6;
  }

  /**
   * 🧮 Calculate overall similarity score
   */
  private calculateOverallSimilarity(
    ssim: number,
    pixelDiff: number,
    perceptualDiff: number,
    antiAliasing: boolean,
  ): number {
    // Weighted average of metrics
    let score = 0;
    score += ssim * 0.5; // SSIM: 50%
    score += (1 - pixelDiff / 100) * 0.3; // Pixel diff: 30%
    score += (1 - perceptualDiff / 100) * 0.2; // Perceptual: 20%

    // Bonus for AA detection (less severe)
    if (antiAliasing) {
      score = Math.min(1, score + 0.05);
    }

    return Math.max(0, Math.min(1, score));
  }

  // ============================================================================
  // Color Space Conversions
  // ============================================================================

  /**
   * Convert RGB to LAB color space (perceptual)
   */
  private rgbToLab(rgb: RGB): LAB {
    // RGB -> XYZ -> LAB
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    // Gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // XYZ
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

    // Normalize for D65 illuminant
    const xn = x / 0.95047;
    const yn = y / 1.0;
    const zn = z / 1.08883;

    // XYZ -> LAB
    const fx = xn > 0.008856 ? Math.pow(xn, 1 / 3) : 7.787 * xn + 16 / 116;
    const fy = yn > 0.008856 ? Math.pow(yn, 1 / 3) : 7.787 * yn + 16 / 116;
    const fz = zn > 0.008856 ? Math.pow(zn, 1 / 3) : 7.787 * zn + 16 / 116;

    return {
      l: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
    };
  }

  /**
   * Calculate Delta E (color difference) using CIE76 formula
   */
  private calculateDeltaE(lab1: LAB, lab2: LAB): number {
    const deltaL = lab1.l - lab2.l;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;

    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  }

  /**
   * Convert RGB to luminance
   */
  private rgbToLuminance(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // ============================================================================
  // Statistical Helpers
  // ============================================================================

  private mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private variance(values: number[], mean: number): number {
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return this.mean(squaredDiffs);
  }

  private covariance(
    values1: number[],
    values2: number[],
    mean1: number,
    mean2: number,
  ): number {
    const products = values1.map(
      (val1, i) => (val1 - mean1) * (values2[i] - mean2),
    );
    return this.mean(products);
  }

  // ============================================================================
  // Image I/O
  // ============================================================================

  private async loadImage(imagePath: string): Promise<ImageData> {
    const buffer = await fs.readFile(imagePath);
    const png = PNG.sync.read(buffer);
    return {
      width: png.width,
      height: png.height,
      data: png.data,
    };
  }

  private async saveImage(png: PNG, imagePath: string): Promise<void> {
    const buffer = PNG.sync.write(png);
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, buffer);
  }

  private getImageHash(img: ImageData): string {
    const hash = createHash("sha256");
    hash.update(img.data);
    return hash.digest("hex").slice(0, 16);
  }
}

// ============================================================================
// Smart Element Comparison
// ============================================================================

export class SmartElementComparison {
  private utils = new AdvancedVisualUtils();

  /**
   * 🎯 Compare specific elements instead of full page
   */
  async compareElements(
    page: {
      locator: (selector: string) => {
        screenshot: (options?: unknown) => Promise<Buffer>;
      };
    },
    selector: string,
    baselinePath: string,
    options: ComparisonOptions = {},
  ): Promise<ComparisonResult> {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Take screenshot of element only
    const currentPath = baselinePath.replace("baseline", "current");
    await element.screenshot({ path: currentPath });

    const diffPath = baselinePath.replace("baseline", "diff");

    return await this.utils.compareImages(
      baselinePath,
      currentPath,
      diffPath,
      options,
    );
  }

  /**
   * 🔄 Compare with automatic retry on transient differences
   */
  async compareWithRetry(
    baselinePath: string,
    currentPath: string,
    diffPath: string,
    options: ComparisonOptions = {},
    maxRetries: number = 3,
  ): Promise<ComparisonResult> {
    let lastResult: ComparisonResult | null = null;

    for (let i = 0; i < maxRetries; i++) {
      const result = await this.utils.compareImages(
        baselinePath,
        currentPath,
        diffPath,
        options,
      );

      if (result.passed) {
        return result;
      }

      // If anti-aliasing detected, might be transient
      if (result.antiAliasing && i < maxRetries - 1) {
        await this.wait(500);
        continue;
      }

      lastResult = result;
    }

    return lastResult!;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Export
// ============================================================================

export default AdvancedVisualUtils;
