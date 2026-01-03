// ============================================
// SPRINT 5: SETTINGS SERVICE
// ============================================
// Comprehensive settings management service with:
// - Multi-level settings (user/farm/system)
// - Settings inheritance
// - Redis caching
// - Type-safe operations
// - Validation
// - Agricultural consciousness
//
// NOTE: This is a STUB file that needs full reconstruction.
// Original file was corrupted during refactoring attempt.
// See TEST_REMEDIATION_SESSION_2_FINAL.md for details.

import { getRedisCache, type RedisCacheService } from "@/lib/cache/redis";
import { database } from "@/lib/database";
import type {
  BusinessHoursData,
  FarmSettingsData,
  NotificationPreferences,
  SettingsValidationResult,
  SystemSettingData,
  UpdateFarmSettingsRequest,
  UpdateSystemSettingRequest,
  UpdateUserSettingsRequest,
  UserSettingsData
} from "@/types/settings";
import {
  buildSettingsCacheKey,
  isValidCommunicationFrequency,
  isValidContactMethod,
  isValidDayOfWeek,
  isValidDistanceUnit,
  isValidProfileVisibility,
  isValidTheme,
  isValidTimeString,
  isValidTimezone
} from "@/types/settings";

const CACHE_TTL = 3600; // 1 hour for user/farm settings
const SYSTEM_CACHE_TTL = 86400; // 24 hours for system settings

/**
 * Settings Service - Divine Agricultural Settings Management
 *
 * Manages user preferences, farm configuration, and system settings
 * with proper inheritance, caching, and validation.
 */
export class SettingsService {
  private readonly cache: RedisCacheService;

  constructor(cache?: RedisCacheService) {
    // Use provided cache or default singleton (enables dependency injection for testing)
    this.cache = cache || getRedisCache();
  }

  // ============================================
  // USER SETTINGS
  // ============================================

  /**
   * Get user settings with caching
   * @param userId - User ID
   * @returns User settings or null if not found
   */
  async getUserSettings(userId: string): Promise<UserSettingsData | null> {
    // Check cache first
    const cacheKey = buildSettingsCacheKey("user", userId);
    const cached = await this.cache.get<UserSettingsData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const settings = await database.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      return this.createDefaultUserSettings(userId);
    }

    // Transform to UserSettingsData
    const userSettings: UserSettingsData = {
      notifications:
        (settings.notificationPreferences as any) ||
        this.getDefaultNotificationPreferences(),
      display: {
        theme: settings.theme as any,
        language: settings.language,
        timezone: settings.timezone,
        distanceUnit: settings.distanceUnit as any,
        currency: settings.currency,
      },
      privacy: {
        profileVisibility: settings.profileVisibility as any,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        allowMessaging: settings.allowMessaging,
        dataSharing: settings.dataSharing,
      },
      contactMethod: settings.contactMethod as any,
      communicationFrequency: settings.communicationFrequency as any,
    };

    // Cache for future requests
    await this.cache.set(cacheKey, userSettings, { ttl: CACHE_TTL });

