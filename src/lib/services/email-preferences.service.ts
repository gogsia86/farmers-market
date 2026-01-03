/**
 * 🌾 Email Preferences Service - Divine Agricultural Communication Management
 *
 * Manages user email preferences with biodynamic consciousness and quantum precision.
 * Handles subscription preferences, unsubscribe tokens, and preference validation.
 *
 * @module EmailPreferencesService
 * @category Services
 * @agricultural-consciousness DIVINE
 * @sprint Sprint 4 - Email Enhancements
 */

import { database } from "@/lib/database";
import type { EmailPreferences, EmailType, Prisma } from "@prisma/client";
import crypto from "crypto";
import type { EmailTemplate } from "./email.service";

/**
 * Email preference update request
 */
export interface UpdatePreferencesRequest {
  // Marketing Preferences
  farmUpdates?: boolean;
  newProducts?: boolean;
  promotions?: boolean;
  seasonalNews?: boolean;

  // Transactional Preferences (cannot be disabled)
  orderConfirmation?: boolean; // Always true
  orderStatusUpdates?: boolean; // Always true
  shippingNotifications?: boolean;
  deliveryReminders?: boolean;

  // System Preferences
  securityAlerts?: boolean; // Always true
  accountUpdates?: boolean;
  priceAlerts?: boolean;
  inventoryAlerts?: boolean;

  // Communication Preferences
  newsletter?: boolean;
  surveyRequests?: boolean;
  productRecommendations?: boolean;
}

/**
 * Preference validation result
 */
export interface PreferenceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Unsubscribe request
 */
export interface UnsubscribeRequest {
  token: string;
  reason?: string;
  feedback?: string;
}

/**
 * Email type to preference field mapping
 */
const EMAIL_TYPE_TO_PREFERENCE: Record<
  EmailType,
  keyof EmailPreferences | null
> = {
  // Marketing
  FARM_UPDATE: "farmUpdates",
  NEW_PRODUCT: "newProducts",
  PROMOTION: "promotions",
  SEASONAL_NEWS: "seasonalNews",
  NEWSLETTER: "newsletter",
  PRODUCT_RECOMMENDATION: "productRecommendations",

  // Transactional (always sent - cannot be disabled)
  ORDER_CONFIRMATION: null, // Always sent
  ORDER_STATUS_UPDATE: null, // Always sent
  ORDER_SHIPPED: null, // Always sent
  ORDER_DELIVERED: null, // Always sent
  ORDER_CANCELLED: null, // Always sent
  SECURITY_ALERT: null, // Always sent

  // Notifications (user configurable)
  SHIPPING_NOTIFICATION: "shippingNotifications",
  DELIVERY_REMINDER: "deliveryReminders",
  ACCOUNT_UPDATE: "accountUpdates",
  PRICE_ALERT: "priceAlerts",
  INVENTORY_ALERT: "inventoryAlerts",

  // Engagement
  SURVEY_REQUEST: "surveyRequests",

  // System
  VERIFICATION: null, // Always sent
  PASSWORD_RESET: null, // Always sent
  WELCOME: null, // Always sent
  FARM_APPROVED: "farmUpdates",
  FARM_REJECTED: "farmUpdates",

  // Other
  OTHER: null,
};

/**
 * Required email types that cannot be unsubscribed
 */
const REQUIRED_EMAIL_TYPES: EmailType[] = [
  "ORDER_CONFIRMATION",
  "ORDER_STATUS_UPDATE",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "SECURITY_ALERT",
  "VERIFICATION",
  "PASSWORD_RESET",
  "WELCOME",
];

/**
 * 🌾 Email Preferences Service
 *
 * Divine service for managing user email communication preferences.
 * Maintains agricultural consciousness while respecting user choices.
 */
