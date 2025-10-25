/**
 * EMAIL CAMPAIGN TYPES
 * Divine email marketing consciousness
 */

// Campaign Status
export type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "PAUSED"
  | "CANCELLED";

// Campaign Segment (Audience)
export type CampaignSegment =
  | "ALL_USERS"
  | "FARMERS_ONLY"
  | "CONSUMERS_ONLY"
  | "NEW_USERS"
  | "INACTIVE_USERS"
  | "VIP_CUSTOMERS"
  | "LOCATION_BASED"
  | "CUSTOM";

// Discount Types
export type DiscountType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "FREE_SHIPPING"
  | "BUY_ONE_GET_ONE";

// Email Campaign
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  template: EmailTemplate;
  segment: CampaignSegment;
  segmentFilters?: SegmentFilters;
  status: CampaignStatus;
  scheduledFor?: Date;
  sentAt?: Date;

  // Analytics
  stats: CampaignStats;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email Template
export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  html: string;
  variables: string[]; // {{farmName}}, {{productName}}, etc.
  thumbnail?: string;
}

export type EmailTemplateType =
  | "WELCOME"
  | "PROMOTIONAL"
  | "NEWSLETTER"
  | "ABANDONED_CART"
  | "ORDER_CONFIRMATION"
  | "CUSTOM";

// Segment Filters
export interface SegmentFilters {
  userType?: "FARMER" | "CONSUMER";
  location?: {
    state?: string;
    city?: string;
    radius?: number; // miles
  };
  registeredAfter?: Date;
  registeredBefore?: Date;
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;
  hasOrdered?: boolean;
  orderCount?: {
    min?: number;
    max?: number;
  };
  totalSpent?: {
    min?: number;
    max?: number;
  };
}

// Campaign Statistics
export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  converted: number;
  revenue: number;

  // Calculated metrics
  openRate: number; // opened / delivered
  clickRate: number; // clicked / delivered
  conversionRate: number; // converted / delivered
  revenuePerEmail: number; // revenue / delivered
}

// Campaign Creation Input
export interface CreateCampaignInput {
  name: string;
  subject: string;
  preheader?: string;
  templateId: string;
  segment: CampaignSegment;
  segmentFilters?: SegmentFilters;
  scheduledFor?: Date;
}

// Campaign Update Input
export interface UpdateCampaignInput {
  name?: string;
  subject?: string;
  preheader?: string;
  templateId?: string;
  segment?: CampaignSegment;
  segmentFilters?: SegmentFilters;
  scheduledFor?: Date;
  status?: CampaignStatus;
}

// Discount Code
export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;

  // Restrictions
  applicableTo?: {
    productIds?: string[];
    farmIds?: string[];
    categories?: string[];
  };
  eligibleUsers?: {
    userIds?: string[];
    userType?: "NEW" | "EXISTING" | "ALL";
  };

  createdAt: Date;
  updatedAt: Date;
}

// Email Event (for tracking)
export interface EmailEvent {
  id: string;
  campaignId: string;
  userId: string;
  email: string;
  event: EmailEventType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type EmailEventType =
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "BOUNCED"
  | "UNSUBSCRIBED"
  | "COMPLAINED";

// Referral
export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  code: string;
  status: ReferralStatus;
  rewardPaid: boolean;
  referrerReward: number;
  refereeReward: number;

  createdAt: Date;
  completedAt?: Date;
}

export type ReferralStatus = "PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED";

// API Response Types
export interface CampaignListResponse {
  campaigns: EmailCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface CampaignAnalyticsResponse {
  campaignStats: CampaignStats;
  timeline: {
    date: string;
    opened: number;
    clicked: number;
    converted: number;
  }[];
  topLinks: {
    url: string;
    clicks: number;
  }[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface DiscountValidationResponse {
  valid: boolean;
  discount?: {
    type: DiscountType;
    value: number;
    finalAmount: number;
  };
  error?: string;
}
