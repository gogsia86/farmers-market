/**
 * 🎯 Centralized Selectors
 * Unified Bot Framework - Page Element Selectors
 *
 * Single source of truth for all UI element selectors across the platform
 */

import type { PageSelectors } from '../types';

// ============================================================================
// COMPLETE SELECTOR MAP
// ============================================================================

export const SELECTORS: PageSelectors = {
  // ==========================================================================
  // COMMON ELEMENTS (Header, Footer, Navigation)
  // ==========================================================================
  common: {
    header: 'header, [role="banner"]',
    footer: 'footer, [role="contentinfo"]',
    navigation: 'nav, [role="navigation"]',
    logo: 'a[href="/"], img[alt*="logo" i], .logo',
    loginButton: 'a[href*="login"], button:has-text("Log In"), button:has-text("Sign In")',
    signupButton: 'a[href*="signup"], a[href*="register"], button:has-text("Sign Up"), button:has-text("Register")',
    userMenu: '[data-testid="user-menu"], .user-menu, button:has-text("Account")',
    searchInput: 'input[type="search"], input[placeholder*="Search" i]',
  },

  // ==========================================================================
  // AUTHENTICATION PAGES (Login, Register)
  // ==========================================================================
  auth: {
    // Form inputs
    emailInput: 'input[type="email"], input[name="email"], input[id*="email" i]',
    passwordInput: 'input[type="password"], input[name="password"], input[id*="password" i]',
    firstNameInput: 'input[name="firstName"], input[name="firstname"], input[id*="firstname" i], input[placeholder*="First Name" i]',
    lastNameInput: 'input[name="lastName"], input[name="lastname"], input[id*="lastname" i], input[placeholder*="Last Name" i]',

    // Buttons and actions
    submitButton: 'button[type="submit"], button:has-text("Submit"), button:has-text("Continue"), button:has-text("Sign Up"), button:has-text("Log In")',

    // Messages
    errorMessage: '.error, [role="alert"], .alert-error, .text-red-500, [class*="error"]',
    successMessage: '.success, .alert-success, .text-green-500, [class*="success"]',

    // Role selection
    roleSelector: 'input[name="role"], select[name="role"], [data-testid="role-selector"]',

    // Terms and conditions
    agreeCheckbox: 'input[type="checkbox"][name*="agree" i], input[type="checkbox"][name*="terms" i]',
  },

  // ==========================================================================
  // MARKETPLACE (Browse, Search, Filter)
  // ==========================================================================
  marketplace: {
    // Product grid
    productGrid: '[data-testid="product-grid"], .product-grid, .products-container, main section',
    productCard: '[data-testid="product-card"], .product-card, article',
    productImage: '[data-testid="product-image"], .product-image, img[alt*="product" i]',
    productName: '[data-testid="product-name"], .product-name, h2, h3',
    productPrice: '[data-testid="product-price"], .product-price, .price, [class*="price"]',

    // Actions
    addToCartButton: 'button:has-text("Add to Cart"), button:has-text("Add"), [data-testid="add-to-cart"]',

    // Search and filters
    searchInput: 'input[type="search"], input[placeholder*="Search" i], [data-testid="search-input"]',
    categoryFilter: 'select[name="category"], [data-testid="category-filter"], button:has-text("Category")',
    sortDropdown: 'select[name="sort"], [data-testid="sort-dropdown"], button:has-text("Sort")',
  },

  // ==========================================================================
  // SHOPPING CART
  // ==========================================================================
  cart: {
    // Cart icon and badge
    cartIcon: 'a[href*="cart"], button:has-text("Cart"), [data-testid="cart-icon"], svg[class*="cart"]',
    cartBadge: '[data-testid="cart-badge"], .cart-badge, .badge',

    // Cart items
    cartItems: '[data-testid="cart-items"], .cart-items',
    cartItem: '[data-testid="cart-item"], .cart-item',
    removeButton: 'button:has-text("Remove"), [data-testid="remove-item"], button[aria-label*="Remove" i]',
    quantityInput: 'input[type="number"], input[name*="quantity" i], [data-testid="quantity-input"]',

    // Cart actions
    checkoutButton: 'button:has-text("Checkout"), a[href*="checkout"], [data-testid="checkout-button"]',

    // Cart state
    emptyCartMessage: 'text=/empty/i, text=/no items/i, [data-testid="empty-cart"]',
    totalPrice: '[data-testid="total-price"], .total-price, .cart-total',
  },

  // ==========================================================================
  // FARMER DASHBOARD (Farm & Product Management)
  // ==========================================================================
  farmer: {
    // Farm setup
    farmNameInput: 'input[name="name"], input[name="farmName"], input[placeholder*="Farm Name" i]',
    farmDescriptionInput: 'textarea[name="description"], [data-testid="farm-description"]',
    farmAddressInput: 'input[name="address"], input[placeholder*="Address" i]',

    // Product management
    productNameInput: 'input[name="name"], input[name="productName"], input[placeholder*="Product Name" i]',
    productPriceInput: 'input[name="price"], input[type="number"][placeholder*="Price" i]',
    productStockInput: 'input[name="stock"], input[name="quantity"], input[name="quantityAvailable"]',
    productCategorySelect: 'select[name="category"], [data-testid="category-select"]',

    // Image upload
    imageUploadInput: 'input[type="file"], [data-testid="image-upload"]',

    // Actions
    saveButton: 'button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Update")',

    // Navigation tabs
    ordersTab: 'a[href*="orders"], button:has-text("Orders"), [data-testid="orders-tab"]',
    productsTab: 'a[href*="products"], button:has-text("Products"), [data-testid="products-tab"]',
  },

  // ==========================================================================
  // ADMIN DASHBOARD (User & Farm Management)
  // ==========================================================================
  admin: {
    // Navigation tabs
    farmsTab: 'a[href*="farms"], button:has-text("Farms"), [data-testid="farms-tab"]',
    usersTab: 'a[href*="users"], button:has-text("Users"), [data-testid="users-tab"]',
    ordersTab: 'a[href*="orders"], button:has-text("Orders"), [data-testid="orders-tab"]',

    // Farm approval
    pendingFarms: '[data-testid="pending-farms"], .pending-farms, [data-status="pending"]',
    approveButton: 'button:has-text("Approve"), [data-testid="approve-button"]',
    rejectButton: 'button:has-text("Reject"), [data-testid="reject-button"]',

    // Tables
    userTable: '[data-testid="user-table"], table:has-text("Users")',
    orderTable: '[data-testid="order-table"], table:has-text("Orders")',
  },
};