export class EmailPreferencesService {
  /**
   * Get user's email preferences
   * Creates default preferences if none exist
   */
  async getPreferences(userId: string): Promise<EmailPreferences> {
    try {
      // Try to find existing preferences
      let preferences = await database.emailPreferences.findUnique({
        where: { userId },
      });

      // Create default preferences if none exist
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }

      return preferences;
    } catch (error) {
      throw new Error(
        `Failed to get email preferences for user ${userId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Create default email preferences for a user
   */
  async createDefaultPreferences(userId: string): Promise<EmailPreferences> {
    try {
      const preferences = await database.emailPreferences.create({
        data: {
          userId,
          // Marketing - Opt-in by default
          farmUpdates: true,
          newProducts: true,
          promotions: true,
          seasonalNews: true,

          // Transactional - Always enabled
          orderConfirmation: true,
          orderStatusUpdates: true,
          shippingNotifications: true,
          deliveryReminders: true,

          // System - Always enabled
          securityAlerts: true,
          accountUpdates: true,
          priceAlerts: true,
          inventoryAlerts: true,

          // Communication - Opt-in by default
          newsletter: true,
          surveyRequests: true,
          productRecommendations: true,

          // Status
          unsubscribedAll: false,
          unsubscribedAt: null,
          unsubscribeReason: null,
        },
      });

      return preferences;
    } catch (error) {
      throw new Error(
        `Failed to create default preferences for user ${userId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Update user's email preferences
   */
  async updatePreferences(
    userId: string,
    updates: UpdatePreferencesRequest,
  ): Promise<EmailPreferences> {
    try {
      // Validate the update request
      const validation = this.validatePreferenceUpdate(updates);
      if (!validation.isValid) {
        throw new Error(`Invalid preferences: ${validation.errors.join(", ")}`);
      }

      // Ensure preferences exist
      await this.getPreferences(userId);

      // Prepare update data - enforce required preferences
      const data: Prisma.EmailPreferencesUpdateInput = {
        ...updates,
        // Enforce required preferences (cannot be disabled)
        orderConfirmation: true,
        orderStatusUpdates: true,
        securityAlerts: true,
        updatedAt: new Date(),
      };

      // Update preferences
      const preferences = await database.emailPreferences.update({
        where: { userId },
        data,
      });

      return preferences;
    } catch (error) {
      throw new Error(
        `Failed to update email preferences for user ${userId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Validate preference update request
   */
  validatePreferenceUpdate(
    updates: UpdatePreferencesRequest,
  ): PreferenceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for attempts to disable required preferences
    if (updates.orderConfirmation === false) {
      warnings.push(
        "Order confirmation emails cannot be disabled (required for transactions)",
      );
    }

    if (updates.orderStatusUpdates === false) {
      warnings.push(
        "Order status update emails cannot be disabled (required for order tracking)",
      );
    }

    if (updates.securityAlerts === false) {
      warnings.push(
        "Security alert emails cannot be disabled (required for account protection)",
      );
    }

    // Validate boolean values
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && typeof value !== "boolean") {
        errors.push(`${key} must be a boolean value`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Map EmailTemplate to EmailType for preference checking
   */
  private mapTemplateToEmailType(template: EmailTemplate): EmailType | null {
    const mapping: Record<EmailTemplate, EmailType | null> = {
      ORDER_CONFIRMATION: "ORDER_CONFIRMATION",
      ORDER_STATUS_UPDATE: "ORDER_STATUS_UPDATE",
      ORDER_SHIPPED: "ORDER_SHIPPED",
      ORDER_DELIVERED: "ORDER_DELIVERED",
      ORDER_CANCELLED: "ORDER_CANCELLED",
      PASSWORD_RESET: "PASSWORD_RESET",
      EMAIL_VERIFICATION: "VERIFICATION",
      WELCOME: null, // Not in EmailType enum
      FARM_APPROVED: "FARM_UPDATE",
      FARM_REJECTED: "FARM_UPDATE",
      PRODUCT_LOW_STOCK: "INVENTORY_ALERT",
      PROMOTIONAL: "PROMOTION",
      NEWSLETTER: "NEWSLETTER",
    };

    return mapping[template] ?? null;
  }

  /**
   * Check if user can receive a specific email type
   */
  async canSendEmail(
    userId: string,
    emailType: EmailType | EmailTemplate,
  ): Promise<boolean> {
    // Convert EmailTemplate to EmailType if needed
    let actualEmailType: EmailType;

    if (
      emailType in
      [
        "ORDER_CONFIRMATION",
        "ORDER_STATUS_UPDATE",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "PASSWORD_RESET",
        "VERIFICATION",
        "WELCOME",
        "FARM_UPDATE",
        "NEW_PRODUCT",
        "PROMOTION",
        "SEASONAL_NEWS",
        "SHIPPING_NOTIFICATION",
        "DELIVERY_REMINDER",
        "ACCOUNT_UPDATE",
        "SECURITY_ALERT",
        "PRICE_ALERT",
        "INVENTORY_ALERT",
        "SURVEY_REQUEST",
        "NEWSLETTER",
        "PRODUCT_RECOMMENDATION",
      ]
    ) {
      actualEmailType = emailType as EmailType;
    } else {
      // It's an EmailTemplate, map it
      const mapped = this.mapTemplateToEmailType(emailType as EmailTemplate);
      if (!mapped) {
        // No mapping means it's always allowed
        return true;
      }
      actualEmailType = mapped;
    }
    try {
      // Required emails are always allowed
      if (REQUIRED_EMAIL_TYPES.includes(actualEmailType)) {
        return true;
      }

      // Get user preferences
      const preferences = await this.getPreferences(userId);

      // Check if user unsubscribed from all emails
      if (preferences.unsubscribedAll) {
        return REQUIRED_EMAIL_TYPES.includes(actualEmailType);
      }

      // Get preference field for this email type
      const preferenceField = EMAIL_TYPE_TO_PREFERENCE[actualEmailType];

      // If no preference field, it's a required email
      if (!preferenceField) {
        return true;
      }

      // Check the specific preference
      return preferences[preferenceField] === true;
    } catch (error) {
      // Default to allowing email if we can't check preferences
      console.error(
        `Error checking email preference for user ${userId}, type ${emailType}:`,
        error,
      );
      return true;
    }
  }

  /**
   * Generate unsubscribe token for user
   */
  async generateUnsubscribeToken(userId: string): Promise<string> {
    try {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");

      // Update user preferences with token
      await database.emailPreferences.upsert({
        where: { userId },
        update: {
          unsubscribeToken: token,
          updatedAt: new Date(),
        },
        create: {
          userId,
          unsubscribeToken: token,
          // Use defaults from createDefaultPreferences
          farmUpdates: true,
          newProducts: true,
          promotions: true,
          seasonalNews: true,
          orderConfirmation: true,
          orderStatusUpdates: true,
          shippingNotifications: true,
          deliveryReminders: true,
          securityAlerts: true,
          accountUpdates: true,
          priceAlerts: true,
          inventoryAlerts: true,
          newsletter: true,
          surveyRequests: true,
          productRecommendations: true,
          unsubscribedAll: false,
        },
      });

      return token;
    } catch (error) {
      throw new Error(
        `Failed to generate unsubscribe token for user ${userId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Unsubscribe user from all marketing emails using token
   */
  async unsubscribeAll(request: UnsubscribeRequest): Promise<void> {
    try {
      // Find preferences by token
      const preferences = await database.emailPreferences.findFirst({
        where: {
          unsubscribeToken: request.token,
        },
      });

      if (!preferences) {
        throw new Error("Invalid or expired unsubscribe token");
      }

      // Update preferences to unsubscribe from all marketing emails
      await database.emailPreferences.update({
        where: { userId: preferences.userId },
        data: {
          // Disable all marketing emails
          farmUpdates: false,
          newProducts: false,
          promotions: false,
          seasonalNews: false,
          newsletter: false,
          surveyRequests: false,
          productRecommendations: false,

          // Keep transactional and system emails enabled
          // (orderConfirmation, orderStatusUpdates, securityAlerts remain true)

          // Mark as unsubscribed
          unsubscribedAll: true,
          unsubscribedAt: new Date(),
          unsubscribeReason: request.reason || null,
          unsubscribeFeedback: request.feedback || null,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to unsubscribe user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Resubscribe user to marketing emails
   */
  async resubscribe(userId: string): Promise<EmailPreferences> {
    try {
      // Get current preferences
      const current = await this.getPreferences(userId);

      // Re-enable marketing preferences
      const preferences = await database.emailPreferences.update({
        where: { userId },
        data: {
          // Re-enable marketing emails
          farmUpdates: true,
          newProducts: true,
          promotions: true,
          seasonalNews: true,
          newsletter: true,
          surveyRequests: true,
          productRecommendations: true,

          // Clear unsubscribe status
          unsubscribedAll: false,
          unsubscribedAt: null,
          unsubscribeReason: null,
          unsubscribeFeedback: null,
          updatedAt: new Date(),
        },
      });

      return preferences;
    } catch (error) {
      throw new Error(
        `Failed to resubscribe user ${userId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get email type display name
   */
  getEmailTypeDisplayName(emailType: EmailType): string {
    const displayNames: Record<EmailType, string> = {
      // Marketing
      FARM_UPDATE: "Farm Updates",
      NEW_PRODUCT: "New Products",
      PROMOTION: "Promotions & Special Offers",
      SEASONAL_NEWS: "Seasonal News",
      NEWSLETTER: "Newsletter",
      PRODUCT_RECOMMENDATION: "Product Recommendations",

      // Transactional
      ORDER_CONFIRMATION: "Order Confirmation",
      ORDER_STATUS_UPDATE: "Order Status Updates",
      ORDER_SHIPPED: "Order Shipped",
      ORDER_DELIVERED: "Order Delivered",
      ORDER_CANCELLED: "Order Cancelled",
      SECURITY_ALERT: "Security Alerts",

      // Notifications
      SHIPPING_NOTIFICATION: "Shipping Notifications",
      DELIVERY_REMINDER: "Delivery Reminders",
      ACCOUNT_UPDATE: "Account Updates",
      PRICE_ALERT: "Price Alerts",
      INVENTORY_ALERT: "Inventory Alerts",

      // Engagement
      SURVEY_REQUEST: "Survey Requests",

      // System
      VERIFICATION: "Email Verification",
      PASSWORD_RESET: "Password Reset",
      WELCOME: "Welcome Email",
      FARM_APPROVED: "Farm Approved",
      FARM_REJECTED: "Farm Rejected",

      // Other
      OTHER: "Other",
    };

    return displayNames[emailType] || emailType;
  }

  /**
   * Check if email type is required (cannot be unsubscribed)
   */
  isRequiredEmailType(emailType: EmailType): boolean {
    return REQUIRED_EMAIL_TYPES.includes(emailType);
  }

  /**
   * Get all email types grouped by category
   */
  getEmailTypesByCategory(): Record<string, EmailType[]> {
    return {
      marketing: [
        "FARM_UPDATE",
        "NEW_PRODUCT",
        "PROMOTION",
        "SEASONAL_NEWS",
        "NEWSLETTER",
        "PRODUCT_RECOMMENDATION",
      ],
      transactional: [
        "ORDER_CONFIRMATION",
        "ORDER_STATUS_UPDATE",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "SECURITY_ALERT",
      ],
      notifications: [
        "SHIPPING_NOTIFICATION",
        "DELIVERY_REMINDER",
        "ACCOUNT_UPDATE",
        "PRICE_ALERT",
        "INVENTORY_ALERT",
      ],
      engagement: ["SURVEY_REQUEST"],
      system: [
        "VERIFICATION",
        "PASSWORD_RESET",
        "WELCOME",
        "FARM_APPROVED",
        "FARM_REJECTED",
      ],
    };
  }
}

// Export singleton instance with divine agricultural consciousness
export const emailPreferencesService = new EmailPreferencesService();
