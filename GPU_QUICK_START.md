# 🎮 GPU Features Quick Start Guide

**Get started with GPU-accelerated agricultural features in 5 minutes!**

---

## 🚀 Quick Examples

### 1. Optimize Product Images

```typescript
import { getImageProcessor } from "@/lib/gpu/AgriculturalImageProcessor";

// Optimize a farm product image
async function optimizeProductPhoto(imageFile: File) {
  const processor = await getImageProcessor();

  // Convert file to ImageData (you'd implement this based on your needs)
  const imageData = await fileToImageData(imageFile);

  // GPU-accelerated optimization
  const result = await processor.optimizeProductImage(imageData, {
    targetWidth: 800,
    targetHeight: 600,
    quality: 85,
    format: "webp",
  });

  console.log(`✅ Optimized in ${result.processingTime}ms`);
  console.log(`📊 GPU Utilization: ${result.gpuUtilization}%`);

  return result.processedImage;
}
```

### 2. Analyze Crop Health

```typescript
import { getImageProcessor } from "@/lib/gpu/AgriculturalImageProcessor";

// Analyze crop health from field photo
async function checkCropHealth(fieldPhoto: ImageData) {
  const processor = await getImageProcessor();

  const analysis = await processor.analyzeCropHealth(fieldPhoto);

  console.log(`🌱 Health Score: ${analysis.healthScore}/100`);
  console.log(`⚠️ Disease: ${analysis.diseaseDetected ? "DETECTED" : "None"}`);
  console.log(`📈 Estimated Yield: ${analysis.estimatedYield} units`);
  console.log(`💡 Recommendations:`, analysis.recommendedActions);

  return analysis;
}
```

### 3. Predict Crop Yield

```typescript
import { getDataAnalytics } from "@/lib/gpu/AgriculturalDataAnalytics";

// Predict yield for upcoming harvest
async function predictHarvest() {
  const analytics = await getDataAnalytics();

  const prediction = await analytics.predictYield("Tomatoes", {
    soilQuality: 85,
    weatherPatterns: [75, 80, 82, 78, 76],
    historicalYields: [1200, 1350, 1400, 1420],
    plantingDate: new Date("2025-04-15"),
  });

  console.log(`🎯 Estimated Yield: ${prediction.estimatedYield} kg`);
  console.log(`✅ Confidence: ${prediction.confidence}%`);
  console.log(`📊 Factors:`, prediction.factors);
  console.log(`💡 Recommendations:`, prediction.recommendations);

  return prediction;
}
```

### 4. Analyze Market Trends

```typescript
import { getDataAnalytics } from "@/lib/gpu/AgriculturalDataAnalytics";

// Analyze price trends for better selling decisions
async function analyzeMarket(productId: string, priceHistory: any[]) {
  const analytics = await getDataAnalytics();

  const trends = await analytics.analyzeMarketTrends(productId, priceHistory);

  console.log(`📈 Current Price: $${trends.currentPrice}`);
  console.log(`🔮 Predicted Price: $${trends.predictedPrice}`);
  console.log(`📊 Trend: ${trends.trend}`);
  console.log(`✅ Confidence: ${trends.confidence}%`);

  return trends;
}
```

### 5. Calculate Farm Performance

```typescript
import { getDataAnalytics } from "@/lib/gpu/AgriculturalDataAnalytics";

// Get comprehensive farm metrics
async function getFarmDashboard(farmId: string) {
  const analytics = await getDataAnalytics();

  // Fetch your sales and yield data
  const salesData = await fetchSalesData(farmId);
  const yieldData = await fetchYieldData(farmId);

  const metrics = await analytics.calculateFarmMetrics(
    farmId,
    salesData,
    yieldData
  );

  console.log(`💰 Total Revenue: $${metrics.totalRevenue}`);
  console.log(`📊 Average Yield: ${metrics.averageYield} kg`);
  console.log(`⚡ Efficiency: ${metrics.efficiency}%`);
  console.log(`📈 Growth Rate: ${metrics.growthRate * 100}%`);
  console.log(`🏆 Top Products:`, metrics.topProducts);

  return metrics;
}
```

---

## 🌐 API Usage

### Check GPU Status

