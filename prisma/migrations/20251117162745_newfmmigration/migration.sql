-- CreateEnum
CREATE TYPE "LunarPhase" AS ENUM ('NEW_MOON', 'WAXING_CRESCENT', 'FIRST_QUARTER', 'WAXING_GIBBOUS', 'FULL_MOON', 'WANING_GIBBOUS', 'LAST_QUARTER', 'WANING_CRESCENT');

-- CreateEnum
CREATE TYPE "SoilType" AS ENUM ('CLAY', 'SANDY', 'LOAM', 'SILT', 'PEATY', 'CHALKY', 'MIXED');

-- CreateEnum
CREATE TYPE "DrainageLevel" AS ENUM ('EXCELLENT', 'GOOD', 'MODERATE', 'POOR', 'VERY_POOR');

-- CreateEnum
CREATE TYPE "CompactionLevel" AS ENUM ('NONE', 'LOW', 'MODERATE', 'HIGH', 'SEVERE');

-- CreateEnum
CREATE TYPE "WeatherCondition" AS ENUM ('CLEAR', 'PARTLY_CLOUDY', 'CLOUDY', 'OVERCAST', 'LIGHT_RAIN', 'RAIN', 'HEAVY_RAIN', 'THUNDERSTORM', 'SNOW', 'SLEET', 'FOG', 'WINDY');

-- CreateEnum
CREATE TYPE "CropFamily" AS ENUM ('BRASSICAS', 'LEGUMES', 'NIGHTSHADES', 'CUCURBITS', 'ALLIUMS', 'GRASSES', 'UMBELLIFERS', 'LEAFY_GREENS', 'ROOT_VEGETABLES', 'OTHER');

-- CreateEnum
CREATE TYPE "HarvestQuality" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'FAILED');

-- CreateEnum
CREATE TYPE "HarvestStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateTable
CREATE TABLE "biodynamic_calendar" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "lunarPhase" "LunarPhase" NOT NULL,
    "lunarDay" INTEGER NOT NULL,
    "moonRiseTime" TIMESTAMP(3),
    "moonSetTime" TIMESTAMP(3),
    "season" "Season" NOT NULL,
    "astronomicalDate" TIMESTAMP(3) NOT NULL,
    "plantingFavorability" INTEGER NOT NULL DEFAULT 0,
    "harvestFavorability" INTEGER NOT NULL DEFAULT 0,
    "soilWorkFavorability" INTEGER NOT NULL DEFAULT 0,
    "planetaryAlignment" JSONB,
    "recommendedActivities" TEXT[],
    "avoidActivities" TEXT[],
    "agriculturalConsciousness" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biodynamic_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soil_analyses" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "fieldName" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "pH" DECIMAL(4,2) NOT NULL,
    "nitrogen" DECIMAL(5,2) NOT NULL,
    "phosphorus" DECIMAL(5,2) NOT NULL,
    "potassium" DECIMAL(5,2) NOT NULL,
    "organicMatter" DECIMAL(5,2) NOT NULL,
    "soilType" "SoilType" NOT NULL,
    "drainage" "DrainageLevel" NOT NULL,
    "compaction" "CompactionLevel" NOT NULL,
    "microbialActivity" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "earthwormCount" INTEGER,
    "fungalPresence" DECIMAL(3,2),
    "previousCrops" JSONB,
    "soilHistory" JSONB,
    "amendments" TEXT[],
    "recommendedCrops" TEXT[],
    "analyzedBy" VARCHAR(255),
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAnalysisDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "temperature" DECIMAL(5,2) NOT NULL,
    "feelsLike" DECIMAL(5,2),
    "tempMin" DECIMAL(5,2),
    "tempMax" DECIMAL(5,2),
    "humidity" INTEGER NOT NULL,
    "precipitation" DECIMAL(6,2),
    "precipitationProb" INTEGER,
    "windSpeed" DECIMAL(5,2),
    "windDirection" INTEGER,
    "condition" "WeatherCondition" NOT NULL,
    "cloudCover" INTEGER,
    "uvIndex" INTEGER,
    "visibility" DECIMAL(5,2),
    "growingDegreeDay" DECIMAL(5,2),
    "evapotranspiration" DECIMAL(5,2),
    "soilMoisture" DECIMAL(3,2),
    "frostRisk" BOOLEAN NOT NULL DEFAULT false,
    "heatStressRisk" BOOLEAN NOT NULL DEFAULT false,
    "source" VARCHAR(50) NOT NULL DEFAULT 'API',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_rotations" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "fieldName" VARCHAR(255) NOT NULL,
    "rotationCycle" INTEGER NOT NULL,
    "currentYear" INTEGER NOT NULL,
    "currentCrop" VARCHAR(100) NOT NULL,
    "currentCropFamily" "CropFamily" NOT NULL,
    "plantedAt" TIMESTAMP(3) NOT NULL,
    "expectedHarvest" TIMESTAMP(3),
    "cropHistory" JSONB NOT NULL,
    "plannedRotations" JSONB NOT NULL,
    "coverCropPlanned" BOOLEAN NOT NULL DEFAULT false,
    "coverCropType" VARCHAR(100),
    "restPeriod" BOOLEAN NOT NULL DEFAULT false,
    "followsBiodynamic" BOOLEAN NOT NULL DEFAULT false,
    "biodynamicScore" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "nextRecommendedCrop" VARCHAR(100),
    "soilBenefits" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_rotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvest_schedules" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "productId" TEXT,
    "cropName" VARCHAR(255) NOT NULL,
    "cropVariety" VARCHAR(255),
    "fieldName" VARCHAR(255) NOT NULL,
    "plantedAt" TIMESTAMP(3) NOT NULL,
    "plantedQuantity" DECIMAL(10,2),
    "plantedUnit" VARCHAR(50),
    "expectedHarvestStart" TIMESTAMP(3) NOT NULL,
    "expectedHarvestEnd" TIMESTAMP(3),
    "actualHarvestStart" TIMESTAMP(3),
    "actualHarvestEnd" TIMESTAMP(3),
    "harvestConfidence" DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    "predictedYield" DECIMAL(10,2),
    "predictedYieldUnit" VARCHAR(50),
    "actualYield" DECIMAL(10,2),
    "actualYieldUnit" VARCHAR(50),
    "harvestQuality" "HarvestQuality",
    "optimalLunarPhase" "LunarPhase",
    "seasonalAlignment" "Season" NOT NULL,
    "biodynamicTiming" BOOLEAN NOT NULL DEFAULT false,
    "estimatedLaborHours" DECIMAL(6,2),
    "actualLaborHours" DECIMAL(6,2),
    "laborersNeeded" INTEGER,
    "status" "HarvestStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "challenges" TEXT[],
    "successes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "harvest_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "biodynamic_calendar_farmId_idx" ON "biodynamic_calendar"("farmId");