    return userSettings;
  }

  /**
   * Create default settings for a new user
   * @param userId - User ID
   * @returns Created user settings
   */
  async createDefaultUserSettings(userId: string): Promise<UserSettingsData> {
    const defaultNotifications = this.getDefaultNotificationPreferences();

    const created = await database.userSettings.create({
      data: {
        userId,
        theme: "light",
        language: "en",
        timezone: "UTC",
        distanceUnit: "miles",
        currency: "USD",
        profileVisibility: "public",
        showEmail: true,
        showPhone: false,
        allowMessaging: true,
        dataSharing: false,
        contactMethod: "email",
        communicationFrequency: "normal",
        notificationPreferences: defaultNotifications as any,
      },
    });

    return {
      notifications: defaultNotifications,
      display: {
        theme: "light",
        language: "en",
        timezone: "UTC",
        distanceUnit: "miles",
        currency: "USD",
      },
      privacy: {
        profileVisibility: "public",
        showEmail: true,
        showPhone: false,
        allowMessaging: true,
        dataSharing: false,
      },
      contactMethod: "email",
      communicationFrequency: "normal",
    };
  }

  /**
   * Update user settings
   * @param userId - User ID
   * @param updates - Settings updates
   * @returns Updated user settings
   */
  async updateUserSettings(
    userId: string,
    updates: UpdateUserSettingsRequest
  ): Promise<UserSettingsData> {
    // Validate updates
    const validation = this.validateUserSettings(updates);
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    // Check if settings exist
    const existing = await database.userSettings.findUnique({
      where: { userId },
    });

    if (!existing) {
      // Create if not exists
      await this.createDefaultUserSettings(userId);
    }

    // Build update data
    const updateData: any = {};

    if (updates.display) {
      if (updates.display.theme) updateData.theme = updates.display.theme;
      if (updates.display.language) updateData.language = updates.display.language;
      if (updates.display.timezone) updateData.timezone = updates.display.timezone;
      if (updates.display.distanceUnit) updateData.distanceUnit = updates.display.distanceUnit;
      if (updates.display.currency) updateData.currency = updates.display.currency;
    }

    if (updates.privacy) {
      if (updates.privacy.profileVisibility !== undefined)
        updateData.profileVisibility = updates.privacy.profileVisibility;
      if (updates.privacy.showEmail !== undefined) updateData.showEmail = updates.privacy.showEmail;
      if (updates.privacy.showPhone !== undefined) updateData.showPhone = updates.privacy.showPhone;
      if (updates.privacy.allowMessaging !== undefined)
        updateData.allowMessaging = updates.privacy.allowMessaging;
      if (updates.privacy.dataSharing !== undefined)
        updateData.dataSharing = updates.privacy.dataSharing;
    }

    if (updates.notifications) {
      updateData.notificationPreferences = updates.notifications;
    }

    if (updates.contactMethod) {
      updateData.contactMethod = updates.contactMethod;
    }

    if (updates.communicationFrequency) {
      updateData.communicationFrequency = updates.communicationFrequency;
    }

    // Update database
    await database.userSettings.update({
      where: { userId },
      data: updateData,
    });

    // Invalidate cache
    const cacheKey = buildSettingsCacheKey("user", userId);
    await this.cache.delete(cacheKey);

    return this.getUserSettings(userId) as Promise<UserSettingsData>;
  }

  /**
   * Validate user settings updates
   * @param updates - Settings to validate
   * @returns Validation result
   */
  validateUserSettings(updates: UpdateUserSettingsRequest): SettingsValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    if (updates.display) {
      if (updates.display.theme && !isValidTheme(updates.display.theme)) {
        errors.push({ field: "display.theme", message: "Invalid theme" });
      }
      if (updates.display.timezone && !isValidTimezone(updates.display.timezone)) {
        errors.push({ field: "display.timezone", message: "Invalid timezone" });
      }
      if (updates.display.distanceUnit && !isValidDistanceUnit(updates.display.distanceUnit)) {
        errors.push({ field: "display.distanceUnit", message: "Invalid distance unit" });
      }
    }

    if (updates.privacy) {
      if (
        updates.privacy.profileVisibility &&
        !isValidProfileVisibility(updates.privacy.profileVisibility)
      ) {
        errors.push({ field: "privacy.profileVisibility", message: "Invalid profile visibility" });
      }
    }

    if (updates.contactMethod && !isValidContactMethod(updates.contactMethod)) {
      errors.push({ field: "contactMethod", message: "Invalid contact method" });
    }

    if (
      updates.communicationFrequency &&
      !isValidCommunicationFrequency(updates.communicationFrequency)
    ) {
      errors.push({ field: "communicationFrequency", message: "Invalid communication frequency" });
    }

    if (updates.notifications) {
      const allDisabled = Object.values(updates.notifications).every((n) => !n.enabled);
      if (allDisabled) {
        warnings.push({
          field: "notifications",
          message: "All notification channels are disabled",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get default notification preferences
   * @returns Default notification preferences
   */
  private getDefaultNotificationPreferences(): NotificationPreferences {
    return {
      email: { enabled: true, frequency: "daily" },
      sms: { enabled: false, frequency: "never" },
      push: { enabled: true, frequency: "immediate", sound: true, badge: true },
      inApp: { enabled: true, frequency: "immediate" },
    };
  }

  // ============================================
  // FARM SETTINGS
  // ============================================

  /**
   * Get farm settings with caching
   * @param farmId - Farm ID
   * @returns Farm settings or null if not found
   */
  async getFarmSettings(farmId: string): Promise<FarmSettingsData | null> {
    // Check cache first
    const cacheKey = buildSettingsCacheKey("farm", farmId);
    const cached = await this.cache.get<FarmSettingsData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const settings = await database.farmSettings.findUnique({
      where: { farmId },
      include: { businessHours: true },
    });

    if (!settings) {
      // Create default settings
      return this.createDefaultFarmSettings(farmId);
    }

    // Transform to FarmSettingsData
    const farmSettings: FarmSettingsData = {
      deliveryAreas: settings.deliveryAreas as any[],
      acceptedPaymentMethods: settings.acceptedPaymentMethods as any[],
      requireDepositOnOrders: settings.requireDepositOnOrders,
      enablePreOrders: settings.enablePreOrders,
      enableSubscriptions: settings.enableSubscriptions,
      enableGiftCards: settings.enableGiftCards,
      businessHours: settings.businessHours?.map((bh) => ({
        dayOfWeek: bh.dayOfWeek,
        openTime: bh.openTime,
        closeTime: bh.closeTime,
        timezone: bh.timezone,
        isClosed: bh.isClosed,
      })) || [],
      minOrderValue: typeof settings.minOrderValue === 'object' && settings.minOrderValue !== null && 'toNumber' in settings.minOrderValue
        ? settings.minOrderValue.toNumber()
        : settings.minOrderValue,
      deliveryFee: typeof settings.deliveryFee === 'object' && settings.deliveryFee !== null && 'toNumber' in settings.deliveryFee
        ? settings.deliveryFee.toNumber()
        : settings.deliveryFee,
      freeDeliveryThreshold: typeof settings.freeDeliveryThreshold === 'object' && settings.freeDeliveryThreshold !== null && 'toNumber' in settings.freeDeliveryThreshold
        ? settings.freeDeliveryThreshold.toNumber()
        : settings.freeDeliveryThreshold,
    };

    // Cache for future requests
    await this.cache.set(cacheKey, farmSettings, { ttl: CACHE_TTL });

    return farmSettings;
  }

  /**
   * Create default farm settings
   * @param farmId - Farm ID
   * @returns Created farm settings
   */
  async createDefaultFarmSettings(farmId: string): Promise<FarmSettingsData> {
    const defaultBusinessHours: BusinessHoursData[] = [
      // Sunday - Closed
      {
        dayOfWeek: 0,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: true,
      },
      // Monday-Friday - Open
      {
        dayOfWeek: 1,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: false,
      },
      {
        dayOfWeek: 2,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: false,
      },
      {
        dayOfWeek: 3,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: false,
      },
      {
        dayOfWeek: 4,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: false,
      },
      {
        dayOfWeek: 5,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: false,
      },
      // Saturday - Closed
      {
        dayOfWeek: 6,
        openTime: "09:00",
        closeTime: "17:00",
        timezone: "UTC",
        isClosed: true,
      },
    ];

    const settings = await database.farmSettings.create({
      data: {
        farmId,
        deliveryAreas: [],
        acceptedPaymentMethods: ["CARD"],
        requireDepositOnOrders: false,
        enablePreOrders: false,
        enableSubscriptions: false,
        enableGiftCards: false,
        businessHours: {
          create: defaultBusinessHours.map((bh) => ({
            dayOfWeek: bh.dayOfWeek,
            openTime: bh.openTime,
            closeTime: bh.closeTime,
            timezone: bh.timezone,
            isClosed: bh.isClosed,
          })),
        },
      },
      include: { businessHours: true },
    });

    return {
      deliveryAreas: [],
      acceptedPaymentMethods: ["CARD"],
      requireDepositOnOrders: false,
      enablePreOrders: false,
      enableSubscriptions: false,
      enableGiftCards: false,
      businessHours: defaultBusinessHours,
    };
  }

  /**
   * Update farm settings
   * @param farmId - Farm ID
   * @param updates - Settings updates
   * @returns Updated farm settings
   */
  async updateFarmSettings(
    farmId: string,
    updates: UpdateFarmSettingsRequest
  ): Promise<FarmSettingsData> {
    // Check if settings exist
    const existing = await database.farmSettings.findUnique({
      where: { farmId },
    });

    if (!existing) {
      await this.createDefaultFarmSettings(farmId);
    }

    // Build update data
    const updateData: any = {};

    if (updates.deliveryAreas) updateData.deliveryAreas = updates.deliveryAreas;
    if (updates.acceptedPaymentMethods)
      updateData.acceptedPaymentMethods = updates.acceptedPaymentMethods;
    if (updates.requireDepositOnOrders !== undefined)
      updateData.requireDepositOnOrders = updates.requireDepositOnOrders;
    if (updates.enablePreOrders !== undefined) updateData.enablePreOrders = updates.enablePreOrders;
    if (updates.enableSubscriptions !== undefined)
      updateData.enableSubscriptions = updates.enableSubscriptions;
    if (updates.enableGiftCards !== undefined) updateData.enableGiftCards = updates.enableGiftCards;
    if (updates.minOrderValue !== undefined) updateData.minOrderValue = updates.minOrderValue;
    if (updates.deliveryFee !== undefined) updateData.deliveryFee = updates.deliveryFee;
    if (updates.freeDeliveryThreshold !== undefined)
      updateData.freeDeliveryThreshold = updates.freeDeliveryThreshold;

    // Update database
    await database.farmSettings.update({
      where: { farmId },
      data: updateData,
    });

    // Update business hours if provided
    if (updates.businessHours && updates.businessHours.length > 0) {
      // Delete existing business hours
      await database.businessHours.deleteMany({
        where: { farmSettingsId: existing?.id || "" },
      });

      // Create new business hours
      await database.businessHours.createMany({
        data: updates.businessHours.map((bh) => ({
          farmSettingsId: existing?.id || "",
          dayOfWeek: bh.dayOfWeek,
          openTime: bh.openTime,
          closeTime: bh.closeTime,
          timezone: bh.timezone,
          isClosed: bh.isClosed,
        })),
      });
    }

    // Invalidate cache
    const cacheKey = buildSettingsCacheKey("farm", farmId);
    await this.cache.delete(cacheKey);

    return this.getFarmSettings(farmId) as Promise<FarmSettingsData>;
  }

  /**
   * Validate business hours
   * @param hours - Business hours to validate
   * @returns Validation result
   */
  validateBusinessHours(hours: BusinessHoursData[]): SettingsValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    for (let i = 0; i < hours.length; i++) {
      const bh = hours[i];
      if (!bh) continue;

      if (!isValidDayOfWeek(bh.dayOfWeek)) {
        errors.push({
          field: `businessHours[${i}].dayOfWeek`,
          message: "Invalid day of week (must be 0-6)",
        });
      }

      if (!isValidTimeString(bh.openTime)) {
        errors.push({
          field: `businessHours[${i}].openTime`,
          message: "Invalid time format (use HH:MM)",
        });
      }

      if (!isValidTimeString(bh.closeTime)) {
        errors.push({
          field: `businessHours[${i}].closeTime`,
          message: "Invalid time format (use HH:MM)",
        });
      }

      if (!isValidTimezone(bh.timezone)) {
        errors.push({
          field: `businessHours[${i}].timezone`,
          message: "Invalid timezone",
        });
      }

      // Warning: Opening after closing
      if (bh.openTime >= bh.closeTime && !bh.isClosed) {
        warnings.push({
          field: `businessHours[${i}]`,
          message: "Open time is after close time",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if farm is currently open
   * @param farmId - Farm ID
   * @returns True if farm is open now
   */
  async isOpenNow(farmId: string): Promise<boolean> {
    const settings = await this.getFarmSettings(farmId);
    if (!settings || !settings.businessHours) {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const todayHours = settings.businessHours.find((bh) => bh.dayOfWeek === currentDay);

    if (!todayHours || todayHours.isClosed) {
      return false;
    }

    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }

  // ============================================
  // SYSTEM SETTINGS
  // ============================================

  /**
   * Get system setting
   * @param key - Setting key
   * @returns Setting value or null if not found
   */
  async getSystemSetting(key: string): Promise<any> {
    // Check cache first
    const cacheKey = buildSettingsCacheKey("system", key);
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const setting = await database.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    await this.cache.set(cacheKey, JSON.stringify(setting.value), {
      ttl: SYSTEM_CACHE_TTL,
    });

    return setting.value;
  }

  /**
   * Set system setting
   * @param request - Setting update request
   * @returns Updated setting data
   */
  async setSystemSetting(request: UpdateSystemSettingRequest): Promise<SystemSettingData> {
    const setting = await database.systemSettings.upsert({
      where: { key: request.key },
      update: {
        value: request.value,
        description: request.description,
        isPublic: request.isPublic,
      },
      create: {
        key: request.key,
        value: request.value,
        description: request.description,
        isPublic: request.isPublic || false,
      },
    });

    // Invalidate cache
    const cacheKey = buildSettingsCacheKey("system", request.key);
    await this.cache.delete(cacheKey);

    return {
      key: setting.key,
      value: setting.value as any,
      description: setting.description || undefined,
      isPublic: setting.isPublic,
    };
  }

  /**
   * Delete system setting
   * @param key - Setting key
   */
  async deleteSystemSetting(key: string): Promise<void> {
    await database.systemSettings.delete({
      where: { key },
    });

    // Invalidate cache
    const cacheKey = buildSettingsCacheKey("system", key);
    await this.cache.delete(cacheKey);
  }

  /**
   * Get public system settings
   * @returns Public system settings as key-value map
   */
  async getPublicSystemSettings(): Promise<Record<string, any>> {
    const settings = await database.systemSettings.findMany({
      where: { isPublic: true },
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  }
}

// Export singleton instance for convenience
export const settingsService = new SettingsService();