// ============================================================================
// SELECTOR UTILITIES
// ============================================================================

/**
 * Get selector by path (e.g., "common.header")
 */
export function getSelector(path: string): string | string[] {
  const parts = path.split('.');
  let current: any = SELECTORS;

  for (const part of parts) {
    if (current[part] === undefined) {
      throw new Error(`Selector not found: ${path}`);
    }
    current = current[part];
  }

  return current;
}

/**
 * Build a compound selector from multiple selectors
 */
export function combineSelectors(...selectors: (string | string[])[]): string {
  const flattened = selectors.flat();
  return flattened.join(', ');
}

/**
 * Create a text-based selector
 */
export function textSelector(text: string, exact: boolean = false): string {
  return exact ? `text="${text}"` : `text=/${text}/i`;
}

/**
 * Create a placeholder-based selector
 */
export function placeholderSelector(text: string): string {
  return `input[placeholder*="${text}" i]`;
}

/**
 * Create a data-testid selector
 */
export function testIdSelector(testId: string): string {
  return `[data-testid="${testId}"]`;
}

/**
 * Create an aria-label selector
 */
export function ariaLabelSelector(label: string): string {
  return `[aria-label*="${label}" i]`;
}

/**
 * Try multiple selectors in order (returns first that exists)
 */
export function fallbackSelector(...selectors: string[]): string {
  return selectors.join(', ');
}

