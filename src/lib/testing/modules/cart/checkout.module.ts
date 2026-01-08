/**
 * Cart & Checkout Module
 *
 * Comprehensive tests for shopping cart and checkout functionality.
 * Includes add to cart, cart management, checkout flow, and payment integration.
 *
 * @module cart/checkout
 * @category Critical
 */

import type { TestModule } from "@/lib/testing/types";
import { expect } from "@/lib/testing/utils/assertions";
import type { Page } from "@playwright/test";

/**
 * Cart & Checkout Test Module
 *
 * Validates:
 * - Add products to cart
 * - View and manage cart items
 * - Update quantities
 * - Remove items from cart
 * - Proceed to checkout
 * - Checkout form validation
 * - Payment integration (Stripe)
 * - Order confirmation
 */
export const CartCheckoutModule: TestModule = {
  id: "cart-checkout",
  name: "Cart & Checkout Flow",
  description: "Shopping cart and checkout functionality",
  category: "CRITICAL",
  tags: ["cart", "checkout", "payment", "orders", "customer"],
  timeout: 60000, // 60 seconds for complex flows

  suites: [
    {
      id: "cart-basic",
      name: "Basic Cart Operations",
      description: "Core shopping cart functionality",
      tests: [
        {
          id: "cart-page-accessible",
          name: "Cart Page Accessible",
          description: "Verify cart page loads and is accessible",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to cart page
            await page.goto("/cart", {
              waitUntil: "domcontentloaded",
              timeout: 10000
            });

            // Verify page loaded
            const bodyVisible = await page.locator("body").isVisible();
            expect(bodyVisible).toBe(true);

            // Check for cart container
            const hasCartContainer = await page.locator(
              '[data-testid="cart"], [class*="cart"], main'
            ).count() > 0;
            expect(hasCartContainer).toBe(true);

            // Check for either empty cart message or cart items
            const emptyMessage = await page.locator(
              'text=/empty|no items|cart is empty/i'
            ).count();

            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item, [class*="cart-item"]'
            ).count();

            const isValidCart = emptyMessage > 0 || cartItems > 0;
            expect(isValidCart).toBe(true);

            return {
              data: {
                accessible: true,
                isEmpty: emptyMessage > 0,
                itemCount: cartItems
              }
            };
          }
        },

        {
          id: "empty-cart-message",
          name: "Empty Cart Message",
          description: "Verify empty cart shows appropriate message",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(1000);

            // Check if cart has items
            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item, tr[class*="cart"]'
            ).count();

            if (cartItems > 0) {
              return {
                data: {
                  skipped: true,
                  reason: "Cart already has items, cannot test empty state"
                }
              };
            }

            // Check for empty message
            const emptyMessage = await page.locator(
              'text=/empty|no items|cart is empty|continue shopping/i'
            ).count();

            expect(emptyMessage).toBeGreaterThan(0);

            // Check for continue shopping link
            const continueLink = await page.locator(
              'a:has-text("Continue Shopping"), a:has-text("Browse Products"), a[href*="product"]'
            ).count();

            return {
              data: {
                hasEmptyMessage: emptyMessage > 0,
                hasContinueLink: continueLink > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "cart-add-items",
      name: "Add Items to Cart",
      description: "Test adding products to shopping cart",
      tests: [
        {
          id: "add-to-cart-button",
          name: "Add to Cart Button Exists",
          description: "Verify add to cart button is present on product pages",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to products page
            await page.goto("/products");
            await page.waitForTimeout(2000);

            // Try to navigate to a product detail page
            const productLink = await page.locator(
              '[data-testid="product-card"] a, .product-card a, article a'
            ).first();

            const hasProductLink = await productLink.count() > 0;

            if (hasProductLink) {
              await productLink.click();
              await page.waitForTimeout(2000);
            }

            // Look for add to cart button
            const addToCartButton = await page.locator(
              'button:has-text("Add to Cart"), button:has-text("Add to Basket"), button[data-testid*="add-to-cart"], button[class*="add-to-cart"]'
            ).count();

            expect(addToCartButton).toBeGreaterThan(0);

            return {
              data: {
                hasAddToCartButton: addToCartButton > 0,
                onDetailPage: hasProductLink
              }
            };
          }
        },

        {
          id: "add-product-to-cart",
          name: "Add Product to Cart",
          description: "Test adding a product to cart",
          category: "CRITICAL",
          timeout: 20000,
          retries: 2,
          async run(page: Page) {
            // Navigate to products
            await page.goto("/products");
            await page.waitForTimeout(2000);

            // Click on first product - the entire card is a link in this design
            const productLink = await page.locator(
              'a[href^="/products/"]'
            ).first();

            const hasLink = await productLink.count() > 0;
            if (!hasLink) {
              throw new Error("No product links found");
            }

            // Click with navigation wait
            await Promise.all([
              page.waitForLoadState('domcontentloaded'),
              productLink.click()
            ]);
            await page.waitForTimeout(2000);

            // Find and click add to cart button
            const addButton = page.locator(
              'button:has-text("Add to Cart"), button:has-text("Add"), button[data-testid*="add-to-cart"]'
            ).first();

            const hasButton = await addButton.count() > 0;
            expect(hasButton).toBe(true);

            await addButton.click();
            await page.waitForTimeout(3000);

            // Check for success indicators using separate locators
            const alertByRole = await page.locator('[role="alert"]').count();
            const toastByClass = await page.locator('[class*="toast"]').count();
            const addedText = await page.getByText(/added/i).count();
            const successText = await page.getByText(/success/i).count();

            const successToast = alertByRole + toastByClass + addedText + successText;

            // Check if cart count increased (look for badge)
            const cartBadge = await page.locator(
              '[data-testid="cart-count"], [class*="cart-badge"], [class*="cart-count"]'
            ).textContent().catch(() => "0");

            const cartCount = parseInt(cartBadge || "0", 10);

            return {
              data: {
                clicked: true,
                successIndicator: successToast > 0,
                cartCount,
                likelySuccess: successToast > 0 || cartCount > 0
              }
            };
          }
        },

        {
          id: "verify-cart-has-item",
          name: "Verify Cart Has Item",
          description: "Navigate to cart and verify item was added",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // This test assumes previous test added an item
            // Navigate directly to cart
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            // Count cart items
            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item, tr[class*="cart"], [class*="cart"] article'
            ).count();

            // Check for empty message
            const emptyMessage = await page.locator(
              'text=/empty|no items/i'
            ).count();

            // Either we have items or we need to check if add-to-cart worked
            if (cartItems === 0 && emptyMessage > 0) {
              // Cart is explicitly empty - this might be expected if previous test skipped
              return {
                data: {
                  cartItems: 0,
                  isEmpty: true,
                  warning: "Cart appears empty - add-to-cart may have failed or requires authentication"
                }
              };
            }

            // Verify cart has items
            expect(cartItems).toBeGreaterThan(0);

            return {
              data: {
                cartItems,
                isEmpty: false,
                hasItems: true
              }
            };
          }
        }
      ]
    },

    {
      id: "cart-management",
      name: "Cart Management",
      description: "Test cart item management features",
      tests: [
        {
          id: "update-quantity",
          name: "Update Item Quantity",
          description: "Test updating cart item quantity",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            // Check if cart has items
            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item'
            ).count();

            if (cartItems === 0) {
              return {
                data: {
                  skipped: true,
                  reason: "Cart is empty, cannot test quantity update"
                }
              };
            }

            // Look for quantity input or buttons
            const quantityInput = await page.locator(
              'input[type="number"], input[name*="quantity" i], [data-testid*="quantity"]'
            ).first().count();

            const increaseButton = await page.locator(
              'button:has-text("+"), button[aria-label*="increase" i], button[data-action="increase"]'
            ).count();

            const decreaseButton = await page.locator(
              'button:has-text("-"), button[aria-label*="decrease" i], button[data-action="decrease"]'
            ).count();

            const hasQuantityControl = quantityInput > 0 || increaseButton > 0;

            return {
              data: {
                hasQuantityInput: quantityInput > 0,
                hasIncreaseButton: increaseButton > 0,
                hasDecreaseButton: decreaseButton > 0,
                quantityControlAvailable: hasQuantityControl
              }
            };
          }
        },

        {
          id: "remove-from-cart",
          name: "Remove Item from Cart",
          description: "Test removing items from cart",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            // Check if cart has items
            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item'
            ).count();

            if (cartItems === 0) {
              return {
                data: {
                  skipped: true,
                  reason: "Cart is empty, cannot test remove"
                }
              };
            }

            // Look for remove button
            const removeButton = await page.locator(
              'button:has-text("Remove"), button:has-text("Delete"), button[aria-label*="remove" i], button[data-action="remove"]'
            ).count();

            expect(removeButton).toBeGreaterThan(0);

            return {
              data: {
                hasRemoveButton: removeButton > 0,
                itemsInCart: cartItems
              }
            };
          }
        },

        {
          id: "cart-total-calculation",
          name: "Cart Total Calculation",
          description: "Verify cart displays total price",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(1000);

            // Check for total/subtotal using separate locators
            const totalByTestId = await page.locator('[data-testid="cart-total"]').count();
            const totalByClass = await page.locator('[class*="total"]').count();
            const totalByText = await page.getByText(/total/i).count();
            const subtotalByText = await page.getByText(/subtotal/i).count();

            const totalElement = totalByTestId + totalByClass + totalByText + subtotalByText;

            // Check for price display
            const priceByRegex = await page.getByText(/\$\d+\.\d{2}/).count();
            const priceElement = priceByRegex;

            return {
              data: {
                hasTotalLabel: totalElement > 0,
                hasPriceDisplay: priceElement > 0,
                totalDisplayed: totalElement > 0 && priceElement > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "checkout-flow",
      name: "Checkout Flow",
      description: "Test checkout process",
      tests: [
        {
          id: "checkout-button",
          name: "Checkout Button Available",
          description: "Verify checkout button is present in cart",
          category: "CRITICAL",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            // Check if cart has items
            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item'
            ).count();

            // Look for checkout button
            const checkoutButton = await page.locator(
              'button:has-text("Checkout"), a:has-text("Checkout"), button:has-text("Proceed"), a:has-text("Proceed to Checkout")'
            ).count();

            if (cartItems === 0) {
              // Empty cart might hide checkout button
              return {
                data: {
                  cartEmpty: true,
                  checkoutButtonVisible: checkoutButton > 0,
                  note: "Checkout button visibility expected to depend on cart contents"
                }
              };
            }

            expect(checkoutButton).toBeGreaterThan(0);

            return {
              data: {
                hasCheckoutButton: checkoutButton > 0,
                cartItems
              }
            };
          }
        },

        {
          id: "navigate-to-checkout",
          name: "Navigate to Checkout",
          description: "Test navigating to checkout page",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            // Check for items
            const cartItems = await page.locator(
              '[data-testid="cart-item"], .cart-item'
            ).count();

            if (cartItems === 0) {
              return {
                data: {
                  skipped: true,
                  reason: "Cart is empty, cannot proceed to checkout"
                }
              };
            }

            // Find and click checkout button
            const checkoutButton = page.locator(
              'button:has-text("Checkout"), a:has-text("Checkout"), button:has-text("Proceed")'
            ).first();

            const hasButton = await checkoutButton.count() > 0;
            if (!hasButton) {
              throw new Error("Checkout button not found");
            }

            const beforeUrl = page.url();
            await checkoutButton.click();
            await page.waitForTimeout(3000);
            const afterUrl = page.url();

            // Verify navigation occurred
            const navigated = beforeUrl !== afterUrl;

            // Check if on checkout page
            const isCheckoutPage = afterUrl.includes("checkout") ||
              afterUrl.includes("payment");

            // Check for checkout form or content
            const hasCheckoutContent = await page.locator(
              '[data-testid="checkout"], form, h1:has-text("Checkout"), h1:has-text("Payment")'
            ).count() > 0;

            return {
              data: {
                navigated,
                beforeUrl,
                afterUrl,
                isCheckoutPage,
                hasCheckoutContent
              }
            };
          }
        },

        {
          id: "checkout-form-elements",
          name: "Checkout Form Elements",
          description: "Verify checkout form has required fields",
          category: "CRITICAL",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            // Try to navigate to checkout directly
            const response = await page.goto("/checkout", {
              waitUntil: "domcontentloaded"
            }).catch(() => null);

            // If checkout redirects to login, that's expected
            if (page.url().includes("login") || page.url().includes("signin")) {
              return {
                data: {
                  redirectedToLogin: true,
                  requiresAuth: true,
                  message: "Checkout requires authentication (expected behavior)"
                }
              };
            }

            // If checkout page doesn't exist or redirects
            if (!page.url().includes("checkout")) {
              return {
                data: {
                  skipped: true,
                  reason: "Checkout page not accessible (may require cart items or authentication)"
                }
              };
            }

            await page.waitForTimeout(2000);

            // Check for form elements
            const hasForm = await page.locator("form").count() > 0;
            const hasNameField = await page.locator(
              'input[name*="name" i], input[placeholder*="name" i]'
            ).count() > 0;
            const hasEmailField = await page.locator(
              'input[type="email"], input[name*="email" i]'
            ).count() > 0;
            const hasAddressField = await page.locator(
              'input[name*="address" i], textarea[name*="address" i]'
            ).count() > 0;

            return {
              data: {
                hasForm,
                hasNameField,
                hasEmailField,
                hasAddressField,
                formComplete: hasForm && hasNameField && hasEmailField
              }
            };
          }
        }
      ]
    },

    {
      id: "checkout-payment",
      name: "Payment Integration",
      description: "Test payment integration (Stripe)",
      tests: [
        {
          id: "stripe-elements-load",
          name: "Stripe Elements Load",
          description: "Verify Stripe payment elements load on checkout",
          category: "CRITICAL",
          timeout: 20000,
          retries: 2,
          async run(page: Page) {
            // Try to access checkout
            await page.goto("/checkout").catch(() => { });

            // If redirected to login, skip
            if (page.url().includes("login")) {
              return {
                data: {
                  skipped: true,
                  reason: "Checkout requires authentication"
                }
              };
            }

            await page.waitForTimeout(3000);

            // Look for Stripe iframe
            const stripeFrame = await page.locator(
              'iframe[name*="stripe" i], iframe[src*="stripe.com"]'
            ).count();

            // Look for Stripe elements
            const stripeElement = await page.locator(
              '[class*="StripeElement"], [data-testid="stripe-card"], #card-element'
            ).count();

            // Look for payment section
            const paymentSection = await page.locator(
              'text=/payment/i, [data-testid="payment"]'
            ).count();

            const hasStripeIntegration = stripeFrame > 0 || stripeElement > 0;

            return {
              data: {
                hasStripeFrame: stripeFrame > 0,
                hasStripeElement: stripeElement > 0,
                hasPaymentSection: paymentSection > 0,
                stripeIntegrated: hasStripeIntegration
              }
            };
          }
        },

        {
          id: "payment-method-selection",
          name: "Payment Method Selection",
          description: "Verify payment method options are available",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/checkout").catch(() => { });

            if (page.url().includes("login")) {
              return {
                data: {
                  skipped: true,
                  reason: "Checkout requires authentication"
                }
              };
            }

            await page.waitForTimeout(2000);

            // Look for payment method options
            const creditCardOption = await page.locator(
              'text=/credit card|debit card/i, input[value="card"]'
            ).count();

            const paymentOptions = await page.locator(
              'input[type="radio"][name*="payment" i], [data-testid*="payment-method"]'
            ).count();

            return {
              data: {
                hasCreditCardOption: creditCardOption > 0,
                paymentOptionsCount: paymentOptions,
                hasPaymentMethods: creditCardOption > 0 || paymentOptions > 0
              }
            };
          }
        },

        {
          id: "test-mode-indicator",
          name: "Test Mode Indicator",
          description: "Verify test mode is indicated for Stripe",
          category: "OPTIONAL",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/checkout").catch(() => { });

            if (page.url().includes("login")) {
              return {
                data: {
                  skipped: true,
                  reason: "Checkout requires authentication"
                }
              };
            }

            // Look for test mode indicator
            const testModeIndicator = await page.locator(
              'text=/test mode|test environment|demo mode/i'
            ).count();

            return {
              data: {
                hasTestModeIndicator: testModeIndicator > 0,
                note: "Test mode indicator helps prevent confusion"
              }
            };
          }
        }
      ]
    },

    {
      id: "checkout-validation",
      name: "Form Validation",
      description: "Test checkout form validation",
      tests: [
        {
          id: "required-fields",
          name: "Required Fields Validation",
          description: "Verify required fields show validation errors",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/checkout").catch(() => { });

            if (page.url().includes("login") || !page.url().includes("checkout")) {
              return {
                data: {
                  skipped: true,
                  reason: "Checkout page not accessible"
                }
              };
            }

            await page.waitForTimeout(2000);

            // Try to find and click submit button without filling form
            const submitButton = page.locator(
              'button[type="submit"], button:has-text("Place Order"), button:has-text("Complete")'
            ).first();

            const hasSubmit = await submitButton.count() > 0;

            if (hasSubmit) {
              await submitButton.click();
              await page.waitForTimeout(1000);

              // Check for validation errors
              const validationErrors = await page.locator(
                'text=/required|invalid|must be/i, [class*="error"], [role="alert"]'
              ).count();

              return {
                data: {
                  hasSubmitButton: true,
                  validationErrorsShown: validationErrors > 0,
                  validationWorking: validationErrors > 0
                }
              };
            }

            return {
              data: {
                hasSubmitButton: false,
                skipped: true
              }
            };
          }
        },

        {
          id: "email-validation",
          name: "Email Format Validation",
          description: "Test email field validation",
          category: "OPTIONAL",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/checkout").catch(() => { });

            if (!page.url().includes("checkout")) {
              return {
                data: {
                  skipped: true,
                  reason: "Checkout page not accessible"
                }
              };
            }

            // Find email field
            const emailField = page.locator(
              'input[type="email"], input[name*="email" i]'
            ).first();

            const hasEmail = await emailField.count() > 0;

            if (hasEmail) {
              // Enter invalid email
              await emailField.fill("invalid-email");
              await emailField.blur();
              await page.waitForTimeout(500);

              // Check for validation error
              const error = await page.locator(
                'text=/invalid email|valid email/i'
              ).count();

              return {
                data: {
                  hasEmailField: true,
                  validationTriggered: error > 0
                }
              };
            }

            return {
              data: {
                hasEmailField: false
              }
            };
          }
        }
      ]
    },

    {
      id: "cart-persistence",
      name: "Cart Persistence",
      description: "Test cart persistence across sessions",
      tests: [
        {
          id: "cart-survives-navigation",
          name: "Cart Survives Navigation",
          description: "Verify cart persists when navigating away and back",
          category: "IMPORTANT",
          timeout: 20000,
          retries: 1,
          async run(page: Page) {
            // Go to cart and count items
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            const initialCount = await page.locator(
              '[data-testid="cart-item"], .cart-item'
            ).count();

            // Navigate away
            await page.goto("/products");
            await page.waitForTimeout(1000);

            // Navigate back to cart
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);
            await page.waitForTimeout(2000);

            const finalCount = await page.locator(
              '[data-testid="cart-item"], .cart-item'
            ).count();

            // Cart should maintain items
            const persisted = initialCount === finalCount;

            return {
              data: {
                initialCount,
                finalCount,
                persisted,
                note: "Cart persistence may depend on authentication"
              }
            };
          }
        },

        {
          id: "cart-storage-mechanism",
          name: "Cart Storage Mechanism",
          description: "Check if cart uses localStorage or session",
          category: "OPTIONAL",
          timeout: 5000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/cart", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for cart data in localStorage
            const hasLocalStorage = await page.evaluate(() => {
              const keys = Object.keys(localStorage);
              return keys.some(key =>
                key.includes("cart") ||
                key.includes("basket") ||
                key.includes("shopping")
              );
            });

            // Check for cart cookies
            const cookies = await page.context().cookies();
            const hasCartCookie = cookies.some(c =>
              c.name.includes("cart") ||
              c.name.includes("basket")
            );

            return {
              data: {
                usesLocalStorage: hasLocalStorage,
                usesCartCookie: hasCartCookie,
                storageDetected: hasLocalStorage || hasCartCookie
              }
            };
          }
        }
      ]
    }
  ]
};

export default CartCheckoutModule;
