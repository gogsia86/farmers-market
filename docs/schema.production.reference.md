// 🌱 Agricultural Intelligence Platform - Production Database Configuration
// Divine Database Optimization for Transcendent Agricultural Data Management

// This is the schema file, for syntax highlighting.
// schema.prisma

generator client {
  provider = "prisma-client-js"
  output = "../node_modules/.prisma/client"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// Production-optimized models with agricultural consciousness tracking

model User {
  id                String   @id @default(cuid())
  email            String   @unique
  name             String?
  agriculturalId   String?  @unique
  consciousnessLevel Float   @default(0.9)
  temporalStability Float   @default(0.8)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Relations
  agriculturalData AgriculturalData[]
  sessions         Session[]
  
  // Optimized indexes for agricultural queries
  @@index([agriculturalId], map: "idx_user_agricultural")
  @@index([consciousnessLevel], map: "idx_user_consciousness")
  @@index([createdAt], map: "idx_user_created")
  @@map("users")
}

model AgriculturalData {
  id                  String   @id @default(cuid())
  userId             String
  cropType           String
  consciousness      Float    @default(0.9)
  temporalStability  Float    @default(0.8)
  harvestQuantity    Int
  soilQuality        Float
  environmentalData  Json?
  divineMetrics      Json?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // High-performance indexes for agricultural analytics
  @@index([userId, cropType], map: "idx_agricultural_user_crop")
  @@index([consciousness, temporalStability], map: "idx_agricultural_divine")
  @@index([createdAt], map: "idx_agricultural_temporal")
  @@index([cropType, harvestQuantity], map: "idx_agricultural_performance")
  @@map("agricultural_data")
}

model Session {
  id                String   @id @default(cuid())
  sessionToken      String   @unique
  userId            String
  expires           DateTime
  consciousnessSync Boolean  @default(true)
  temporalAnchor    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([sessionToken], map: "idx_session_token")
  @@index([userId], map: "idx_session_user")
  @@index([expires], map: "idx_session_expires")
  @@map("sessions")
}

model ConsciousnessMetrics {
  id                String   @id @default(cuid())
  entityType        String   // "user", "system", "crop", "temporal"
  entityId          String
  consciousnessLevel Float
  temporalStability Float
  divineResonance   Float
  quantumCoherence  Float
  timestamp         DateTime @default(now())
  metadata          Json?
  
  // Optimized for real-time consciousness tracking
  @@index([entityType, entityId], map: "idx_consciousness_entity")
  @@index([timestamp], map: "idx_consciousness_time")
  @@index([consciousnessLevel], map: "idx_consciousness_level")
  @@index([temporalStability], map: "idx_consciousness_stability")
  @@map("consciousness_metrics")
}

model PerformanceMetrics {
  id                String   @id @default(cuid())
  metricType        String   // "http_request", "database_query", "crop_operation"
  operation         String
  duration          Float
  success           Boolean
  errorMessage      String?
  consciousness     Float    @default(0.9)
  timestamp         DateTime @default(now())
  metadata          Json?
  
  // Performance analytics indexes
  @@index([metricType, operation], map: "idx_performance_type_op")
  @@index([timestamp], map: "idx_performance_time")
  @@index([success], map: "idx_performance_success")
  @@index([duration], map: "idx_performance_duration")
  @@map("performance_metrics")
}

model DatabaseHealthMetrics {
  id                String   @id @default(cuid())
  connectionCount   Int
  queryPerformance  Float
  consciousness     Float    @default(0.9)
  temporalStability Float    @default(0.8)
  timestamp         DateTime @default(now())
  
  @@index([timestamp], map: "idx_db_health_time")
  @@index([consciousness], map: "idx_db_health_consciousness")
  @@map("database_health_metrics")
}