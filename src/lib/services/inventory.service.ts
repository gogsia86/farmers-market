/**
 * INVENTORY SERVICE - QUANTUM BUSINESS LOGIC
 * Divine agricultural inventory management
 *
 * @divine-pattern Service layer with complete CRUD operations
 * @agricultural-consciousness Seasonal inventory tracking & batch management
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { database } from "@/lib/database";
import { Season } from "@/types/farm.types";
import {
  AdjustStockInput,
  CreateInventoryInput,
  InsufficientStockError,
  InvalidQuantityError,
  InventoryAlert,
  InventoryId,
  InventoryItem,
  InventoryListParams,
  InventoryMetrics,
  InventoryStatus,
  ProductBatch,
  QuantumInventory,
  ReleaseStockInput,
  ReserveStockInput,
  StockMovement,
  StockMovementType,
  UpdateInventoryInput,
  calculateAvailableQuantity,
  calculateDaysOfSupply,
  calculateDaysUntilExpiry,
  calculateTurnoverRate,
  createInventoryId,
  determineExpiryRisk,
  determineInventoryConsciousness,
  determineInventoryStatus,
  validateReservation,
  validateStockAdjustment,
} from "@/types/inventory.types";

export class InventoryService {
  // ============================================
  // CREATE OPERATIONS
  // ============================================

  /**
   * Create new inventory item with agricultural consciousness
   */
  static async createInventoryItem(
    input: CreateInventoryInput
  ): Promise<InventoryItem> {
    // Validate input
    if (input.quantity < 0) {
      throw new InvalidQuantityError(input.quantity);
    }

    // Check if inventory item already exists for this product/batch/location
    const existing = await database.inventory.findFirst({
      where: {
        productId: input.productId,
        farmId: input.farmId,
        batchId: input.batchId,
        locationId: input.locationId,
      },
    });

    if (existing) {
      // Update existing inventory instead of creating new
      return this.adjustStock({
        inventoryItemId: createInventoryId(existing.id),
        quantityChange: input.quantity,
        type: StockMovementType.HARVEST,
        reason: "New harvest added to existing batch",
        performedBy: input.farmId, // Farm as performer
      });
    }

    // Determine initial status
    const status = determineInventoryStatus(
      input.quantity,
      input.minimumStock,
      input.reorderPoint
    );

    // Create inventory item
    const inventoryItem = await database.inventory.create({
      data: {
        productId: input.productId,
        farmId: input.farmId,
        quantity: input.quantity,
        unit: input.unit,
        reservedQuantity: 0,
        minimumStock: input.minimumStock,
        maximumStock: input.minimumStock * 3, // Default max
        reorderPoint: input.reorderPoint,
        batchId: input.batchId || `BATCH-${Date.now()}`,
        harvestDate: input.harvestDate || new Date(),
        expiryDate: input.expiryDate,
        qualityGrade: input.qualityGrade,
        storageCondition: input.storageCondition,
        storageLocation: "", // Will be populated from location lookup
        locationId: input.locationId,
        status,
        season: this.getCurrentSeason(),
        isOrganic: input.isOrganic,
        certifications: input.certifications || [],
        costPerUnit: input.costPerUnit,
        pricePerUnit: input.pricePerUnit,
        notes: input.notes || null,
      },
    });

    // Create initial stock movement
    await this.recordStockMovement({
      inventoryItemId: createInventoryId(inventoryItem.id),
      type: StockMovementType.HARVEST,
      quantityBefore: 0,
      quantityChange: input.quantity,
      quantityAfter: input.quantity,
      performedBy: input.farmId,
      reason: "Initial harvest",
    });

    // Check for alerts
    await this.checkAndCreateAlerts(inventoryItem as any);

    return inventoryItem as any;
  }

  /**
   * Create product batch for traceability
   */
  static async createBatch(
    productId: string,
    farmId: string,
    harvestDate: Date,
    initialQuantity: number,
    options?: {
      fieldLocation?: string;
      qualityGrade?: string;
      isOrganic?: boolean;
      certifications?: string[];
      expiryDate?: Date;
    }
  ): Promise<ProductBatch> {
    const batchNumber = this.generateBatchNumber(farmId, harvestDate);
    const season = this.getCurrentSeason();

    const batch = await database.productBatch.create({
      data: {
        batchNumber,
        productId,
        farmId,
        harvestDate,
        harvestSeason: season,
        fieldLocation: options?.fieldLocation || null,
        initialQuantity,
        currentQuantity: initialQuantity,
        unit: "lb", // Default unit
        qualityGrade: (options?.qualityGrade as any) || "GRADE_A",
        qualityNotes: null,
        isOrganic: options?.isOrganic || false,
        certifications: options?.certifications || [],
        testResults: [],
        expiryDate: options?.expiryDate || null,
        shelfLifeDays: this.calculateShelfLifeDays(options?.expiryDate),
        status: "ACTIVE",
        notes: null,
      },
    });

    return batch as any;
  }

  // ============================================
  // READ OPERATIONS
  // ============================================

  /**
   * Get inventory item by ID with full quantum consciousness
   */
  static async getInventoryById(
    id: InventoryId
  ): Promise<QuantumInventory | null> {
    const item = await database.inventory.findUnique({
      where: { id },
      include: {
        product: true,
        farm: true,
        location: true,
      },
    });

    if (!item) return null;

    return this.manifestQuantumInventory(item as any);
  }

  /**
   * List inventory items with filters and pagination
   */
  static async listInventory(params: InventoryListParams): Promise<{
    items: InventoryItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const {
      farmId,
      productId,
      status,
      season,
      qualityGrade,
      storageCondition,
      locationId,
      isOrganic,
      lowStock,
      expiringWithinDays,
      search,
      page = 1,
      limit = 20,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = params;

    // Build where clause
    const where: any = {};

    if (farmId) where.farmId = farmId;
    if (productId) where.productId = productId;
    if (status && status.length > 0) where.status = { in: status };
    if (season && season.length > 0) where.season = { in: season };
    if (qualityGrade && qualityGrade.length > 0)
      where.qualityGrade = { in: qualityGrade };
    if (storageCondition && storageCondition.length > 0) {
      where.storageCondition = { in: storageCondition };
    }
    if (locationId) where.locationId = locationId;
    if (isOrganic !== undefined) where.isOrganic = isOrganic;

    if (lowStock) {
      where.OR = [
        { quantity: { lte: database.raw("reorder_point") } },
        { status: InventoryStatus.LOW_STOCK },
      ];
    }

    if (expiringWithinDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiringWithinDays);
      where.expiryDate = {
        not: null,
        lte: futureDate,
        gte: new Date(),
      };
    }

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: "insensitive" } } },
        { batchId: { contains: search, mode: "insensitive" } },
        { storageLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute query
    const [items, total] = await Promise.all([
      database.inventory.findMany({
        where,
        include: {
          product: true,
          farm: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      database.inventory.count({ where }),
    ]);

    return {
      items: items as any,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  /**
   * Get inventory metrics for farm dashboard
   */
  static async getInventoryMetrics(farmId: string): Promise<InventoryMetrics> {
    const items = await database.inventory.findMany({
      where: { farmId },
      include: { product: true },
    });

    // Calculate metrics
    const totalItems = items.length;
    const totalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );

    const byStatus: Record<InventoryStatus, number> = {
      [InventoryStatus.IN_STOCK]: 0,
      [InventoryStatus.LOW_STOCK]: 0,
      [InventoryStatus.OUT_OF_STOCK]: 0,
      [InventoryStatus.RESERVED]: 0,
      [InventoryStatus.DAMAGED]: 0,
      [InventoryStatus.EXPIRED]: 0,
      [InventoryStatus.RECALLED]: 0,
    };

    items.forEach((item) => {
      byStatus[item.status as InventoryStatus]++;
    });

    const lowStockItems = items.filter(
      (item) => item.quantity <= item.reorderPoint
    ).length;

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringWithin7Days = items.filter(
      (item) =>
        item.expiryDate && item.expiryDate <= in7Days && item.expiryDate >= now
    ).length;

    const expiringWithin30Days = items.filter(
      (item) =>
        item.expiryDate && item.expiryDate <= in30Days && item.expiryDate >= now
    ).length;

    // Top products by value
    const topProducts = items
      .map((item) => ({
        productId: item.productId,
        productName: (item as any).product.name,
        quantity: item.quantity,
        value: item.quantity * item.pricePerUnit,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalItems,
      totalValue,
      averageTurnoverRate: 0, // Will be calculated with sales data
      byStatus,
      byQualityGrade: {} as any,
      bySeason: {} as any,
      lowStockItems,
      expiringWithin7Days,
      expiringWithin30Days,
      topProducts,
      slowMovingItems: [],
    };
  }

  // ============================================
  // UPDATE OPERATIONS
  // ============================================

  /**
   * Update inventory item properties
   */
  static async updateInventoryItem(
    id: InventoryId,
    input: UpdateInventoryInput
  ): Promise<InventoryItem> {
    const current = await database.inventory.findUnique({
      where: { id },
    });

    if (!current) {
      throw new Error(`Inventory item ${id} not found`);
    }

    // Update status if quantity changed
    let status = input.status;
    if (input.quantity !== undefined && !status) {
      status = determineInventoryStatus(
        input.quantity,
        input.minimumStock || current.minimumStock,
        input.reorderPoint || current.reorderPoint
      );
    }

    const updated = await database.inventory.update({
      where: { id },
      data: {
        ...input,
        status,
        updatedAt: new Date(),
      },
    });

    // Check for new alerts
    await this.checkAndCreateAlerts(updated as any);

    return updated as any;
  }

  /**
   * Adjust stock quantity with full audit trail
   */
  static async adjustStock(input: AdjustStockInput): Promise<InventoryItem> {
    const item = await database.inventory.findUnique({
      where: { id: input.inventoryItemId },
    });

    if (!item) {
      throw new Error(`Inventory item ${input.inventoryItemId} not found`);
    }

    // Validate adjustment
    const validation = validateStockAdjustment(
      item.quantity,
      input.quantityChange,
      false
    );

    if (!validation.valid) {
      throw new InsufficientStockError(
        Math.abs(input.quantityChange),
        item.quantity,
        input.inventoryItemId
      );
    }

    const newQuantity = item.quantity + input.quantityChange;
    const newStatus = determineInventoryStatus(
      newQuantity,
      item.minimumStock,
      item.reorderPoint
    );

    // Update inventory
    const updated = await database.inventory.update({
      where: { id: input.inventoryItemId },
      data: {
        quantity: newQuantity,
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Record movement
    await this.recordStockMovement({
      inventoryItemId: input.inventoryItemId,
      type: input.type,
      quantityBefore: item.quantity,
      quantityChange: input.quantityChange,
      quantityAfter: newQuantity,
      referenceId: input.referenceId || null,
      referenceType: input.referenceType || null,
      performedBy: input.performedBy,
      reason: input.reason,
      notes: input.notes || null,
    });

    // Check alerts
    await this.checkAndCreateAlerts(updated as any);

    return updated as any;
  }

  /**
   * Reserve stock for order
   */
  static async reserveStock(input: ReserveStockInput): Promise<InventoryItem> {
    const item = await database.inventory.findUnique({
      where: { id: input.inventoryItemId },
    });

    if (!item) {
      throw new Error(`Inventory item ${input.inventoryItemId} not found`);
    }

    const availableQuantity = calculateAvailableQuantity(
      item.quantity,
      item.reservedQuantity
    );

    const validation = validateReservation(availableQuantity, input.quantity);
    if (!validation.valid) {
      throw new InsufficientStockError(
        input.quantity,
        availableQuantity,
        input.inventoryItemId
      );
    }

    // Update reservation
    const updated = await database.inventory.update({
      where: { id: input.inventoryItemId },
      data: {
        reservedQuantity: item.reservedQuantity + input.quantity,
        status: InventoryStatus.RESERVED,
        updatedAt: new Date(),
      },
    });

    // Record movement
    await this.recordStockMovement({
      inventoryItemId: input.inventoryItemId,
      type: StockMovementType.RESERVATION,
      quantityBefore: item.reservedQuantity,
      quantityChange: input.quantity,
      quantityAfter: item.reservedQuantity + input.quantity,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
      performedBy: input.performedBy,
      reason: "Stock reserved for order",
    });

    return updated as any;
  }

  /**
   * Release reserved stock
   */
  static async releaseStock(input: ReleaseStockInput): Promise<InventoryItem> {
    const item = await database.inventory.findUnique({
      where: { id: input.inventoryItemId },
    });

    if (!item) {
      throw new Error(`Inventory item ${input.inventoryItemId} not found`);
    }

    if (input.quantity > item.reservedQuantity) {
      throw new Error(
        `Cannot release ${input.quantity} units. Only ${item.reservedQuantity} reserved.`
      );
    }

    const newReservedQuantity = item.reservedQuantity - input.quantity;
    const newStatus = determineInventoryStatus(
      item.quantity,
      item.minimumStock,
      item.reorderPoint
    );

    const updated = await database.inventory.update({
      where: { id: input.inventoryItemId },
      data: {
        reservedQuantity: newReservedQuantity,
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    await this.recordStockMovement({
      inventoryItemId: input.inventoryItemId,
      type: StockMovementType.RETURN,
      quantityBefore: item.reservedQuantity,
      quantityChange: -input.quantity,
      quantityAfter: newReservedQuantity,
      referenceId: input.referenceId,
      referenceType: "ORDER",
      performedBy: input.performedBy,
      reason: "Reserved stock released",
    });

    return updated as any;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private static async recordStockMovement(
    data: Partial<StockMovement>
  ): Promise<StockMovement> {
    const movement = await database.stockMovement.create({
      data: {
        inventoryItemId: data.inventoryItemId!,
        type: data.type!,
        quantityBefore: data.quantityBefore!,
        quantityChange: data.quantityChange!,
        quantityAfter: data.quantityAfter!,
        referenceId: data.referenceId || null,
        referenceType: data.referenceType || null,
        fromLocationId: data.fromLocationId || null,
        toLocationId: data.toLocationId || null,
        performedBy: data.performedBy!,
        reason: data.reason || null,
        notes: data.notes || null,
      },
    });

    return movement as any;
  }

  private static async checkAndCreateAlerts(
    item: InventoryItem
  ): Promise<void> {
    const alerts: Array<Omit<InventoryAlert, "id" | "createdAt">> = [];

    // Low stock alert
    if (item.quantity <= item.reorderPoint) {
      alerts.push({
        inventoryItemId: item.id as any,
        farmId: item.farmId,
        productId: item.productId,
        type: item.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
        severity: item.quantity === 0 ? "CRITICAL" : "WARNING",
        message: `${item.quantity === 0 ? "Out of stock" : "Low stock"} - Current: ${item.quantity}, Reorder point: ${item.reorderPoint}`,
        currentValue: item.quantity,
        thresholdValue: item.reorderPoint,
        isResolved: false,
        resolvedAt: null,
        resolvedBy: null,
      });
    }

    // Expiry alerts
    if (item.expiryDate) {
      const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
      if (daysUntilExpiry !== null) {
        if (daysUntilExpiry <= 0) {
          alerts.push({
            inventoryItemId: item.id as any,
            farmId: item.farmId,
            productId: item.productId,
            type: "EXPIRED",
            severity: "CRITICAL",
            message: `Product expired on ${item.expiryDate.toISOString().split("T")[0]}`,
            currentValue: daysUntilExpiry,
            thresholdValue: 0,
            isResolved: false,
            resolvedAt: null,
            resolvedBy: null,
          });
        } else if (daysUntilExpiry <= 7) {
          alerts.push({
            inventoryItemId: item.id as any,
            farmId: item.farmId,
            productId: item.productId,
            type: "EXPIRING_SOON",
            severity: daysUntilExpiry <= 3 ? "CRITICAL" : "WARNING",
            message: `Product expiring in ${daysUntilExpiry} days`,
            currentValue: daysUntilExpiry,
            thresholdValue: 7,
            isResolved: false,
            resolvedAt: null,
            resolvedBy: null,
          });
        }
      }
    }

    // Create alerts
    if (alerts.length > 0) {
      await database.inventoryAlert.createMany({
        data: alerts as any,
        skipDuplicates: true,
      });
    }
  }

  private static manifestQuantumInventory(item: any): QuantumInventory {
    const availableQuantity = calculateAvailableQuantity(
      item.quantity,
      item.reservedQuantity
    );

    const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
    const expiryRisk = determineExpiryRisk(daysUntilExpiry);
    const daysOfSupply = calculateDaysOfSupply(item.quantity, 5); // Assuming 5 units/day
    const turnoverRate = calculateTurnoverRate(50, item.quantity, 30); // Mock data

    const consciousness = determineInventoryConsciousness(
      item.status,
      turnoverRate,
      expiryRisk
    );

    return {
      consciousness,
      identity: {
        id: item.id,
        productName: item.product.name,
        farmName: item.farm.name,
        sku: item.batchId,
      },
      quantumState: {
        currentQuantity: item.quantity,
        availableQuantity,
        reservedQuantity: item.reservedQuantity,
        inTransitQuantity: 0,
        projectedQuantity: item.quantity,
      },
      agriculturalContext: {
        season: item.season,
        harvestDate: item.harvestDate,
        daysUntilExpiry,
        qualityGrade: item.qualityGrade,
        isOrganic: item.isOrganic,
      },
      storageState: {
        location: item.location,
        condition: item.storageCondition,
        temperature: null,
        humidity: null,
      },
      financialState: {
        totalValue: item.quantity * item.pricePerUnit,
        costPerUnit: item.costPerUnit,
        pricePerUnit: item.pricePerUnit,
        potentialRevenue: availableQuantity * item.pricePerUnit,
      },
      alerts: [],
      recentMovements: [],
      insights: {
        daysOfSupply,
        reorderRecommended: item.quantity <= item.reorderPoint,
        expiryRisk,
        turnoverRate,
      },
    };
  }

  private static getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "SPRING";
    if (month >= 6 && month <= 8) return "SUMMER";
    if (month >= 9 && month <= 11) return "AUTUMN";
    return "WINTER";
  }

  private static generateBatchNumber(farmId: string, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const farmCode = farmId.substring(0, 4).toUpperCase();
    return `${farmCode}-${year}${month}${day}-${Date.now().toString().slice(-4)}`;
  }

  private static calculateShelfLifeDays(expiryDate?: Date): number | null {
    if (!expiryDate) return null;
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
