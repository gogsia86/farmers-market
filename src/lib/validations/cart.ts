/**
 * ⚡ CART VALIDATION SCHEMAS
 * Zod schemas for cart operations
 */
import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export const cartItemSchema = z.object({
  id: z.string().cuid(),
  cartId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