```bash
curl http://localhost:3000/api/gpu
```

**Response:**

```json
{
  "success": true,
  "gpuStatus": {
    "imageProcessing": "operational",
    "dataAnalytics": "operational",
    "hardware": "RTX 2070 Max-Q",
    "cudaCores": 2304,
    "tensorCores": 288
  },
  "features": [
    "Image optimization",
    "Crop health analysis",
    "Yield prediction",
    "Market trend analysis",
    "Soil health analysis",
    "Batch processing"
  ]
}
```

### Analyze Crop (POST)

```bash
curl -X POST http://localhost:3000/api/gpu \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "<base64-image>",
    "analysisType": "crop-health"
  }'
```

---

## 💡 Common Use Cases

### Product Upload Flow

```typescript
// In your product creation form
async function handleProductImageUpload(file: File) {
  // 1. Get GPU processor
  const processor = await getImageProcessor();

  // 2. Convert to ImageData
  const imageData = await fileToImageData(file);

  // 3. Optimize for web
  const optimized = await processor.optimizeProductImage(imageData);

  // 4. Generate thumbnails
  const thumbnails = await processor.generateThumbnailSet(imageData);

  // 5. Upload all versions
  await uploadImages({
    full: optimized.processedImage,
    thumbnails: thumbnails,
  });

  return {
    success: true,
    processingTime: optimized.processingTime,
  };
}
```

### Farmer Dashboard

```typescript
// Real-time farm analytics dashboard
async function loadFarmDashboard(farmId: string) {
  const analytics = await getDataAnalytics();

  // Parallel fetch
  const [metrics, soilHealth, yieldPredictions] = await Promise.all([
    analytics.calculateFarmMetrics(farmId, salesData, yieldData),
    analytics.analyzeSoilHealth(soilSensorData),
    analytics.predictYield("Tomatoes", farmData),
  ]);

  return {
    metrics,
    soilHealth,
    yieldPredictions,
  };
}
```

---

## ⚡ Performance Tips

1. **Batch Processing**: Process multiple items together for better GPU utilization

   ```typescript
   // Instead of:
   for (const image of images) {
     await processor.optimizeProductImage(image);
   }

   // Do this:
   await processor.batchProcessImages(images);
   ```

2. **Singleton Pattern**: Services auto-manage GPU resources

   ```typescript
   // These all share the same GPU instance
   const proc1 = await getImageProcessor();
   const proc2 = await getImageProcessor(); // Same instance!
   ```

3. **Graceful Degradation**: CPU fallback is automatic
   ```typescript
   // No need to check GPU availability
   const result = await processor.optimizeProductImage(image);
   // Works with GPU or CPU automatically
   ```

---

## 📊 Expected Performance

| Operation      | Time (GPU) | Time (CPU) | Speedup |
| -------------- | ---------- | ---------- | ------- |
| Image Optimize | 50ms       | 200ms      | 4x      |
| Crop Analysis  | 120ms      | 450ms      | 3.75x   |
| Yield Predict  | 85ms       | 300ms      | 3.5x    |
| Market Trends  | 45ms       | 150ms      | 3.3x    |

---

## 🔍 Troubleshooting

### GPU Not Available

If you see "GPU acceleration not available" in logs:

1. **Browser/Node.js**: WebGPU requires browser support or Node.js with GPU bindings
2. **Fallback Active**: Features still work, just slower (CPU mode)
3. **Check Hardware**: Verify RTX 2070 drivers installed

### Performance Not as Expected

1. **Check GPU Utilization**: Use NVIDIA Nsight Systems
2. **Batch Size**: Increase batch size for better GPU utilization
3. **Data Size**: Very small operations may not benefit from GPU

---

## 🎯 Next Steps

1. **Read Full Docs**: [GPU_FEATURES_IMPLEMENTATION.md](../GPU_FEATURES_IMPLEMENTATION.md)
2. **Integration Guide**: See "Step 2: Use in Components" section
3. **API Reference**: Check endpoint documentation
4. **Performance Tuning**: Review benchmark results

---

_"GPU acceleration makes the impossible instant."_ ⚡

**Ready to use!** Start optimizing your agricultural platform today! 🌾
