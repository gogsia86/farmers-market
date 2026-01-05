// ============================================
// SPRINT 5: SETTINGS & CONFIGURATION TYPES
// ============================================
// Comprehensive type definitions for the settings system
// Following divine agricultural patterns with type safety

import type { Prisma } from "@prisma/client";

// ============================================
// NOTIFICATION PREFERENCES TYPES
// ============================================

/**
 * Notification channel settings for a specific communication channel
 */
export interface NotificationChannelSettings {
  /** Whether notifications are enabled for this channel */
  enabled: boolean;
  /** How often to send notifications */
  frequency: NotificationFrequency;
  /** Quiet hours when notifications should not be sent */
  quietHours?: {
    /** Start time in HH:MM format (e.g., "22:00") */
    start: string;
    /** End time in HH:MM format (e.g., "08:00") */
    end: string;
  };
}

/**
 * Push notification specific settings
 */
export interface PushNotificationSettings extends NotificationChannelSettings {
  /** Play sound for push notifications */
  sound: boolean;
  /** Show badge count on app icon */
  badge: boolean;
}

/**
 * Notification frequency options
 */
export type NotificationFrequency = "immediate" | "daily" | "weekly" | "never";

/**
 * Complete notification preferences across all channels
 */
export interface NotificationPreferences {
  /** Email notification settings */
  email: NotificationChannelSettings;
  /** SMS notification settings */
  sms: NotificationChannelSettings;
  /** Push notification settings (mobile/desktop) */
  push: PushNotificationSettings;
  /** In-app notification settings */
  inApp: NotificationChannelSettings;
}

// ============================================
// DISPLAY PREFERENCES TYPES
// ============================================

/**
 * User interface theme options
 */
export type Theme = "light" | "dark" | "system";

/**
 * Distance measurement units
 */
export type DistanceUnit = "miles" | "kilometers";

/**
 * Display and UI preferences
 */
export interface DisplayPreferences {
  /** UI theme preference */
  theme: Theme;
  /** Language code (ISO 639-1) */
  language: string;
  /** Timezone (IANA timezone database) */
  timezone: string;
  /** Preferred distance unit */
  distanceUnit: DistanceUnit;
  /** Currency code (ISO 4217) */
  currency: string;
}

// ============================================
// PRIVACY SETTINGS TYPES
// ============================================

/**
 * Profile visibility options
 */
export type ProfileVisibility = "public" | "friends" | "private";

/**
 * Contact method preferences
 */
export type ContactMethod = "email" | "sms" | "both";

/**
 * Communication frequency preferences
 */
export type CommunicationFrequency = "minimal" | "normal" | "all";

/**
 * Privacy and data sharing settings
 */
export interface PrivacySettings {
  /** Who can view the user's profile */
  profileVisibility: ProfileVisibility;
  /** Show email address on public profile */
  showEmail: boolean;
  /** Show phone number on public profile */
  showPhone: boolean;
  /** Allow other users to send messages */
  allowMessaging: boolean;
  /** Allow data sharing with partners */
  dataSharing: boolean;
}

// ============================================
// USER SETTINGS TYPES
// ============================================

/**
 * Complete user settings data structure
 */
export interface UserSettingsData {
  /** Multi-channel notification preferences */
  notifications: NotificationPreferences;
  /** Display and UI preferences */
  display: DisplayPreferences;
  /** Privacy and data sharing settings */
  privacy: PrivacySettings;
  /** Preferred contact method */
  contactMethod: ContactMethod;
  /** Preferred communication frequency */
  communicationFrequency: CommunicationFrequency;
}

/**
 * Request payload for updating user settings
 */
export interface UpdateUserSettingsRequest {
  /** Partial notification preference updates */
  notifications?: Partial<NotificationPreferences>;
  /** Partial display preference updates */
  display?: Partial<DisplayPreferences>;
  /** Partial privacy setting updates */
  privacy?: Partial<PrivacySettings>;
  /** Update contact method */
  contactMethod?: ContactMethod;
  /** Update communication frequency */
  communicationFrequency?: CommunicationFrequency;
}

// ============================================
// BUSINESS HOURS TYPES
// ============================================

