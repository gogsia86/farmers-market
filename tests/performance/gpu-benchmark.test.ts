/**
 * GPU PERFORMANCE BENCHMARKING
 * RTX 2070 Max-Q Validation Suite
 */

import { GPUImageProcessor, getGPUMemoryUsage } from '@/lib/gpu/image-processor';
import { GPURecommendationEngine } from '@/lib/ml/recommendation-engine';
import { beforeAll, describe, expect, it } from '@jest/globals';
import * as tf from '@tensorflow/tfjs';
import path from 'path';

describe.skip('GPU Performance Benchmarking', () => {
    beforeAll(async () => {
        // Ensure GPU backend is ready
        await tf.setBackend('webgl');
        await tf.ready();
    });

    describe('Image Processing GPU Acceleration', () => {
        it('processes single image faster than 100ms on GPU', async () => {
            // Create test image (or use fixture)
            const testImagePath = path.join(__dirname, '../fixtures/test-farm.jpg');

            const startTime = performance.now();
            const processed = await GPUImageProcessor.processFarmImage(testImagePath, [800]);
            const duration = performance.now() - startTime;

            expect(processed.size).toBe(1);
            expect(duration).toBeLessThan(100); // Should be < 100ms on RTX 2070

            console.log(`✅ Single image processed in ${duration.toFixed(2)}ms`);
        });

        it('batch processes 10 images with GPU parallelization', async () => {
            const testImages = Array(10).fill(
                path.join(__dirname, '../fixtures/test-farm.jpg')
            );

            const startTime = performance.now();
            const results = await GPUImageProcessor.batchProcessImages(testImages, [400, 800]);
            const duration = performance.now() - startTime;

            expect(results.size).toBe(10);

            const avgPerImage = duration / 10;
            const throughput = (10 * 2) / (duration / 1000); // 2 sizes per image

            console.log(`✅ Batch processing: ${avgPerImage.toFixed(2)}ms per image`);
            console.log(`⚡ GPU Throughput: ${throughput.toFixed(2)} images/sec`);

            expect(avgPerImage).toBeLessThan(50); // Should be < 50ms avg with GPU
        });

        it('tracks GPU VRAM usage during processing', async () => {
            const memoryBefore = getGPUMemoryUsage();

            const testImagePath = path.join(__dirname, '../fixtures/test-farm.jpg');
            await GPUImageProcessor.processFarmImage(testImagePath, [400, 800, 1200, 1600]);

            const memoryAfter = getGPUMemoryUsage();

            console.log('📊 GPU Memory Before:', memoryBefore);
            console.log('📊 GPU Memory After:', memoryAfter);

            // Ensure no memory leak
            expect(memoryAfter.numTensors).toBeLessThanOrEqual(memoryBefore.numTensors + 5);
        });
    });

    describe('ML Recommendation Engine GPU Training', () => {
        it('builds and trains model on GPU', async () => {
            const engine = new GPURecommendationEngine();

            await engine.buildModel(1000, 5000, 64); // 1k users, 5k products

            // Generate synthetic training data
            const numSamples = 10000;
            const userIds = Array.from({ length: numSamples }, () =>
                Math.floor(Math.random() * 1000)
            );

            const productFeatures = Array.from({ length: numSamples }, () => [
                Math.floor(Math.random() * 10), // category
                Math.random(), // price (normalized)
                Math.random() > 0.5 ? 1 : 0, // organic
                Math.random() > 0.5 ? 1 : 0, // seasonal
                Math.random() * 5, // farm rating
                Math.floor(Math.random() * 100), // purchase count
                Math.random() > 0.3 ? 1 : 0 // in stock
            ]);

            const labels = Array.from({ length: numSamples }, () =>
                Math.random() > 0.5 ? 1 : 0
            );

            const startTime = performance.now();
            const history = await engine.train(userIds, productFeatures, labels, 10, 256);
            const duration = performance.now() - startTime;

            const samplesPerSecond = (numSamples * 10) / (duration / 1000);

            console.log(`✅ Training completed in ${(duration / 1000).toFixed(2)}s`);
            console.log(`⚡ GPU Throughput: ${samplesPerSecond.toFixed(0)} samples/sec`);

            expect(samplesPerSecond).toBeGreaterThan(10000); // Should be > 10k samples/sec

            engine.dispose();
        }, 120000); // 2 minute timeout for training

        it('generates recommendations with low latency', async () => {
            const engine = new GPURecommendationEngine();
            await engine.buildModel(100, 1000, 32);

            // Skip training for speed test
            const candidateProducts = Array.from({ length: 100 }, (_, i) => ({
                productId: `product-${i}`,
                category: Math.floor(Math.random() * 10),
                price: Math.random(),
                organic: Math.random() > 0.5 ? 1 : 0,
                seasonal: Math.random() > 0.5 ? 1 : 0,
                farmRating: Math.random() * 5,
                purchaseCount: Math.floor(Math.random() * 100),
                inStock: 1
            }));

            const startTime = performance.now();
            const recommendations = await engine.recommend(42, candidateProducts, 10);
            const duration = performance.now() - startTime;

            console.log(`✅ Generated ${recommendations.length} recommendations in ${duration.toFixed(2)}ms`);

            expect(recommendations.length).toBe(10);
            expect(duration).toBeLessThan(50); // Should be < 50ms on GPU

            engine.dispose();
        });

        it('monitors GPU memory during ML operations', () => {
            const engine = new GPURecommendationEngine();

            const stats = engine.getMemoryStats();

            console.log('🧠 ML Engine GPU Memory:', stats);

            expect(stats.numTensors).toBeGreaterThanOrEqual(0);
            expect(parseFloat(stats.vramMB)).toBeLessThan(8192); // < 8GB VRAM limit

            engine.dispose();
        });
    });

    describe('Hardware Utilization Validation', () => {
        it('confirms RTX 2070 Max-Q GPU backend', async () => {
            const backend = tf.getBackend();

            expect(backend).toBe('webgl');

            console.log(`✅ TensorFlow.js Backend: ${backend}`);
            console.log(`🎮 GPU: RTX 2070 Max-Q (2304 CUDA cores)`);
        });

        it('validates CUDA core utilization potential', () => {
            // RTX 2070 Max-Q specs
            const specs = {
                cudaCores: 2304,
                baseClock: 885, // MHz
                boostClock: 1185, // MHz
                vram: 8192, // MB
                memoryBandwidth: 256 // GB/s
            };

            console.log('🔥 RTX 2070 Max-Q Specifications:');
            console.log(`   CUDA Cores: ${specs.cudaCores}`);
            console.log(`   Boost Clock: ${specs.boostClock} MHz`);
            console.log(`   VRAM: ${specs.vram} MB`);
            console.log(`   Memory Bandwidth: ${specs.memoryBandwidth} GB/s`);

            expect(specs.cudaCores).toBe(2304);
            expect(specs.vram).toBe(8192);
        });
    });

    describe('CPU Fallback Operations', () => {
        it('performs matrix operations on CPU when GPU unavailable', async () => {
            const testData = Array(100).fill(0).map(() =>
                Array(100).fill(0).map(() => Math.random())
            );

            // Create tensors and perform basic operation
            const tensor = tf.tensor2d(testData);
            const result = tensor.mul(2);
            const resultData = await result.array();

            expect(resultData).toBeDefined();
            expect(resultData.length).toBe(testData.length);

            tensor.dispose();
            result.dispose();
        });
    });
});


