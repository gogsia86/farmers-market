# 🌾 Biodynamic Scoring Algorithms

## Overview

The Farmers Market Platform implements comprehensive biodynamic scoring algorithms that provide intelligent crop recommendations, seasonal awareness, and lunar-based planting guidance. These algorithms combine traditional biodynamic farming principles with modern data analysis to help farmers maximize yield, sustainability, and profitability.

## Table of Contents

- [Architecture](#architecture)
- [Core Services](#core-services)
- [Scoring Algorithms](#scoring-algorithms)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [Testing](#testing)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Biodynamic Intelligence                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Biodynamic      │         │  Crop            │        │
│  │  Calendar        │◄────────┤  Recommendation  │        │
│  │  Service         │         │  Engine          │        │
│  └────────┬─────────┘         └────────┬─────────┘        │
│           │                            │                   │
│           │  ┌─────────────────────────┼─────────┐        │
│           │  │                         │         │        │
│           ▼  ▼                         ▼         ▼        │
│  ┌─────────────────┐         ┌─────────────────────┐     │
│  │  Lunar Phase    │         │  Scoring Algorithms  │     │
│  │  Calculations   │         │  - Profitability     │     │
│  │                 │         │  - Sustainability    │     │
│  │  - Season       │         │  - Market Demand     │     │
│  │  - Moon Phase   │         │  - Suitability       │     │
│  │  - Optimal Days │         └──────────────────────┘     │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input**: Farm profile, preferences, market data
2. **Processing**: Biodynamic calendar analysis, crop filtering, scoring
3. **Output**: Ranked recommendations with detailed breakdowns

---

## Core Services

### 1. Biodynamic Calendar Service

**Location**: `src/lib/services/biodynamic-calendar.service.ts`

Provides seasonal and lunar phase awareness for agricultural operations.

#### Features

- **Season Detection**: Automatic seasonal classification
- **Lunar Phase Calculation**: Accurate moon phase tracking
- **Optimal Planting Windows**: Biodynamic-based planting recommendations
- **Agricultural Operations**: Season-specific task recommendations
- **Biodynamic Scoring**: Farm practice alignment assessment

#### Key Methods

```typescript
// Get current biodynamic context
const context = biodynamicCalendar.getBiodynamicContext();
// Returns: { season, lunarPhase, lunarAge, isOptimalPlanting, optimalOperations }

// Get optimal planting days for a crop type
const windows = biodynamicCalendar.getOptimalPlantingDays(CropType.LEAFY, 14);
// Returns array of planting windows with scores and reasons

// Check if date is optimal for planting
const isOptimal = biodynamicCalendar.isOptimalPlantingDate(CropType.ROOT, new Date());
// Returns boolean

// Calculate biodynamic alignment score
const score = biodynamicCalendar.calculateBiodynamicScore({
  followsLunarCalendar: true,
  usesBiodynamicPreparations: true,
  practiceCropRotation: true,
  maintainsBiodiversity: true,
  compostOnSite: true,
  avoidsChemicals: true,
  integratesLivestock: false
});
// Returns: 90 (out of 100)
```

#### Lunar Phase Mapping

| Phase | Days | Best For | Energy Flow |
|-------|------|----------|-------------|
| New Moon | 0-1.8 | Rest, planning | Dormant |
| Waxing Crescent | 1.8-5.5 | Leafy crops | Increasing |
| First Quarter | 5.5-9.2 | Leafy greens, flowers | Strong growth |
| Waxing Gibbous | 9.2-12.9 | Fruit crops | Peak energy |
| Full Moon | 12.9-16.6 | Fruiting, flowering | Maximum |
| Waning Gibbous | 16.6-20.3 | Root crops, seeds | Descending |
| Last Quarter | 20.3-24.0 | Root vegetables | Deep growth |
| Waning Crescent | 24.0-29.5 | Root development | Resting |

### 2. Crop Recommendation Engine

**Location**: `src/lib/services/crop-recommendation.service.ts`

Provides intelligent crop recommendations with comprehensive scoring.

#### Features

- **Multi-Factor Scoring**: Profitability, sustainability, market demand, suitability
- **Farm Profile Analysis**: Climate, soil, water, equipment matching
- **Market Intelligence**: Price trends, demand analysis, competition
- **Risk Assessment**: Identifies potential challenges and opportunities
- **Actionable Recommendations**: Specific guidance for each crop

#### Key Methods

```typescript
// Get recommendations for a farm
const recommendations = await cropRecommendationEngine.getRecommendations(
  farmProfile,
  preferences,
  marketDataMap
);
// Returns ranked array of CropRecommendation objects
```

---

## Scoring Algorithms

### 1. Profitability Score (0-100)

**Formula**: Revenue Potential + Cost Efficiency + Labor Efficiency + Price Stability + Storage Value

#### Factors

| Factor | Weight | Calculation |
|--------|--------|-------------|
| **Revenue Potential** | 30% | `baseYield * marketPrice * organicMultiplier` |
| **Cost Efficiency** | 25% | `(revenue - costs) / revenue` |
| **Labor Efficiency** | 20% | `revenue / laborHours` |
| **Price Stability** | 15% | `1 - priceVolatility` |
| **Storage Value** | 10% | Based on storage life (days) |

#### Score Ranges

```typescript
// Revenue Potential (0-30 points)
if (potentialRevenue > 10000) score += 30;        // $10k+/acre
else if (potentialRevenue > 5000) score += 25;     // $5k-10k/acre
else if (potentialRevenue > 2500) score += 20;     // $2.5k-5k/acre
else score += 15;                                   // <$2.5k/acre

// Profit Margin (0-25 points)
if (profitMargin > 0.7) score += 25;              // 70%+ margin
else if (profitMargin > 0.5) score += 20;          // 50-70% margin
else if (profitMargin > 0.3) score += 15;          // 30-50% margin
else if (profitMargin > 0.1) score += 10;          // 10-30% margin
else score += 5;                                    // <10% margin

// Revenue per Labor Hour (0-20 points)
if (revenuePerLaborHour > 100) score += 20;       // $100+/hour
else if (revenuePerLaborHour > 50) score += 15;    // $50-100/hour
else if (revenuePerLaborHour > 25) score += 10;    // $25-50/hour
else score += 5;                                    // <$25/hour

// Storage Life (0-10 points)
if (storageLife > 90) score += 10;                // 3+ months
else if (storageLife > 30) score += 7;             // 1-3 months
else if (storageLife > 7) score += 4;              // 1-4 weeks
else score += 2;                                    // <1 week
```

#### Example Calculation

```typescript
// Tomato crop example
const crop = {
  averageYieldPerAcre: 25000, // lbs
  marketPricePerLb: 2.50,
  organicPremium: 1.4,        // 40% premium for organic
  inputCostPerAcre: 3500,
  laborHoursPerAcre: 120,
  storageLife: 14,            // days
  priceVolatility: 0.15
};

// Calculations
const organicMultiplier = 1.4;
const potentialRevenue = 25000 * 2.50 * 1.4 = $87,500/acre
const profitMargin = (87500 - 3500) / 87500 = 96%
const revenuePerLaborHour = 87500 / 120 = $729/hour
const priceStability = 1 - 0.15 = 0.85

// Score breakdown
Revenue Potential:     30 points (>$10k)
Cost Efficiency:       25 points (96% margin)
Labor Efficiency:      20 points ($729/hour)
Price Stability:       13 points (85% stable)
Storage Value:         4 points (14 days)
─────────────────────────────────────
Total Profitability:   92/100
```

### 2. Sustainability Score (0-100)

**Formula**: Water Efficiency + Soil Impact + Biodiversity + Input Requirements + Organic Bonus + Pest Resistance + Rotation Benefit

#### Factors

| Factor | Weight | Criteria |
|--------|--------|----------|
| **Water Efficiency** | 20% | Low/Moderate/High water requirements |
| **Soil Health Impact** | 20% | Legumes (N-fixing), roots (soil breaking) |
| **Biodiversity** | 15% | Number of companion plants |
| **Input Requirements** | 15% | Cost/environmental impact of inputs |
| **Organic/Biodynamic** | 10% | Certification bonus |
| **Pest Resistance** | 10% | Fewer pests = higher score |
| **Crop Rotation** | 10% | New crop bonus |

#### Score Calculation

```typescript
// Water Efficiency (0-25 points total)
if (waterRequirements === 'LOW') score += 20;
else if (waterRequirements === 'MODERATE') score += 12;
else score += 5;

// Water availability match bonus (+5)
if (waterRequirements === farmProfile.waterAvailability) score += 5;

// Soil Health Impact (0-20 points)
if (cropCategory === 'LEGUME') score += 20;        // Nitrogen fixing
else if (cropCategory === 'ROOT') score += 10;      // Breaks up soil
else if (cropCategory === 'LEAFY_GREEN') score += 15; // Quick rotation

// Biodiversity (0-15 points)
if (companionPlants.length > 10) score += 15;
else if (companionPlants.length > 5) score += 10;
else score += 5;

// Input Requirements (0-15 points)
const inputCostRatio = inputCostPerAcre / 1000;
if (inputCostRatio < 0.5) score += 15;            // Under $500/acre
else if (inputCostRatio < 1) score += 10;          // $500-1000/acre
else if (inputCostRatio < 2) score += 5;           // $1000-2000/acre

// Organic/Biodynamic Bonus (0-10 points)
if (farmProfile.isBiodynamic) score += 10;
else if (farmProfile.isOrganic) score += 7;

// Pest Resistance (0-10 points)
if (pestCount < 3) score += 10;
else if (pestCount < 6) score += 7;
else if (pestCount < 10) score += 4;

// Crop Rotation (0-10 points)
if (!previouslyGrown) score += 10;                 // New crop
else score += 3;                                    // Previously grown
```

#### Example Calculation

```typescript
// Carrot crop example
const crop = {
  category: 'ROOT',
  waterRequirements: 'MODERATE',
  companionPlants: ['onion', 'leek', 'lettuce', 'tomato', 'peas'], // 5 plants
  inputCostPerAcre: 2000,
  pests: ['carrot fly', 'aphids', 'wireworms'], // 3 pests
  previouslyGrown: false
};

// Score breakdown
Water Efficiency:      17 points (moderate + match)
Soil Health:           10 points (root crop)
Biodiversity:          10 points (5 companions)
Input Requirements:    5 points ($2000/acre)
Organic Bonus:         10 points (biodynamic farm)
Pest Resistance:       10 points (3 pests)
Crop Rotation:         10 points (new crop)
──────────────────────────────────────
Total Sustainability:  72/100
```

### 3. Market Demand Score (0-100)

**Formula**: Demand Index + Supply-Demand Balance + Price Trend + Competition + Seasonal Factor + Organic Premium

#### Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| **Demand Index** | 25% | Current market demand (0-100) |
| **Supply-Demand Balance** | 20% | Ratio of demand to supply |
| **Price Trend** | 20% | Increasing/Stable/Decreasing |
| **Competition Level** | 15% | Low/Medium/High competition |
| **Seasonal Factor** | 10% | Price multiplier for season |
| **Organic Premium** | 10% | Premium for organic certification |

#### Score Calculation

```typescript
// Demand Index (0-25 points)
score += (demandIndex / 100) * 25;

// Supply-Demand Balance (0-20 points)
const ratio = demandIndex / supplyIndex;
if (ratio > 1.5) score += 20;                     // High demand, low supply
else if (ratio > 1.2) score += 15;
else if (ratio > 0.8) score += 10;
else score += 5;

// Price Trend (0-20 points)
if (trendDirection === 'INCREASING') score += 20;
else if (trendDirection === 'STABLE') score += 12;
else score += 5; // DECREASING

// Competition Level (0-15 points)
if (competitionLevel === 'LOW') score += 15;
else if (competitionLevel === 'MEDIUM') score += 10;
else score += 5; // HIGH

// Seasonal Factor (0-10 points)
score += (seasonalPriceFactor - 1) * 100;

// Organic Premium (0-10 points)
if (isOrganic && organicPremium > 1.2) score += 10;
else if (isOrganic) score += 5;
```

#### Example Calculation

```typescript
// Lettuce market example
const marketData = {
  demandIndex: 78,
  supplyIndex: 72,
  trendDirection: 'STABLE',
  competitionLevel: 'HIGH',
  seasonalPriceFactor: 1.0,
  organicPremium: 1.5
};

// Score breakdown
Demand Index:          20 points (78/100)
Supply-Demand:         10 points (ratio: 1.08)
Price Trend:           12 points (stable)
Competition:           5 points (high)
Seasonal Factor:       0 points (1.0x)
Organic Premium:       10 points (50% premium)
──────────────────────────────────────
Total Market Demand:   57/100
```

### 4. Suitability Score (0-100)

**Formula**: Climate Match + Soil Match + Water Match + Sun Match + Labor Capacity + Budget Alignment

#### Factors

| Factor | Weight | Criteria |
|--------|--------|----------|
| **Hardiness Zone** | 25% | USDA zone compatibility |
| **Soil Type** | 20% | Soil preference match |
| **Water Availability** | 20% | Water requirement match |
| **Sun Exposure** | 15% | Sun requirement match |
| **Labor Capacity** | 10% | Available labor vs. required |
| **Budget** | 10% | Input costs vs. budget |

#### Score Calculation

```typescript
// Hardiness Zone (0-25 points)
if (crop.hardinessZones.includes(farm.hardinessZone)) score += 25;
else {
  const zoneDiff = Math.abs(closestZone - farm.hardinessZone);
  score += Math.max(0, 25 - (zoneDiff * 5));
}

// Soil Compatibility (0-20 points)
if (crop.soilPreferences.includes(farm.soilType)) score += 20;
else score += 8; // Partial credit

// Water Match (0-20 points)
if (waterRequirements === waterAvailability) score += 20;
else {
  const diff = Math.abs(levelIndex(required) - levelIndex(available));
  score += Math.max(0, 20 - (diff * 10));
}

// Sun Match (0-15 points)
if (sunRequirements === sunExposure) score += 15;
else {
  const diff = Math.abs(levelIndex(required) - levelIndex(available));
  score += Math.max(0, 15 - (diff * 7));
}

// Labor Capacity (0-10 points)
const requiredLabor = (laborHoursPerAcre * farmSize) / 16; // Per week
if (requiredLabor <= laborCapacity) score += 10;
else score += (laborCapacity / requiredLabor) * 10;

// Budget Alignment (0-10 points)
if (inputCost <= budgetPerAcre) score += 10;
else score += (budgetPerAcre / inputCost) * 10;
```

#### Example Calculation

```typescript
// Tomato suitability for specific farm
const crop = {
  hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10],
  soilPreferences: ['LOAMY', 'SANDY'],
  waterRequirements: 'MODERATE',
  sunRequirements: 'FULL_SUN',
  laborHoursPerAcre: 120,
  inputCostPerAcre: 3500
};

const farm = {
  hardinessZone: 7,
  soilType: 'LOAMY',
  waterAvailability: 'MODERATE',
  sunExposure: 'FULL_SUN',
  farmSize: 5, // acres
  laborCapacity: 40, // hours/week
  budgetPerAcre: 5000
};

// Score breakdown
Hardiness Zone:        25 points (perfect match)
Soil Type:             20 points (loamy ✓)
Water Match:           20 points (moderate ✓)
Sun Match:             15 points (full sun ✓)
Labor Capacity:        10 points (37.5 hrs needed, 40 available)
Budget:                10 points ($3500 cost, $5000 budget)
──────────────────────────────────────
Total Suitability:     100/100
```

### 5. Overall Score Calculation

The overall score is a weighted combination of all four scores, adjusted based on farmer preferences.

#### Default Weights

```typescript
const defaultWeights = {
  profitability: 0.25,
  sustainability: 0.25,
  marketDemand: 0.25,
  suitability: 0.25
};
```

#### Preference-Based Adjustments

```typescript
// Priority: Profit
if (preferences.prioritizeProfit) {
  weights = {
    profitability: 0.40,  // +15%
    sustainability: 0.20, // -5%
    marketDemand: 0.25,
    suitability: 0.15     // -10%
  };
}

// Priority: Sustainability
if (preferences.prioritizeSustainability) {
  weights = {
    profitability: 0.20,  // -5%
    sustainability: 0.40, // +15%
    marketDemand: 0.20,   // -5%
    suitability: 0.20     // -5%
  };
}

// Overall calculation
overallScore = 
  profitabilityScore * weights.profitability +
  sustainabilityScore * weights.sustainability +
  marketDemandScore * weights.marketDemand +
  suitabilityScore * weights.suitability;
```

#### Complete Example

```typescript
// Tomato crop for profit-focused organic farmer
const scores = {
  profitability: 92,
  sustainability: 72,
  marketDemand: 85,
  suitability: 100
};

// With profit priority
const overall = 
  92 * 0.40 +  // 36.8
  72 * 0.20 +  // 14.4
  85 * 0.25 +  // 21.25
  100 * 0.15;  // 15.0
  
// Total: 87.45 → 87/100
```

---

## API Endpoints

### 1. Crop Recommendations

**Endpoint**: `GET /api/v1/crops/recommendations`

Get personalized crop recommendations for a farm.

#### Request Parameters

```typescript
GET /api/v1/crops/recommendations?farmId={farmId}&maxRecommendations=10
  &prioritizeProfit=true
  &prioritizeSustainability=false
  &riskTolerance=MEDIUM
  &experienceLevel=INTERMEDIATE
  &marketAccess=LOCAL
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmId` | string | ✅ | Farm identifier |
| `maxRecommendations` | number | ❌ | Max results (default: 10) |
| `prioritizeProfit` | boolean | ❌ | Emphasize profitability |
| `prioritizeSustainability` | boolean | ❌ | Emphasize sustainability |
| `riskTolerance` | enum | ❌ | LOW, MEDIUM, HIGH |
| `experienceLevel` | enum | ❌ | BEGINNER, INTERMEDIATE, EXPERT |
| `marketAccess` | enum | ❌ | LOCAL, REGIONAL, NATIONAL |

#### Response

```json
{
  "success": true,
  "recommendations": [
    {
      "crop": {
        "id": "tomato-1",
        "name": "Tomato",
        "scientificName": "Solanum lycopersicum",
        "category": "VEGETABLE",
        "cropType": "FRUIT"
      },
      "overallScore": 87,
      "profitabilityScore": 92,
      "sustainabilityScore": 72,
      "marketDemandScore": 85,
      "suitabilityScore": 100,
      "plantingWindow": {
        "start": "2025-03-15T00:00:00.000Z",
        "end": "2025-03-20T00:00:00.000Z",
        "optimal": true
      },
      "expectedYield": {
        "min": 17500,
        "max": 32500,
        "unit": "lbs"
      },
      "expectedRevenue": {
        "min": 61250,
        "max": 113750,
        "breakEven": 3500
      },
      "riskFactors": [
        "Susceptible to 3 common pests",
        "Vulnerable to 4 diseases",
        "Short storage life requires immediate sale"
      ],
      "strengths": [
        "Excellent soil compatibility",
        "Strong organic price premium",
        "Many companion planting options"
      ],
      "recommendations": [
        "Consider companion planting with: basil, carrot, onion",
        "Current lunar phase is optimal for planting",
        "Implement integrated pest management early"
      ]
    }
  ],
  "biodynamicContext": {
    "season": "SPRING",
    "lunarPhase": "WAXING_GIBBOUS",
    "isOptimalPlanting": true
  },
  "metadata": {
    "requestDate": "2025-01-15T10:30:00.000Z",
    "farmProfile": {
      "farmId": "farm_123",
      "hardinessZone": 7,
      "soilType": "LOAMY"
    }
  }
}
```

### 2. Biodynamic Calendar

**Endpoint**: `GET /api/v1/biodynamic/calendar`

Get biodynamic calendar information and planting windows.

#### Actions

##### Current Context

```bash
GET /api/v1/biodynamic/calendar?action=current
```

Returns current season, lunar phase, and optimal operations.

##### Planting Windows

```bash
GET /api/v1/biodynamic/calendar?action=planting-windows
  &cropType=LEAFY
  &daysAhead=14
```

Returns optimal planting windows for a specific crop type.

##### All Crop Windows

```bash
GET /api/v1/biodynamic/calendar?action=all-crop-windows&daysAhead=30
```

Returns planting windows for all crop types.

##### Check Optimal

```bash
GET /api/v1/biodynamic/calendar?action=check-optimal
  &cropType=ROOT
  &date=2025-03-15
```

Check if a specific date is optimal for planting.

##### Seasonal Operations

```bash
GET /api/v1/biodynamic/calendar?action=seasonal-operations
```

Get recommended operations for current season.

##### Lunar Calendar

```bash
GET /api/v1/biodynamic/calendar?action=lunar-calendar&daysAhead=30
```

Get lunar calendar for the next period.

#### Response Examples

**Current Context**:

```json
{
  "success": true,
  "data": {
    "date": "2025-01-15T10:30:00.000Z",
    "season": "WINTER",
    "seasonEmoji": "❄️",
    "lunarPhase": "WAXING_CRESCENT",
    "lunarPhaseEmoji": "🌒",
    "lunarAge": 3.2,
    "isOptimalPlanting": true,
    "optimalOperations": [
      "REST",
      "PLAN",
      "REPAIR",
      "INDOOR_GROWING"
    ],
    "seasonalGuidance": "Winter is a time of rest and planning..."
  }
}
```

**Planting Windows**:

```json
{
  "success": true,
  "data": {
    "cropType": "LEAFY",
    "startDate": "2025-01-15T00:00:00.000Z",
    "daysAhead": 14,
    "windows": [
      {
        "start": "2025-01-16T00:00:00.000Z",
        "end": "2025-01-19T00:00:00.000Z",
        "lunarPhase": "WAXING_CRESCENT",
        "lunarPhaseEmoji": "🌒",
        "score": 85,
        "reason": "Waxing crescent - increasing energy, good for leafy growth. Leafy greens thrive with increasing lunar energy."
      },
      {
        "start": "2025-01-23T00:00:00.000Z",
        "end": "2025-01-27T00:00:00.000Z",
        "lunarPhase": "FIRST_QUARTER",
        "lunarPhaseEmoji": "🌓",
        "score": 95,
        "reason": "First quarter - strong growth phase. Leafy greens thrive with increasing lunar energy."
      }
    ]
  }
}
```

---

## Usage Examples

### Example 1: Get Recommendations for a Farm

```typescript
import { cropRecommendationEngine } from '@/lib/services/crop-recommendation.service';
import { biodynamicCalendar } from '@/lib/services/biodynamic-calendar.service';

// Build farm profile
const farmProfile = {
  id: 'farm_123',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    hardinessZone: 7
  },
  farmSize: 5,
  soilType: 'LOAMY',
  waterAvailability: 'MODERATE',
  sunExposure: 'FULL_SUN',
  isOrganic: true,
  isBiodynamic: false,
  previousCrops: ['lettuce-1', 'carrot-1'],
  equipmentAvailable: ['tractor', 'irrigation'],
  laborCapacity: 40,
  budgetPerAcre: 5000
};

// Set preferences
const preferences = {
  prioritizeOrganic: true,
  prioritizeProfit: true,
  prioritizeSustainability: false,
  riskTolerance: 'MEDIUM',
  experienceLevel: 'INTERMEDIATE',
  marketAccess: 'LOCAL'
};

// Get market data
const marketData = new Map([
  ['tomato-1', {
    cropId: 'tomato-1',
    averagePrice: 2.75,
    priceVolatility: 0.15,
    demandIndex: 85,
    supplyIndex: 65,
    trendDirection: 'INCREASING',
    seasonalPriceFactor: 1.2,
    competitionLevel: 'MEDIUM'
  }]
]);

// Get recommendations
const recommendations = await cropRecommendationEngine.getRecommendations(
  farmProfile,
  preferences,
  marketData
);

// Process results
recommendations.forEach(rec => {
  console.log(`${rec.crop.name}: ${rec.overallScore}/100`);
  console.log(`  Profitability: ${rec.profitabilityScore}`);
  console.log(`  Sustainability: ${rec.sustainabilityScore}`);
  console.log(`  Market Demand: ${rec.marketDemandScore}`);
  console.log(`  Suitability: ${rec.suitabilityScore}`);
  console.log(`  Expected Revenue: $${rec.expectedRevenue.min}-${rec.expectedRevenue.max}`);
  console.log(`  Strengths: ${rec.strengths.join(', ')}`);
});
```

### Example 2: Check Optimal Planting Time

```typescript
import { biodynamicCalendar, CropType } from '@/lib/services/biodynamic-calendar.service';

// Check if today is optimal for planting
const isOptimal = biodynamicCalendar.isOptimalPlantingDate(CropType.LEAFY);

if (isOptimal) {
  console.log('Today is an excellent day for planting leafy greens!');
  
  // Get context
  const context = biodynamicCalendar.getBiodynamicContext();
  console.log(`Season: ${context.season}`);
  console.log(`Lunar Phase: ${context.lunarPhase}`);
  console.log(`Recommended operations: ${context.optimalOperations.join(', ')}`);
} else {
  // Find next optimal date
  const nextDate = biodynamicCalendar.getNextOptimalPlantingDate(CropType.LEAFY);
  console.log(`Next optimal planting date: ${nextDate?.toLocaleDateString()}`);
}
```

### Example 3: Get Planting Calendar

```typescript
import { biodynamicCalendar, CropType } from '@/lib/services/biodynamic-calendar.service';

// Get 30-day planting calendar for root crops
const windows = biodynamicCalendar.getOptimalPlantingDays(
  CropType.ROOT,
  30,
  new Date()
);

console.log('Optimal planting windows for root crops:');
windows.forEach(window => {
  console.log(`${window.start.toLocaleDateString()} - ${window.end.toLocaleDateString()}`);
  console.log(`  Lunar Phase: ${window.lunarPhase}`);
  console.log(`  Score: ${window.score}/100`);
  console.log(`  Reason: ${window.reason}`);
});
```

### Example 4: Calculate Biodynamic Score

```typescript
import { biodynamicCalendar } from '@/lib/services/biodynamic-calendar.service';

// Assess farm's biodynamic practices
const farmPractices = {
  followsLunarCalendar: true,
  usesBiodynamicPreparations: true,
  practiceCropRotation: true,
  maintainsBiodiversity: true,
  compostOnSite: true,
  avoidsChemicals: true,
  integratesLivestock: false
};

const score = biodynamicCalendar.calculateBiodynamicScore(farmPractices);

console.log(`Biodynamic Alignment Score: ${score}/100`);

if (score >= 80) {
  console.log('Excellent biodynamic practices!');
} else if (score >= 60) {
  console.log('Good practices with room for improvement');
} else {
  console.log('Consider adopting more biodynamic principles');
}
```

---

## Integration Guide

### Step 1: Install Dependencies

All services are already included in the platform. No additional dependencies required.

### Step 2: Import Services

```typescript
// Import biodynamic services
import { biodynamicCalendar, CropType, Season, LunarPhase } from '@/lib/services/biodynamic-calendar.service';
import { cropRecommendationEngine, CropCategory } from '@/lib/services/crop-recommendation.service';

// Import types
import type {
  CropRecommendation,
  FarmProfile,
  FarmerPreferences,
  MarketData,
  BiodynamicContext
} from '@/types/biodynamic.types';
```

### Step 3: Build Farm Profile

```typescript
// Fetch farm data from database
const farm = await database.farm.findUnique({
  where: { id: farmId },
  include: {
    certifications: true,
    products: true
  }
});

// Convert to FarmProfile
const farmProfile: FarmProfile = {
  id: farm.id,
  location: {
    latitude: farm.latitude || 0,
    longitude: farm.longitude || 0,
    hardinessZone: farm.hardinessZone || 7
  },
  farmSize: parseFloat(farm.farmSize?.toString() || '1'),
  soilType: farm.soilType || 'LOAMY',
  waterAvailability: farm.waterAvailability || 'MODERATE',
  sunExposure: farm.sunExposure || 'FULL_SUN',
  isOrganic: farm.certifications.some(c => c.type === 'ORGANIC'),
  isBiodynamic: farm.certifications.some(c => c.type === 'BIODYNAMIC'),
  previousCrops: farm.products.map(p => p.id),
  equipmentAvailable: farm.equipment || [],
  laborCapacity: farm.laborCapacity || 40,
  budgetPerAcre: farm.budgetPerAcre || 5000
};
```

### Step 4: Get Recommendations

```typescript
// Set preferences
const preferences: FarmerPreferences = {
  prioritizeOrganic: farmProfile.isOrganic,
  prioritizeProfit: true,
  prioritizeSustainability: false,
  riskTolerance: 'MEDIUM',
  experienceLevel: 'INTERMEDIATE',
  marketAccess: 'LOCAL'
};

// Get market data (integrate with your market data source)
const marketData = await getMarketData();

// Get recommendations
const recommendations = await cropRecommendationEngine.getRecommendations(
  farmProfile,
  preferences,
  marketData
);

// Use recommendations
const topCrop = recommendations[0];
console.log(`Best crop: ${topCrop.crop.name}`);
console.log(`Overall score: ${topCrop.overallScore}/100`);
console.log(`Expected revenue: $${topCrop.expectedRevenue.min}-${topCrop.expectedRevenue.max}`);
```

### Step 5: Display Biodynamic Context

```typescript
// Get current context
const context = biodynamicCalendar.getBiodynamicContext();

// Display in UI
<div className="biodynamic-widget">
  <h3>Agricultural Consciousness</h3>
  <div className="season">
    <span>{biodynamicCalendar.getSeasonEmoji(context.season)}</span>
    <span>{context.season}</span>
  </div>
  <div className="lunar-phase">
    <span>{biodynamicCalendar.getLunarPhaseEmoji(context.lunarPhase)}</span>
    <span>{context.lunarPhase}</span>
  </div>
  {context.isOptimalPlanting && (
    <div className="optimal-badge">
      ✨ Optimal planting time!
    </div>
  )}
  <div className="operations">
    <h4>Recommended Activities:</h4>
    <ul>
      {context.optimalOperations.map(op => (
        <li key={op}>{op}</li>
      ))}
    </ul>
  </div>
</div>
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { biodynamicCalendar, CropType } from '@/lib/services/biodynamic-calendar.service';
import { cropRecommendationEngine } from '@/lib/services/crop-recommendation.service';

describe('BiodynamicCalendar', () => {
  it('should calculate current season correctly', () => {
    const marchDate = new Date('2025-03-15');
    const season = biodynamicCalendar.getCurrentSeason(marchDate);
    expect(season).toBe('SPRING');
  });

  it('should calculate lunar age', () => {
    const date = new Date('2025-01-15');
    const lunarAge = biodynamicCalendar.calculateLunarAge(date);
    expect(lunarAge).toBeGreaterThanOrEqual(0);
    expect(lunarAge).toBeLessThan(30);
  });

  it('should identify optimal planting dates', () => {
    const isOptimal = biodynamicCalendar.isOptimalPlantingDate(
      CropType.LEAFY,
      new Date()
    );
    expect(typeof isOptimal).toBe('boolean');
  });

  it('should get planting windows', () => {
    const windows = biodynamicCalendar.getOptimalPlantingDays(
      CropType.ROOT,
      14
    );
    expect(Array.isArray(windows)).toBe(true);
    windows.forEach(window => {
      expect(window).toHaveProperty('start');
      expect(window).toHaveProperty('end');
      expect(window).toHaveProperty('score');
      expect(window.score).toBeGreaterThanOrEqual(0);
      expect(window.score).toBeLessThanOrEqual(100);
    });
  });

  it('should calculate biodynamic score', () => {
    const score = biodynamicCalendar.calculateBiodynamicScore({
      followsLunarCalendar: true,
      usesBiodynamicPreparations: true,
      practiceCropRotation: true,
      maintainsBiodiversity: true,
      compostOnSite: true,
      avoidsChemicals: true,
      integratesLivestock: false
    });
    expect(score).toBe(90);
  });
});

describe('CropRecommendationEngine', () => {
  it('should calculate profitability score', () => {
    const crop = {
      averageYieldPerAcre: 25000,
      marketPricePerLb: 2.5,
      inputCostPerAcre: 3500,
      laborHoursPerAcre: 120,
      storageLife: 14,
      organicPremium: 1.4
    };

    const farmProfile = {
      isOrganic: true
    };

    const score = cropRecommendationEngine.calculateProfitabilityScore(
      crop as any,
      farmProfile as any,
      undefined
    );

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should calculate sustainability score', () => {
    const crop = {
      category: 'LEGUME',
      waterRequirements: 'LOW',
      companionPlants: Array(12).fill('plant'),
      inputCostPerAcre: 500,
      pests: ['pest1', 'pest2']
    };

    const farmProfile = {
      waterAvailability: 'LOW',
      isBiodynamic: true,
      isOrganic: true,
      previousCrops: []
    };

    const score = cropRecommendationEngine.calculateSustainabilityScore(
      crop as any,
      farmProfile as any
    );

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

```typescript
describe('Crop Recommendations API', () => {
  it('should return recommendations for authenticated user', async () => {
    const response = await fetch('/api/v1/crops/recommendations?farmId=farm_123', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data.biodynamicContext).toBeDefined();
  });

  it('should return 401 for unauthenticated requests', async () => {
    const response = await fetch('/api/v1/crops/recommendations?farmId=farm_123');
    expect(response.status).toBe(401);
  });
});
```

---

## Performance Considerations

### Caching

Biodynamic calculations and crop recommendations should be cached:

```typescript
// Cache biodynamic context for 1 hour
const context = await cache.wrap(
  'biodynamic-context',
  () => biodynamicCalendar.getBiodynamicContext(),
  3600
);

// Cache crop recommendations for 24 hours
const recommendations = await cache.wrap(
  `recommendations:${farmId}`,
  () => cropRecommendationEngine.getRecommendations(farmProfile, preferences, marketData),
  86400
);
```

### Database Optimization

Store pre-calculated scores in database:

```sql
CREATE TABLE crop_recommendations (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  crop_id VARCHAR(255),
  overall_score INTEGER,
  profitability_score INTEGER,
  sustainability_score INTEGER,
  market_demand_score INTEGER,
  suitability_score INTEGER,
  calculated_at TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_recommendations_farm ON crop_recommendations(farm_id, expires_at);
```

---

## Future Enhancements

### Phase 1 (Completed)
- ✅ Biodynamic calendar calculations
- ✅ Lunar phase tracking
- ✅ Profitability scoring
- ✅ Sustainability scoring
- ✅ Market demand scoring
- ✅ Suitability scoring
- ✅ API endpoints

### Phase 2 (Planned)
- 🔄 Real-time market data integration
- 🔄 Weather data integration
- 🔄 Historical yield data
- 🔄 Machine learning yield predictions
- 🔄 Advanced crop rotation planning
- 🔄 Pest/disease prediction models

### Phase 3 (Future)
- 📋 Mobile app integration
- 📋 Push notifications for optimal planting times
- 📋 Community crop performance sharing
- 📋 Regional market analytics
- 📋 Carbon footprint tracking
- 📋 Biodiversity impact scoring

---

## Support

For questions or issues with biodynamic scoring algorithms:

- **Documentation**: `/docs/BIODYNAMIC_SCORING.md`
- **API Reference**: `/docs/API.md`
- **GitHub Issues**: Create an issue with `[biodynamic]` tag
- **Email**: dev@farmersmarket.com

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Agricultural Intelligence Team