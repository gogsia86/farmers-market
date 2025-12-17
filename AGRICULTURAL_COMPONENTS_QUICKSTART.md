# 🚀 Agricultural Components - Quick Start Guide

**Get started with agricultural components in 5 minutes!**

---

## 📦 Installation

No installation needed! Components are already part of the project.

---

## 🎯 Import Everything You Need

```typescript
import {
  // Components
  SeasonalIndicator,
  HarvestCalendar,
  WeatherWidget,
  SoilHealthMeter,
  BiodynamicBadge,
  BiodynamicBadgeGroup,

  // Types
  Season,
  HarvestEvent,
  WeatherData,
  SoilHealthData,
  CertificationType,

  // Utilities
  getCurrentSeason,
  calculateSoilHealth,
  getCertificationConfig,
} from "@/components/agricultural";
```

---

## 🌱 1. SeasonalIndicator - Show Current Season

```typescript
// Simple usage
<SeasonalIndicator season="SPRING" />

// With temperature
<SeasonalIndicator
  season="SPRING"
  temperature={22}
/>

// Full featured
<SeasonalIndicator
  season={getCurrentSeason()}
  temperature={22}
  variant="default"
  showActivities={true}
  showTemperature={true}
  onSeasonClick={(season) => console.log(season)}
/>
```

**Seasons**: `SPRING`, `SUMMER`, `FALL`, `WINTER`  
**Variants**: `default`, `compact`, `detailed`

---

## 📅 2. HarvestCalendar - Track Harvest Schedule

```typescript
// Create harvest events
const events: HarvestEvent[] = [
  {
    id: "1",
    cropName: "Tomatoes",
    cropType: "VEGETABLE",
    harvestDate: new Date(2024, 6, 15),
    status: "PLANNED",
    quantity: "50kg"
  },
  {
    id: "2",
    cropName: "Apples",
    cropType: "FRUIT",
    harvestDate: new Date(2024, 6, 20),
    status: "IN_PROGRESS"
  }
];

// Use the calendar
<HarvestCalendar
  events={events}
  onEventClick={(event) => console.log("Event:", event)}
  onDateClick={(date) => console.log("Date:", date)}
/>
```

**Crop Types**: `VEGETABLE`, `FRUIT`, `GRAIN`, `HERB`, `OTHER`  
**Status**: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`

---

## ☀️ 3. WeatherWidget - Display Weather

```typescript
// Create weather data
const weather: WeatherData = {
  condition: "CLEAR",
  temperature: 24,
  feelsLike: 26,
  humidity: 65,
  windSpeed: 12,
  sunrise: "06:30",
  sunset: "20:15"
};

// Optional forecast
const forecast: ForecastDay[] = [
  {
    date: new Date(2024, 6, 16),
    condition: "PARTLY_CLOUDY",
    tempHigh: 28,
    tempLow: 18
  }
];

// Use the widget
<WeatherWidget
  weather={weather}
  location="My Farm"
  variant="default"
  showAgriculturalTips={true}
  forecast={forecast}
  onRefresh={() => fetchWeather()}
/>
```

**Conditions**: `CLEAR`, `PARTLY_CLOUDY`, `CLOUDY`, `RAIN`, `DRIZZLE`, `SNOW`, `THUNDERSTORM`, `FOG`, `WINDY`  
**Variants**: `default`, `compact`, `detailed`

---

## 🌍 4. SoilHealthMeter - Soil Metrics

```typescript
// Create soil data
const soilData: SoilHealthData = {
  ph: 6.5,              // pH level
  nitrogen: 38,         // ppm
  phosphorus: 48,       // ppm
  potassium: 195,       // ppm
  organicMatter: 4.2,   // percentage
  moisture: 52,         // percentage
  lastTested: new Date(),
  recommendations: [
    "Maintain current nitrogen levels",
    "Monitor moisture during summer"
  ]
};

// Use the meter
<SoilHealthMeter
  data={soilData}
  variant="detailed"
  showMetrics={true}
  showRecommendations={true}
  onMetricClick={(metric) => console.log(metric)}
/>

// Get health score programmatically
const { status, score } = calculateSoilHealth(soilData);
console.log(`Score: ${score}/100, Status: ${status}`);
```

**Variants**: `default`, `compact`, `detailed`  
**Status**: `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `CRITICAL`

---

## 🏆 5. BiodynamicBadge - Certifications

```typescript
// Single badge
<BiodynamicBadge
  type="ORGANIC"
  size="md"
  variant="filled"
  showVerified={true}
/>

// Multiple badges
<BiodynamicBadgeGroup
  certifications={["ORGANIC", "BIODYNAMIC", "LOCAL", "NON_GMO"]}
  size="md"
  maxVisible={3}
  onBadgeClick={(cert) => console.log(cert)}
/>
```

**Certifications**:

- `ORGANIC` - Certified Organic 🌿
- `BIODYNAMIC` - Biodynamic 🌙
- `REGENERATIVE` - Regenerative 🌱
- `NON_GMO` - Non-GMO 🛡️
- `FAIR_TRADE` - Fair Trade ❤️
- `LOCAL` - Locally Grown ☀️
- `SUSTAINABLE` - Sustainable ♻️
- `PERMACULTURE` - Permaculture ✨
- `PESTICIDE_FREE` - No Pesticides ✓
- `HEIRLOOM` - Heirloom ⭐

