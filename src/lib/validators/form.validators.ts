/**
 * 🌟 Form Validation Schemas - Divine Validation Framework
 * Comprehensive Zod schemas for all form types
 * Following: 12_ERROR_HANDLING_VALIDATION, 02_AGRICULTURAL_QUANTUM_MASTERY
 */

import { z } from "zod";

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase()
  .trim();

// Phone validation (supports multiple formats)
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(
    /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/,
    "Invalid phone number format",
  );

// Password validation (strong password requirements)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .optional()
  .or(z.literal(""));

// Slug validation
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(100, "Slug must be less than 100 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens");

// Postal code validation
export const postalCodeSchema = z
  .string()
  .min(1, "Postal code is required")
  .max(10, "Invalid postal code");

// ============================================================================
// USER & AUTH SCHEMAS
// ============================================================================

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["CUSTOMER", "FARMER", "ADMIN"]).default("CUSTOMER"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Invalid reset token"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

// ============================================================================
// ADDRESS SCHEMAS
// ============================================================================

export const addressSchema = z.object({
  street: z
    .string()
    .min(3, "Street address must be at least 3 characters")
    .max(200, "Street address is too long"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(2, "State is required")
    .max(100, "State name is too long"),
  postalCode: postalCodeSchema,
  country: z
    .string()
    .min(2, "Country is required")
    .max(100, "Country name is too long")
    .default("United States"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const shippingAddressSchema = addressSchema.extend({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: phoneSchema,
  isDefault: z.boolean().default(false),
  deliveryInstructions: z
    .string()
    .max(500, "Instructions must be less than 500 characters")
    .optional(),
});

// ============================================================================
// FARM SCHEMAS (AGRICULTURAL CONSCIOUSNESS)
// ============================================================================

export const farmSchema = z.object({
  name: z
    .string()
    .min(3, "Farm name must be at least 3 characters")
    .max(100, "Farm name must be less than 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),
  farmingPractices: z
    .array(
      z.enum([
        "ORGANIC",
        "BIODYNAMIC",
        "REGENERATIVE",
        "PERMACULTURE",
        "CONVENTIONAL",
        "SUSTAINABLE",
      ]),
    )
    .min(1, "Select at least one farming practice"),
  certifications: z
    .array(
      z.enum([
        "USDA_ORGANIC",
        "CERTIFIED_NATURALLY_GROWN",
        "BIODYNAMIC",
        "FAIR_TRADE",
        "ANIMAL_WELFARE_APPROVED",
        "NON_GMO",
      ]),
    )
    .optional(),
  location: addressSchema,
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  website: urlSchema,
  establishedYear: z
    .number()
    .int()
    .min(1800, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
  acreage: z
    .number()
    .positive("Acreage must be a positive number")
    .max(100000, "Acreage seems unrealistic")
    .optional(),
  farmType: z
    .array(
      z.enum([
        "VEGETABLE",
        "FRUIT",
        "DAIRY",
        "MEAT",
        "POULTRY",
        "EGGS",
        "HONEY",
        "FLOWERS",
        "HERBS",
        "MIXED",
      ]),
    )
    .min(1, "Select at least one farm type"),
  seasonalAvailability: z
    .object({
      spring: z.boolean().default(true),
      summer: z.boolean().default(true),
      fall: z.boolean().default(true),
      winter: z.boolean().default(false),
    })
    .optional(),
});

export const createFarmSchema = farmSchema;

export const updateFarmSchema = farmSchema.partial();

// ============================================================================
// PRODUCT SCHEMAS (AGRICULTURAL CONSCIOUSNESS)
// ============================================================================

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.enum([
    "VEGETABLES",
    "FRUITS",
    "DAIRY",
    "MEAT",
    "POULTRY",
    "EGGS",
    "HONEY",
    "BAKED_GOODS",
    "PRESERVES",
    "HERBS",
    "FLOWERS",
    "OTHER",
  ]),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(10000, "Price seems unrealistic"),
  unit: z.enum([
    "LB",
    "OZ",
    "KG",
    "GRAM",
    "EACH",
    "BUNCH",
    "DOZEN",
    "PINT",
    "QUART",
    "GALLON",
  ]),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
  minOrderQuantity: z
    .number()
    .int()
    .positive("Minimum order must be at least 1")
    .default(1),
  maxOrderQuantity: z
    .number()
    .int()
    .positive("Maximum order must be greater than 0")
    .optional(),
  farmId: z.string().min(1, "Farm ID is required"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one product image is required")
    .max(10, "Maximum 10 images allowed"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  isOrganic: z.boolean().default(false),
  isSeasonal: z.boolean().default(true),
  availableFrom: z.date().optional(),
  availableTo: z.date().optional(),
  nutritionInfo: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbohydrates: z.number().optional(),
      fat: z.number().optional(),
      fiber: z.number().optional(),
    })
    .optional(),
  storageInstructions: z
    .string()
    .max(500, "Storage instructions must be less than 500 characters")
    .optional(),
});

export const createProductSchema = productSchema;

export const updateProductSchema = productSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().positive("Price must be greater than 0"),
  farmId: z.string().min(1, "Farm ID is required"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  shippingAddress: shippingAddressSchema,
  deliveryDate: z.date().min(new Date(), "Delivery date must be in the future"),
  deliveryTime: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
  deliveryInstructions: z
    .string()
    .max(500, "Instructions must be less than 500 characters")
    .optional(),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "CASH_ON_DELIVERY"]),
  useWalletCredit: z.boolean().default(false),
  promoCode: z.string().max(50, "Invalid promo code").optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const reviewSchema = z
  .object({
    productId: z.string().min(1, "Product ID is required").optional(),
    farmId: z.string().min(1, "Farm ID is required").optional(),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be less than 100 characters"),
    comment: z
      .string()
      .min(20, "Comment must be at least 20 characters")
      .max(1000, "Comment must be less than 1000 characters"),
    images: z
      .array(z.string().url("Invalid image URL"))
      .max(5, "Maximum 5 images allowed")
      .optional(),
    wouldRecommend: z.boolean().default(true),
  })
  .refine((data) => data.productId || data.farmId, {
    message: "Either productId or farmId must be provided",
    path: ["productId"],
  });

// ============================================================================
// CONTACT & SUPPORT SCHEMAS
// ============================================================================

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be less than 2000 characters"),
  category: z
    .enum([
      "GENERAL_INQUIRY",
      "TECHNICAL_SUPPORT",
      "BILLING",
      "FARM_INQUIRY",
      "PRODUCT_INQUIRY",
      "COMPLAINT",
      "SUGGESTION",
    ])
    .default("GENERAL_INQUIRY"),
  attachments: z
    .array(z.string().url("Invalid attachment URL"))
    .max(3, "Maximum 3 attachments allowed")
    .optional(),
});

export const supportTicketSchema = z.object({
  subject: z
    .string()
    .min(10, "Subject must be at least 10 characters")
    .max(200, "Subject is too long"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z.enum([
    "ACCOUNT",
    "ORDER",
    "PAYMENT",
    "DELIVERY",
    "PRODUCT",
    "TECHNICAL",
    "OTHER",
  ]),
  orderId: z.string().optional(),
  attachments: z
    .array(z.string().url("Invalid attachment URL"))
    .max(5, "Maximum 5 attachments allowed")
    .optional(),
});

// ============================================================================
// SEARCH & FILTER SCHEMAS
// ============================================================================

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Query is too long"),
  category: z.string().optional(),
  farmId: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  isOrganic: z.boolean().optional(),
  inStock: z.boolean().optional(),
  sortBy: z
    .enum([
      "RELEVANCE",
      "PRICE_LOW_TO_HIGH",
      "PRICE_HIGH_TO_LOW",
      "NEWEST",
      "RATING",
    ])
    .default("RELEVANCE"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const farmSearchSchema = z.object({
  query: z.string().max(100, "Query is too long").optional(),
  practices: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  farmTypes: z.array(z.string()).optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      radius: z.number().positive().max(500).default(50), // km
    })
    .optional(),
  sortBy: z
    .enum(["RELEVANCE", "DISTANCE", "RATING", "NEWEST"])
    .default("RELEVANCE"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// MULTI-STEP FORM SCHEMAS (AGRICULTURAL PATTERNS)
// ============================================================================

// Step 1: Farm Basic Info
export const farmBasicInfoSchema = z.object({
  name: z
    .string()
    .min(3, "Farm name must be at least 3 characters")
    .max(100, "Farm name is too long"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description is too long"),
  establishedYear: z
    .number()
    .int()
    .min(1800, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
});

// Step 2: Farm Location
export const farmLocationSchema = z.object({
  location: addressSchema,
  acreage: z.number().positive().max(100000).optional(),
});

// Step 3: Farm Practices
export const farmPracticesSchema = z.object({
  farmingPractices: z
    .array(z.string())
    .min(1, "Select at least one farming practice"),
  certifications: z.array(z.string()).optional(),
  farmType: z.array(z.string()).min(1, "Select at least one farm type"),
});

// Step 4: Farm Contact
export const farmContactSchema = z.object({
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  website: urlSchema,
});

// Combined multi-step farm schema
export const multiStepFarmSchema = z.object({
  basicInfo: farmBasicInfoSchema,
  location: farmLocationSchema,
  practices: farmPracticesSchema,
  contact: farmContactSchema,
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const imageUploadSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z
          .number()
          .max(10 * 1024 * 1024, "File size must be less than 10MB"),
        type: z
          .string()
          .refine(
            (type) => type.startsWith("image/"),
            "Only image files are allowed",
          ),
      }),
    )
    .min(1, "At least one file is required")
    .max(10, "Maximum 10 files allowed"),
  category: z.enum(["PRODUCT", "FARM", "PROFILE", "CERTIFICATION"]).optional(),
});

export const documentUploadSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z
          .number()
          .max(20 * 1024 * 1024, "File size must be less than 20MB"),
        type: z
          .string()
          .refine(
            (type) =>
              type === "application/pdf" ||
              type.includes("document") ||
              type.includes("word"),
            "Only PDF and document files are allowed",
          ),
      }),
    )
    .min(1, "At least one file is required")
    .max(5, "Maximum 5 files allowed"),
  documentType: z
    .enum(["CERTIFICATION", "LICENSE", "INSURANCE", "CONTRACT", "OTHER"])
    .default("OTHER"),
});

// ============================================================================
// NEWSLETTER & SUBSCRIPTION SCHEMAS
// ============================================================================

export const newsletterSchema = z.object({
  email: emailSchema,
  preferences: z
    .object({
      weeklyDeals: z.boolean().default(true),
      seasonalUpdates: z.boolean().default(true),
      newFarms: z.boolean().default(false),
      recipes: z.boolean().default(false),
    })
    .optional(),
});

// ============================================================================
// AGRICULTURAL VALIDATION HELPERS
// ============================================================================

export const seasonalDateValidator = (date: Date): boolean => {
  // Validate that date makes sense for agricultural context
  const today = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(today.getFullYear() + 1);

  return date >= today && date <= maxFutureDate;
};

export const harvestSeasonValidator = (
  startDate: Date,
  endDate: Date,
): boolean => {
  return endDate > startDate;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type FarmFormData = z.infer<typeof farmSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type OrderFormData = z.infer<typeof createOrderSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type MultiStepFarmFormData = z.infer<typeof multiStepFarmSchema>;