/**
 * Business hours for a specific day
 */
export interface BusinessHoursData {
  /** Day of week (0=Sunday, 1=Monday, ..., 6=Saturday) */
  dayOfWeek: number;
  /** Opening time in HH:MM format (e.g., "09:00") */
  openTime: string;
  /** Closing time in HH:MM format (e.g., "17:00") */
  closeTime: string;
  /** Timezone (IANA timezone database) */
  timezone: string;
  /** Whether the farm is closed on this day */
  isClosed: boolean;
  /** Start date for seasonal hours (optional) */
  effectiveFrom?: Date;
  /** End date for seasonal hours (optional) */
  effectiveTo?: Date;
}

/**
 * Business hours status for "is open now" checks
 */
export interface BusinessHoursStatus {
  /** Whether the farm is currently open */
  isOpen: boolean;
  /** Next opening time (if currently closed) */
  nextOpenTime: Date | null;
  /** Next closing time (if currently open) */
  nextCloseTime: Date | null;
  /** Timezone for the status */
  timezone: string;
}

// ============================================
// FARM SETTINGS TYPES
// ============================================

/**
 * Delivery area configuration
 */
export interface DeliveryArea {
  /** ZIP code for delivery area */
  zipCode?: string;
  /** City name for delivery area */
  city?: string;
  /** Delivery radius in miles/kilometers */
  radius?: number;
  /** Delivery fee for this area */
  deliveryFee?: number;
}

/**
 * Farm policies (return, cancellation, terms)
 */
export interface FarmPolicies {
  /** Return policy text */
  returnPolicy?: string;
  /** Cancellation policy text */
  cancellationPolicy?: string;
  /** Terms and conditions text */
  termsAndConditions?: string;
}

/**
 * Farm feature flags
 */
export interface FarmFeatures {
  /** Allow customers to pre-order products */
  enablePreOrders: boolean;
  /** Allow subscription-based purchases */
  enableSubscriptions: boolean;
  /** Allow gift card purchases */
  enableGiftCards: boolean;
}

/**
 * Complete farm settings data structure
 */
export interface FarmSettingsData {
  /** Operating hours for each day of the week */
  businessHours: BusinessHoursData[];
  /** Delivery areas and configuration */
  deliveryAreas: DeliveryArea[];
  /** Base delivery fee */
  deliveryFee?: number;
  /** Minimum order value */
  minOrderValue?: number;
  /** Accepted payment methods (e.g., ["CARD", "CASH", "CHECK"]) */
  acceptedPaymentMethods: string[];
  /** Require deposit for orders */
  requireDepositOnOrders: boolean;
  /** Deposit percentage (if required) */
  depositPercentage?: number;
  /** Farm policies */
  policies: FarmPolicies;
  /** Feature flags */
  features: FarmFeatures;
}

/**
 * Request payload for updating farm settings
 */
export interface UpdateFarmSettingsRequest {
  /** Update business hours */
  businessHours?: BusinessHoursData[];
  /** Update delivery areas */
  deliveryAreas?: DeliveryArea[];
  /** Update delivery fee */
  deliveryFee?: number;
  /** Update minimum order value */
  minOrderValue?: number;
  /** Update accepted payment methods */
  acceptedPaymentMethods?: string[];
  /** Update deposit requirement */
  requireDepositOnOrders?: boolean;
  /** Update deposit percentage */
  depositPercentage?: number;
  /** Update policies */
  policies?: Partial<FarmPolicies>;
  /** Update feature flags */
  features?: Partial<FarmFeatures>;
}

// ============================================
// SYSTEM SETTINGS TYPES
// ============================================

/**
 * System setting data types
 */
export type SystemSettingType = "string" | "number" | "boolean" | "json";

/**
 * System setting categories
 */
export type SystemSettingCategory =
  | "platform"
  | "feature"
  | "security"
  | "integration";

/**
 * Individual system setting
 */
export interface SystemSettingData {
  /** Unique setting key */
  key: string;
  /** Setting value (any type) */
  value: any;
  /** Value type */
  type: SystemSettingType;
  /** Setting category */
  category: SystemSettingCategory;
  /** Human-readable description */
  description?: string;
  /** Whether this setting can be read by frontend */
  isPublic: boolean;
  /** Whether this setting can be changed via UI */
  isEditable: boolean;
}

