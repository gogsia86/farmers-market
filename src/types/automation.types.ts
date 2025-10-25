/**
 * EMAIL AUTOMATION TYPES
 * Divine automated email sequence consciousness
 */

// Automation Trigger Events
export type AutomationTrigger =
  | "USER_SIGNUP"
  | "FIRST_ORDER"
  | "CART_ABANDONED"
  | "ORDER_DELIVERED"
  | "USER_INACTIVE_30_DAYS"
  | "USER_INACTIVE_60_DAYS"
  | "FARMER_SIGNUP"
  | "PRODUCT_LISTED";

// Automation Status
export type AutomationStatus = "ACTIVE" | "PAUSED" | "DRAFT";

// Email Sequence
export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  status: AutomationStatus;
  emails: SequenceEmail[];

  // Analytics
  stats: SequenceStats;

  createdAt: Date;
  updatedAt: Date;
}

// Individual Email in Sequence
export interface SequenceEmail {
  id: string;
  order: number; // 1, 2, 3...
  delayHours: number; // Hours after trigger or previous email
  subject: string;
  preheader?: string;
  templateId: string;
  templateData?: Record<string, any>;
}

// Sequence Statistics
export interface SequenceStats {
  triggered: number;
  emailsSent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;

  // Per-email breakdown
  emailStats: {
    emailId: string;
    order: number;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  }[];
}

// Active Sequence Enrollment
export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  userId: string;
  status: EnrollmentStatus;
  currentEmailIndex: number;

  // Tracking
  triggeredAt: Date;
  lastEmailSentAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Results
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  converted: boolean;
  conversionValue?: number;
}

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED";

// Pre-built Sequences
export const PREDEFINED_SEQUENCES = {
  WELCOME_SERIES: {
    name: "Welcome Email Series",
    trigger: "USER_SIGNUP" as AutomationTrigger,
    emails: [
      {
        order: 1,
        delayHours: 0,
        subject: "🌾 Welcome to Farmers Market!",
        preheader: "Let's get you started with fresh local produce",
      },
      {
        order: 2,
        delayHours: 72, // 3 days
        subject: "🚜 Discover Amazing Local Farms",
        preheader: "Browse farms near you and find your favorites",
      },
      {
        order: 3,
        delayHours: 168, // 7 days
        subject: "🎁 Here's $10 Off Your First Order!",
        preheader: "Use code WELCOME10 - expires in 48 hours",
      },
    ],
  },

  ABANDONED_CART: {
    name: "Abandoned Cart Recovery",
    trigger: "CART_ABANDONED" as AutomationTrigger,
    emails: [
      {
        order: 1,
        delayHours: 1,
        subject: "🛒 You left something behind!",
        preheader: "Your cart is waiting - complete your order now",
      },
      {
        order: 2,
        delayHours: 24, // 1 day
        subject: "💚 10% OFF your cart - Just for you!",
        preheader: "Don't miss out on fresh produce - save 10% today",
      },
    ],
  },

  REENGAGEMENT_30: {
    name: "Re-engagement (30 days)",
    trigger: "USER_INACTIVE_30_DAYS" as AutomationTrigger,
    emails: [
      {
        order: 1,
        delayHours: 0,
        subject: "👋 We miss you! Check out what's new",
        preheader: "Fresh seasonal produce and new farms added",
      },
      {
        order: 2,
        delayHours: 336, // 14 days (day 44 total)
        subject: "🎁 Come back with 15% OFF!",
        preheader: "Special offer just for you - expires soon",
      },
    ],
  },

  FARMER_ONBOARDING: {
    name: "Farmer Onboarding Series",
    trigger: "FARMER_SIGNUP" as AutomationTrigger,
    emails: [
      {
        order: 1,
        delayHours: 0,
        subject: "🚜 Welcome to Farmers Market, Farmer!",
        preheader: "Let's get your farm set up in minutes",
      },
      {
        order: 2,
        delayHours: 48, // 2 days
        subject: "📦 How to List Your Products",
        preheader: "Step-by-step guide to adding products",
      },
      {
        order: 3,
        delayHours: 168, // 7 days
        subject: "💡 Marketing Tips for Farmers",
        preheader: "Grow your sales with these proven strategies",
      },
      {
        order: 4,
        delayHours: 336, // 14 days
        subject: "🌟 Success Stories from Other Farmers",
        preheader: "See how farmers are thriving on our platform",
      },
    ],
  },
};

// API Request Types
export interface CreateSequenceInput {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  emails: Omit<SequenceEmail, "id">[];
}

export interface UpdateSequenceInput {
  name?: string;
  description?: string;
  status?: AutomationStatus;
  emails?: Omit<SequenceEmail, "id">[];
}