**Variants**: `default`, `outlined`, `filled`, `minimal`  
**Sizes**: `sm`, `md`, `lg`, `xl`

---

## 🎨 Complete Example - Farm Dashboard

```typescript
"use client";

import {
  SeasonalIndicator,
  HarvestCalendar,
  WeatherWidget,
  SoilHealthMeter,
  BiodynamicBadgeGroup,
  getCurrentSeason,
  type HarvestEvent,
  type WeatherData,
  type SoilHealthData,
  type CertificationType
} from "@/components/agricultural";

export function FarmDashboard() {
  // Get current season
  const currentSeason = getCurrentSeason();

  // Weather data
  const weather: WeatherData = {
    condition: "CLEAR",
    temperature: 24,
    humidity: 65,
    windSpeed: 12
  };

  // Soil data
  const soilData: SoilHealthData = {
    ph: 6.5,
    nitrogen: 38,
    phosphorus: 48,
    potassium: 195,
    organicMatter: 4.2,
    moisture: 52,
    lastTested: new Date()
  };

  // Harvest events
  const harvestEvents: HarvestEvent[] = [
    {
      id: "1",
      cropName: "Tomatoes",
      cropType: "VEGETABLE",
      harvestDate: new Date(2024, 6, 15),
      status: "PLANNED"
    }
  ];

  // Certifications
  const certifications: CertificationType[] = [
    "ORGANIC",
    "BIODYNAMIC",
    "LOCAL"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Farm Dashboard</h1>

      {/* Season and Weather */}
      <div className="grid md:grid-cols-2 gap-4">
        <SeasonalIndicator
          season={currentSeason}
          temperature={weather.temperature}
        />
        <WeatherWidget
          weather={weather}
          location="My Farm"
          showAgriculturalTips={true}
        />
      </div>

      {/* Soil Health */}
      <SoilHealthMeter
        data={soilData}
        variant="default"
        showMetrics={true}
      />

      {/* Harvest Calendar */}
      <HarvestCalendar
        events={harvestEvents}
        onEventClick={(e) => alert(`Clicked: ${e.cropName}`)}
      />

      {/* Certifications */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Certifications</h2>
        <BiodynamicBadgeGroup
          certifications={certifications}
          size="lg"
        />
      </div>
    </div>
  );
}
```

---

## 🔧 Common Patterns

### Auto-detect season

```typescript
import { getCurrentSeason } from "@/components/agricultural";

const season = getCurrentSeason(); // Returns current season
<SeasonalIndicator season={season} />
```

### Calculate soil health

```typescript
import { calculateSoilHealth } from "@/components/agricultural";

const { status, score } = calculateSoilHealth(soilData);
// status: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL"
// score: 0-100
```

### Validate certification

```typescript
import { isValidCertification } from "@/components/agricultural";

if (isValidCertification("ORGANIC")) {
  // It's valid!
}
```

### Get all certifications

```typescript
import { getAllCertificationTypes } from "@/components/agricultural";

const allCerts = getAllCertificationTypes();
// ["ORGANIC", "BIODYNAMIC", "REGENERATIVE", ...]
```

---

## 📱 Responsive Examples

### Mobile-friendly layout

```typescript
<div className="space-y-4">
  <SeasonalIndicator season="SPRING" variant="compact" />
  <WeatherWidget weather={weather} location="Farm" variant="compact" />
  <SoilHealthMeter data={soilData} variant="compact" />
</div>
```

### Desktop detailed view

```typescript
<div className="grid lg:grid-cols-2 gap-6">
  <SeasonalIndicator season="SPRING" variant="detailed" />
  <WeatherWidget weather={weather} location="Farm" variant="detailed" />
  <div className="lg:col-span-2">
    <SoilHealthMeter data={soilData} variant="detailed" />
  </div>
</div>
```

---

## ⚡ Performance Tips

1. **Use compact variants** for list items
2. **Disable animations** on slow devices: `animated={false}`
3. **Memoize calculations**:
   ```typescript
   const soilScore = useMemo(() => calculateSoilHealth(soilData), [soilData]);
   ```

---

## 🎯 Next Steps

1. ✅ Copy examples above
2. ✅ Replace with your real data
3. ✅ Customize styling with `className` prop
4. ✅ Add event handlers for interactivity
5. ✅ See full docs: `AGRICULTURAL_COMPONENTS_SUMMARY.md`

---

## 📚 More Resources

- **Full Documentation**: `AGRICULTURAL_COMPONENTS_SUMMARY.md`
- **Component README**: `src/components/agricultural/README.md`
- **Tests**: `src/components/agricultural/__tests__/`
- **Type Definitions**: Check IntelliSense in your IDE

---

## 🆘 Need Help?

**Common Issues**:

- Import error? Check path: `@/components/agricultural`
- Type error? Ensure data matches interface
- Date issue? Use `new Date()` not strings

**Still stuck?**

- Check inline code documentation
- Review test examples
- See troubleshooting in full docs

---

**Happy farming! 🌾**

_Status: ✅ Production Ready | Version: 1.0.0_
