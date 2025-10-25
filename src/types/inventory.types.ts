/**
 * INVENTORY SYSTEM - QUANTUM TYPE DEFINITIONS
 * Divine agricultural inventory consciousness
 *
 * @divine-pattern Holographic types containing whole system intelligence
 * @agricultural-consciousness Seasonal inventory tracking
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { Season } from "./farm.types";

// ============================================
// BRANDED TYPES - Quantum Identity
// ============================================

export type InventoryId = string & { readonly brand: unique symbol };
export type StockItemId = string & { readonly brand: unique symbol };
export type BatchId = string & { readonly brand: unique symbol };
export type LocationId = string & { readonly brand: unique symbol };

export function createInventoryId(id: string): InventoryId {
  return id as InventoryId;
}

export function createStockItemId(id: string): StockItemId {
  return id as StockItemId;
}

export function createBatchId(id: string): BatchId {
  return id as BatchId;
}

export function createLocationId(id: string): LocationId {
  return id as LocationId;
}

// ============================================
// INVENTORY STATUS - Quantum States
// ============================================

export enum InventoryStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  RESERVED = "RESERVED",
  DAMAGED = "DAMAGED",
  EXPIRED = "EXPIRED",
  RECALLED = "RECALLED",
}

export enum StockMovementType {
  PURCHASE = "PURCHASE",
  SALE = "SALE",
  RETURN = "RETURN",
  ADJUSTMENT = "ADJUSTMENT",
  HARVEST = "HARVEST",
  SPOILAGE = "SPOILAGE",
  TRANSFER = "TRANSFER",
  RESERVATION = "RESERVATION",
}

export enum StorageCondition {
  REFRIGERATED = "REFRIGERATED",
  FROZEN = "FROZEN",
  ROOM_TEMPERATURE = "ROOM_TEMPERATURE",
  CONTROLLED_ATMOSPHERE = "CONTROLLED_ATMOSPHERE",
  OUTDOOR = "OUTDOOR",
}

export enum QualityGrade {
  PREMIUM = "PREMIUM",
  GRADE_A = "GRADE_A",
  GRADE_B = "GRADE_B",
  GRADE_C = "GRADE_C",
  SECONDS = "SECONDS",
  PROCESSING = "PROCESSING",
}

// ============================================
// INVENTORY ITEM - Core Entity
// ============================================

export interface InventoryItem {
  id: InventoryId;
  productId: string;
  farmId: string;

  // Quantity tracking
  quantity: number;
  unit: string; // lb, oz, bunch, each, etc.
  reservedQuantity: number;
  availableQuantity: number; // quantity - reservedQuantity
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;

  // Batch information
  batchId: BatchId;
  harvestDate: Date;
  expiryDate: Date | null;

  // Quality & condition
  qualityGrade: QualityGrade;
  storageCondition: StorageCondition;
  storageLocation: string;
  locationId: LocationId;

  // Status
  status: InventoryStatus;

  // Agricultural consciousness
  season: Season;
  isOrganic: boolean;
  certifications: string[];

  // Pricing
  costPerUnit: number;
  pricePerUnit: number;

  // Metadata
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// STOCK MOVEMENT - Transaction History
// ============================================

export interface StockMovement {
  id: string;
  inventoryItemId: InventoryId;
  type: StockMovementType;

  // Quantity changes
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;

  // Transaction details
  referenceId: string | null; // Order ID, Purchase ID, etc.
  referenceType: string | null; // 'order', 'purchase', 'adjustment'

  // Location tracking
  fromLocationId: LocationId | null;
  toLocationId: LocationId | null;

  // User tracking
  performedBy: string; // User ID
  reason: string | null;

  // Metadata
  notes: string | null;
  createdAt: Date;
}

// ============================================
// STORAGE LOCATION - Warehouse Management
// ============================================

export interface StorageLocation {
  id: LocationId;
  farmId: string;

  // Location details
  name: string;
  code: string; // A1, B2, COOLER-1, etc.
  type: "WAREHOUSE" | "COOLER" | "FREEZER" | "FIELD" | "SHELF";

  // Physical details
  capacity: number;
  currentOccupancy: number;
  unit: string;

  // Conditions
  temperature: number | null; // Celsius
  humidity: number | null; // Percentage
  storageCondition: StorageCondition;

  // Status
  isActive: boolean;

  // Metadata
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BATCH TRACKING - Agricultural Traceability
// ============================================

export interface ProductBatch {
  id: BatchId;
  batchNumber: string;
  productId: string;
  farmId: string;

  // Harvest information
  harvestDate: Date;
  harvestSeason: Season;
  fieldLocation: string | null;

  // Quantity tracking
  initialQuantity: number;
  currentQuantity: number;
  unit: string;

  // Quality information
  qualityGrade: QualityGrade;
  qualityNotes: string | null;

  // Certifications & compliance
  isOrganic: boolean;
  certifications: string[];
  testResults: BatchTestResult[];

  // Expiry & shelf life
  expiryDate: Date | null;
  shelfLifeDays: number | null;

  // Status
  status: "ACTIVE" | "DEPLETED" | "RECALLED" | "EXPIRED";

  // Metadata
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchTestResult {
  testType: string;
  testDate: Date;
  result: "PASS" | "FAIL" | "PENDING";
  value: string | null;
  notes: string | null;
}

// ============================================
// INVENTORY ALERT - Monitoring & Notifications
// ============================================

export interface InventoryAlert {
  id: string;
  inventoryItemId: InventoryId;
  farmId: string;
  productId: string;

  // Alert details
  type: "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRING_SOON" | "EXPIRED" | "DAMAGED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;

  // Threshold information
  currentValue: number;
  thresholdValue: number;

  // Status
  isResolved: boolean;
  resolvedAt: Date | null;
  resolvedBy: string | null;

  // Metadata
  createdAt: Date;
}

// ============================================
// QUANTUM INVENTORY - Holographic Entity
// ============================================

export interface QuantumInventory {
  // Core identity
  readonly consciousness: InventoryConsciousness;
  readonly identity: {
    id: InventoryId;
    productName: string;
    farmName: string;
    sku: string;
  };

  // Quantum state
  readonly quantumState: {
    currentQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    inTransitQuantity: number;
    projectedQuantity: number; // ML prediction
  };

  // Agricultural awareness
  readonly agriculturalContext: {
    season: Season;
    harvestDate: Date;
    daysUntilExpiry: number | null;
    qualityGrade: QualityGrade;
    isOrganic: boolean;
  };

  // Storage consciousness
  readonly storageState: {
    location: StorageLocation;
    condition: StorageCondition;
    temperature: number | null;
    humidity: number | null;
  };

  // Financial awareness
  readonly financialState: {
    totalValue: number;
    costPerUnit: number;
    pricePerUnit: number;
    potentialRevenue: number;
  };

  // Alert system
  readonly alerts: InventoryAlert[];

  // Movement history
  readonly recentMovements: StockMovement[];

  // Predictions & insights
  readonly insights: {
    daysOfSupply: number;
    reorderRecommended: boolean;
    expiryRisk: "LOW" | "MEDIUM" | "HIGH";
    turnoverRate: number; // times per month
  };
}

export type InventoryConsciousness =
  | "ABUNDANT" // Well-stocked, no concerns
  | "FLOWING" // Normal turnover, healthy
  | "LOW" // Below reorder point
  | "CRITICAL" // Out of stock or expiring
  | "STAGNANT" // Slow-moving inventory
  | "OPTIMAL"; // Perfect balance

// ============================================
// INVENTORY OPERATIONS - Service Layer Types
// ============================================

export interface CreateInventoryInput {
  productId: string;
  farmId: string;
  quantity: number;
  unit: string;
  batchId?: string;
  harvestDate?: Date;
  expiryDate?: Date | null;
  qualityGrade: QualityGrade;
  storageCondition: StorageCondition;
  locationId: string;
  minimumStock: number;
  reorderPoint: number;
  costPerUnit: number;
  pricePerUnit: number;
  isOrganic: boolean;
  certifications?: string[];
  notes?: string;
}

export interface UpdateInventoryInput {
  quantity?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  qualityGrade?: QualityGrade;
  storageCondition?: StorageCondition;
  locationId?: string;
  costPerUnit?: number;
  pricePerUnit?: number;
  notes?: string;
  status?: InventoryStatus;
}

export interface AdjustStockInput {
  inventoryItemId: InventoryId;
  quantityChange: number;
  type: StockMovementType;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  performedBy: string;
  notes?: string;
}

export interface TransferStockInput {
  inventoryItemId: InventoryId;
  quantity: number;
  fromLocationId: LocationId;
  toLocationId: LocationId;
  performedBy: string;
  reason?: string;
  notes?: string;
}

export interface ReserveStockInput {
  inventoryItemId: InventoryId;
  quantity: number;
  referenceId: string; // Order ID
  referenceType: "ORDER";
  performedBy: string;
}

export interface ReleaseStockInput {
  inventoryItemId: InventoryId;
  quantity: number;
  referenceId: string;
  performedBy: string;
}

// ============================================
// INVENTORY FILTERS - Query Optimization
// ============================================

export interface InventoryFilters {
  farmId?: string;
  productId?: string;
  status?: InventoryStatus[];
  season?: Season[];
  qualityGrade?: QualityGrade[];
  storageCondition?: StorageCondition[];
  locationId?: string;
  isOrganic?: boolean;
  lowStock?: boolean; // quantity <= reorderPoint
  expiringWithinDays?: number;
  search?: string;
}

export interface InventoryListParams extends InventoryFilters {
  page?: number;
  limit?: number;
  sortBy?: "quantity" | "expiryDate" | "harvestDate" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// ============================================
// INVENTORY ANALYTICS - Business Intelligence
// ============================================

export interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  averageTurnoverRate: number;

  byStatus: Record<InventoryStatus, number>;
  byQualityGrade: Record<QualityGrade, number>;
  bySeason: Record<Season, number>;

  lowStockItems: number;
  expiringWithin7Days: number;
  expiringWithin30Days: number;

  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    value: number;
  }>;

  slowMovingItems: Array<{
    inventoryId: InventoryId;
    productName: string;
    daysInStock: number;
    quantity: number;
  }>;
}

export interface StockMovementSummary {
  period: "day" | "week" | "month";
  totalMovements: number;

  byType: Record<StockMovementType, number>;

  totalQuantityIn: number;
  totalQuantityOut: number;
  netChange: number;

  valueIn: number;
  valueOut: number;
  netValue: number;
}

// ============================================
// HELPER FUNCTIONS - Quantum Utilities
// ============================================

export function calculateAvailableQuantity(
  quantity: number,
  reservedQuantity: number
): number {
  return Math.max(0, quantity - reservedQuantity);
}

export function determineInventoryStatus(
  quantity: number,
  minimumStock: number,
  reorderPoint: number
): InventoryStatus {
  if (quantity <= 0) return InventoryStatus.OUT_OF_STOCK;
  if (quantity <= reorderPoint) return InventoryStatus.LOW_STOCK;
  if (quantity < minimumStock) return InventoryStatus.LOW_STOCK;
  return InventoryStatus.IN_STOCK;
}

export function calculateDaysUntilExpiry(
  expiryDate: Date | null
): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function determineExpiryRisk(
  daysUntilExpiry: number | null
): "LOW" | "MEDIUM" | "HIGH" {
  if (daysUntilExpiry === null) return "LOW";
  if (daysUntilExpiry <= 3) return "HIGH";
  if (daysUntilExpiry <= 7) return "MEDIUM";
  return "LOW";
}

export function calculateDaysOfSupply(
  currentQuantity: number,
  averageDailySales: number
): number {
  if (averageDailySales <= 0) return Infinity;
  return Math.floor(currentQuantity / averageDailySales);
}

export function determineInventoryConsciousness(
  status: InventoryStatus,
  turnoverRate: number,
  expiryRisk: "LOW" | "MEDIUM" | "HIGH"
): InventoryConsciousness {
  if (status === InventoryStatus.OUT_OF_STOCK || expiryRisk === "HIGH") {
    return "CRITICAL";
  }
  if (status === InventoryStatus.LOW_STOCK) {
    return "LOW";
  }
  if (turnoverRate < 0.5) {
    return "STAGNANT";
  }
  if (turnoverRate >= 2 && expiryRisk === "LOW") {
    return "OPTIMAL";
  }
  if (turnoverRate >= 1) {
    return "FLOWING";
  }
  return "ABUNDANT";
}

export function calculateTurnoverRate(
  soldQuantity: number,
  averageInventory: number,
  periodDays: number
): number {
  if (averageInventory <= 0) return 0;
  const monthlyFactor = 30 / periodDays;
  return (soldQuantity / averageInventory) * monthlyFactor;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateQuantity(quantity: number): boolean {
  return quantity >= 0 && Number.isFinite(quantity);
}

export function validateStockAdjustment(
  currentQuantity: number,
  adjustment: number,
  allowNegative: boolean = false
): { valid: boolean; error?: string } {
  if (!validateQuantity(Math.abs(adjustment))) {
    return { valid: false, error: "Invalid adjustment quantity" };
  }

  const newQuantity = currentQuantity + adjustment;
  if (!allowNegative && newQuantity < 0) {
    return {
      valid: false,
      error: `Insufficient stock. Current: ${currentQuantity}, Requested: ${Math.abs(adjustment)}`,
    };
  }

  return { valid: true };
}

export function validateReservation(
  availableQuantity: number,
  requestedQuantity: number
): { valid: boolean; error?: string } {
  if (!validateQuantity(requestedQuantity)) {
    return { valid: false, error: "Invalid reservation quantity" };
  }

  if (requestedQuantity > availableQuantity) {
    return {
      valid: false,
      error: `Insufficient available stock. Available: ${availableQuantity}, Requested: ${requestedQuantity}`,
    };
  }

  return { valid: true };
}

// ============================================
// ERROR CLASSES - Enlightening Failures
// ============================================

export class InsufficientStockError extends Error {
  constructor(
    public readonly requested: number,
    public readonly available: number,
    public readonly inventoryId: InventoryId
  ) {
    super(
      `Insufficient stock for inventory ${inventoryId}. ` +
        `Requested: ${requested}, Available: ${available}`
    );
    this.name = "InsufficientStockError";
  }
}

export class InvalidQuantityError extends Error {
  constructor(public readonly quantity: number) {
    super(
      `Invalid quantity: ${quantity}. Must be a non-negative finite number.`
    );
    this.name = "InvalidQuantityError";
  }
}

export class ExpiredInventoryError extends Error {
  constructor(
    public readonly inventoryId: InventoryId,
    public readonly expiryDate: Date
  ) {
    super(
      `Inventory ${inventoryId} has expired on ${expiryDate.toISOString()}`
    );
    this.name = "ExpiredInventoryError";
  }
}

export class LocationCapacityError extends Error {
  constructor(
    public readonly locationId: LocationId,
    public readonly capacity: number,
    public readonly currentOccupancy: number,
    public readonly requestedSpace: number
  ) {
    super(
      `Location ${locationId} capacity exceeded. ` +
        `Capacity: ${capacity}, Current: ${currentOccupancy}, Requested: ${requestedSpace}`
    );
    this.name = "LocationCapacityError";
  }
}