-- CreateIndex
CREATE INDEX "biodynamic_calendar_season_idx" ON "biodynamic_calendar"("season");

-- CreateIndex
CREATE INDEX "biodynamic_calendar_lunarPhase_idx" ON "biodynamic_calendar"("lunarPhase");

-- CreateIndex
CREATE UNIQUE INDEX "biodynamic_calendar_farmId_astronomicalDate_key" ON "biodynamic_calendar"("farmId", "astronomicalDate");

-- CreateIndex
CREATE INDEX "soil_analyses_farmId_idx" ON "soil_analyses"("farmId");

-- CreateIndex
CREATE INDEX "soil_analyses_fieldName_idx" ON "soil_analyses"("fieldName");

-- CreateIndex
CREATE INDEX "soil_analyses_analysisDate_idx" ON "soil_analyses"("analysisDate");

-- CreateIndex
CREATE INDEX "weather_data_farmId_idx" ON "weather_data"("farmId");

-- CreateIndex
CREATE INDEX "weather_data_recordedAt_idx" ON "weather_data"("recordedAt");

-- CreateIndex
CREATE INDEX "crop_rotations_farmId_idx" ON "crop_rotations"("farmId");

-- CreateIndex
CREATE INDEX "crop_rotations_currentCropFamily_idx" ON "crop_rotations"("currentCropFamily");

-- CreateIndex
CREATE UNIQUE INDEX "crop_rotations_farmId_fieldName_key" ON "crop_rotations"("farmId", "fieldName");

-- CreateIndex
CREATE INDEX "harvest_schedules_farmId_idx" ON "harvest_schedules"("farmId");

-- CreateIndex
CREATE INDEX "harvest_schedules_productId_idx" ON "harvest_schedules"("productId");

-- CreateIndex
CREATE INDEX "harvest_schedules_status_idx" ON "harvest_schedules"("status");

-- CreateIndex
CREATE INDEX "harvest_schedules_expectedHarvestStart_idx" ON "harvest_schedules"("expectedHarvestStart");

-- CreateIndex
CREATE INDEX "harvest_schedules_seasonalAlignment_idx" ON "harvest_schedules"("seasonalAlignment");

-- AddForeignKey
ALTER TABLE "biodynamic_calendar" ADD CONSTRAINT "biodynamic_calendar_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_analyses" ADD CONSTRAINT "soil_analyses_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_rotations" ADD CONSTRAINT "crop_rotations_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_schedules" ADD CONSTRAINT "harvest_schedules_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_schedules" ADD CONSTRAINT "harvest_schedules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