// ============================================================================
// SPECIFIC SELECTOR GROUPS
// ============================================================================

/**
 * Get all login-related selectors
 */
export function getLoginSelectors() {
  return {
    page: 'a[href*="login"], button:has-text("Log In")',
    emailInput: SELECTORS.auth.emailInput,
    passwordInput: SELECTORS.auth.passwordInput,
    submitButton: SELECTORS.auth.submitButton,
    errorMessage: SELECTORS.auth.errorMessage,
  };
}

/**
 * Get all registration-related selectors
 */
export function getRegistrationSelectors() {
  return {
    page: 'a[href*="register"], a[href*="signup"]',
    emailInput: SELECTORS.auth.emailInput,
    passwordInput: SELECTORS.auth.passwordInput,
    firstNameInput: SELECTORS.auth.firstNameInput,
    lastNameInput: SELECTORS.auth.lastNameInput,
    roleSelector: SELECTORS.auth.roleSelector,
    agreeCheckbox: SELECTORS.auth.agreeCheckbox,
    submitButton: SELECTORS.auth.submitButton,
    errorMessage: SELECTORS.auth.errorMessage,
  };
}

/**
 * Get all cart-related selectors
 */
export function getCartSelectors() {
  return {
    cartIcon: SELECTORS.cart.cartIcon,
    cartBadge: SELECTORS.cart.cartBadge,
    cartItems: SELECTORS.cart.cartItems,
    checkoutButton: SELECTORS.cart.checkoutButton,
    emptyCartMessage: SELECTORS.cart.emptyCartMessage,
    totalPrice: SELECTORS.cart.totalPrice,
  };
}

/**
 * Get all marketplace-related selectors
 */
export function getMarketplaceSelectors() {
  return {
    productGrid: SELECTORS.marketplace.productGrid,
    productCard: SELECTORS.marketplace.productCard,
    productName: SELECTORS.marketplace.productName,
    productPrice: SELECTORS.marketplace.productPrice,
    addToCartButton: SELECTORS.marketplace.addToCartButton,
    searchInput: SELECTORS.marketplace.searchInput,
  };
}

/**
 * Get all farmer dashboard selectors
 */
export function getFarmerSelectors() {
  return {
    farmNameInput: SELECTORS.farmer.farmNameInput,
    farmDescriptionInput: SELECTORS.farmer.farmDescriptionInput,
    productNameInput: SELECTORS.farmer.productNameInput,
    productPriceInput: SELECTORS.farmer.productPriceInput,
    productStockInput: SELECTORS.farmer.productStockInput,
    saveButton: SELECTORS.farmer.saveButton,
    ordersTab: SELECTORS.farmer.ordersTab,
    productsTab: SELECTORS.farmer.productsTab,
  };
}

/**
 * Get all admin dashboard selectors
 */
export function getAdminSelectors() {
  return {
    farmsTab: SELECTORS.admin.farmsTab,
    usersTab: SELECTORS.admin.usersTab,
    ordersTab: SELECTORS.admin.ordersTab,
    pendingFarms: SELECTORS.admin.pendingFarms,
    approveButton: SELECTORS.admin.approveButton,
    rejectButton: SELECTORS.admin.rejectButton,
  };
}

// ============================================================================
// SELECTOR VALIDATION
// ============================================================================

/**
 * Validate that all selectors are defined
 */
export function validateSelectors(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  function checkObject(obj: any, path: string = '') {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'object' && !Array.isArray(value)) {
        checkObject(value, currentPath);
      } else if (value === undefined || value === null || value === '') {
        missing.push(currentPath);
      }
    }
  }

  checkObject(SELECTORS);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get all selectors as a flat object
 */
export function getAllSelectors(): Record<string, string | string[]> {
  const flat: Record<string, string | string[]> = {};

  function flatten(obj: any, prefix: string = '') {
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, newKey);
      } else {
        flat[newKey] = value;
      }
    }
  }

  flatten(SELECTORS);
  return flat;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SELECTORS;