/**
 * Request payload for updating system settings
 */
export interface UpdateSystemSettingRequest {
  /** Setting key */
  key: string;
  /** New value */
  value: any;
  /** Value type */
  type?: SystemSettingType;
  /** Category */
  category?: SystemSettingCategory;
  /** Description */
  description?: string;
  /** Public flag */
  isPublic?: boolean;
  /** Editable flag */
  isEditable?: boolean;
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Validation warning (non-blocking)
 */
export interface ValidationWarning {
  /** Field name with warning */
  field: string;
  /** Warning message */
  message: string;
}

/**
 * Settings validation result
 */
export interface SettingsValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors (blocking) */
  errors: ValidationError[];
  /** Validation warnings (non-blocking) */
  warnings: ValidationWarning[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Standard API response for settings operations
 */
export interface SettingsApiResponse<T = any> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Response data (if successful) */
  data?: T;
  /** Error information (if failed) */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Additional error details */
    details?: Record<string, any>;
  };
  /** Additional metadata */
  meta?: {
    /** Request ID for tracing */
    requestId?: string;
    /** Timestamp */
    timestamp?: string;
  };
}

// ============================================
// SETTINGS INHERITANCE TYPES
// ============================================

/**
 * Settings source (for inheritance tracking)
 */
export type SettingsSource = "system" | "farm" | "user";

/**
 * Settings with source tracking (for debugging inheritance)
 */
export interface SettingsWithSource<T> {
  /** Setting value */
  value: T;
  /** Where this setting value came from */
  source: SettingsSource;
  /** Whether this value was inherited or explicitly set */
  isInherited: boolean;
}

/**
 * Complete effective settings (after inheritance)
 */
export interface EffectiveSettings {
  /** Effective user settings */
  user: UserSettingsData;
  /** Effective farm settings (if applicable) */
  farm?: FarmSettingsData;
  /** System settings that affect the user */
  system: Record<string, any>;
}

// ============================================
// SETTINGS CHANGE AUDIT TYPES
// ============================================

/**
 * Settings change event for audit trail
 */
export interface SettingsChangeEvent {
  /** User who made the change */
  userId: string;
  /** Settings type that was changed */
  settingsType: "user" | "farm" | "system";
  /** Settings ID (userId, farmId, or setting key) */
  settingsId: string;
  /** Fields that were changed */
  changedFields: string[];
  /** Old values */
  oldValues: Record<string, any>;
  /** New values */
  newValues: Record<string, any>;
  /** Timestamp of change */
  timestamp: Date;
  /** IP address of request */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Deep partial type for nested updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Settings cache key generator
 */
export interface SettingsCacheKey {
  /** Cache key prefix */
  prefix: "settings";
  /** Settings type */
  type: "user" | "farm" | "system";
  /** Resource ID */
  id: string;
}

/**
 * Helper to build cache keys
 */
export function buildSettingsCacheKey(
  type: "user" | "farm" | "system",
  id: string,
): string {
  return `settings:${type}:${id}`;
}

// ============================================
// EXPORT ALL TYPES
// ============================================

export type {
  // Prisma types re-export
  Prisma,
};

// Type guards
export function isValidTheme(value: string): value is Theme {
  return ["light", "dark", "system"].includes(value);
}

export function isValidDistanceUnit(value: string): value is DistanceUnit {
  return ["miles", "kilometers"].includes(value);
}

export function isValidProfileVisibility(
  value: string,
): value is ProfileVisibility {
  return ["public", "friends", "private"].includes(value);
}

export function isValidNotificationFrequency(
  value: string,
): value is NotificationFrequency {
  return ["immediate", "daily", "weekly", "never"].includes(value);
}

export function isValidContactMethod(value: string): value is ContactMethod {
  return ["email", "sms", "both"].includes(value);
}

export function isValidCommunicationFrequency(
  value: string,
): value is CommunicationFrequency {
  return ["minimal", "normal", "all"].includes(value);
}

// Validation helpers
export function isValidTimeString(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

export function isValidDayOfWeek(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
