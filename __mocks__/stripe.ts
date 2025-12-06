/**
 * ⚡ DIVINE STRIPE MOCK
 * Global Stripe mock for all Jest tests
 * Prevents API calls and provides deterministic test behavior
 *
 * @version 1.0.0
 */

// ✅ MOCK FUNCTIONS - Store references for test assertions
export const mockPaymentIntentsCreate = jest.fn();
export const mockPaymentIntentsRetrieve = jest.fn();
export const mockPaymentIntentsUpdate = jest.fn();
export const mockPaymentIntentsCancel = jest.fn();
export const mockRefundsCreate = jest.fn();
export const mockRefundsRetrieve = jest.fn();
export const mockWebhooksConstructEvent = jest.fn();
export const mockCustomersCreate = jest.fn();
export const mockCustomersRetrieve = jest.fn();

// ✅ MOCK STRIPE CLASS
class MockStripe {
  public apiVersion = "2025-11-17.clover";
  public typescript = true;

  public paymentIntents = {
    create: mockPaymentIntentsCreate,
    retrieve: mockPaymentIntentsRetrieve,
    update: mockPaymentIntentsUpdate,
    cancel: mockPaymentIntentsCancel,
  };

  public refunds = {
    create: mockRefundsCreate,
    retrieve: mockRefundsRetrieve,
  };

  public webhooks = {
    constructEvent: mockWebhooksConstructEvent,
  };

  public customers = {
    create: mockCustomersCreate,
    retrieve: mockCustomersRetrieve,
  };

  constructor(_apiKey: string, _config?: Record<string, unknown>) {
    // Mock constructor - no-op
  }
}

// ✅ DEFAULT EXPORT - Stripe constructor
export default MockStripe;

// ✅ TYPE EXPORTS - Mock Stripe types for tests
export namespace StripeTypes {
  export type PaymentIntentStatus =
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded";

  export interface PaymentIntent {
    id: string;
    object: "payment_intent";
    amount: number;
    currency: string;
    status: PaymentIntentStatus;
    client_secret: string | null;
    metadata: Record<string, string>;
    last_payment_error?: {
      message: string;
    } | null;
  }

  export interface Refund {
    id: string;
    object: "refund";
    amount: number;
    status: string;
    payment_intent: string;
    reason?: string | null;
  }

  export interface Charge {
    id: string;
    object: "charge";
    amount: number;
    amount_refunded: number;
    payment_intent: string | null;
  }

  export interface Event {
    id: string;
    object: "event";
    type: string;
    data: {
      object: unknown;
    };
  }

  export interface Customer {
    id: string;
    object: "customer";
    email: string | null;
    name: string | null;
  }
}

// ✅ HELPER FUNCTION - Reset all mocks
export function resetStripeMocks() {
  mockPaymentIntentsCreate.mockReset();
  mockPaymentIntentsRetrieve.mockReset();
  mockPaymentIntentsUpdate.mockReset();
  mockPaymentIntentsCancel.mockReset();
  mockRefundsCreate.mockReset();
  mockRefundsRetrieve.mockReset();
  mockWebhooksConstructEvent.mockReset();
  mockCustomersCreate.mockReset();
  mockCustomersRetrieve.mockReset();
}

// ✅ HELPER FUNCTION - Clear all mock calls
export function clearStripeMocks() {
  mockPaymentIntentsCreate.mockClear();
  mockPaymentIntentsRetrieve.mockClear();
  mockPaymentIntentsUpdate.mockClear();
  mockPaymentIntentsCancel.mockClear();
  mockRefundsCreate.mockClear();
  mockRefundsRetrieve.mockClear();
  mockWebhooksConstructEvent.mockClear();
  mockCustomersCreate.mockClear();
  mockCustomersRetrieve.mockClear();
}

// ✅ TEST DATA FACTORIES - Helper functions for creating mock data
export const createMockPaymentIntent = (
  overrides?: Partial<StripeTypes.PaymentIntent>,
): StripeTypes.PaymentIntent => ({
  id: "pi_mock_123",
  object: "payment_intent",
  amount: 5000,
  currency: "usd",
  status: "succeeded",
  client_secret: "pi_mock_123_secret_test",
  metadata: {},
  ...overrides,
});

export const createMockRefund = (
  overrides?: Partial<StripeTypes.Refund>,
): StripeTypes.Refund => ({
  id: "re_mock_123",
  object: "refund",
  amount: 5000,
  status: "succeeded",
  payment_intent: "pi_mock_123",
  reason: null,
  ...overrides,
});

export const createMockCharge = (
  overrides?: Partial<StripeTypes.Charge>,
): StripeTypes.Charge => ({
  id: "ch_mock_123",
  object: "charge",
  amount: 5000,
  amount_refunded: 0,
  payment_intent: "pi_mock_123",
  ...overrides,
});

export const createMockEvent = (
  type: string,
  data: unknown,
  overrides?: Partial<StripeTypes.Event>,
): StripeTypes.Event => ({
  id: "evt_mock_123",
  object: "event",
  type,
  data: {
    object: data,
  },
  ...overrides,
});
