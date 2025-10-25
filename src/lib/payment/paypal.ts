// src/lib/payment/paypal.ts
import type { PayPalOrderData } from "@/types/payment.types";

const PAYPAL_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error("PayPal credentials are required");
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(
  orderData: PayPalOrderData
): Promise<{ id: string; approvalUrl: string }> {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderData.orderId,
            description: orderData.description,
            amount: {
              currency_code: orderData.currency.toUpperCase(),
              value: orderData.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
          brand_name: "Farmers Market",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal order creation failed: ${JSON.stringify(error)}`);
    }

    const order = await response.json();
    const approvalUrl = order.links.find(
      (link: any) => link.rel === "approve"
    )?.href;

    return {
      id: order.id,
      approvalUrl: approvalUrl || "",
    };
  } catch (error) {
    console.error("PayPal order creation failed:", error);
    throw new Error(
      `Failed to create PayPal order: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Capture PayPal order (complete payment)
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  id: string;
  status: string;
  captureId: string;
  amount: number;
  currency: string;
}> {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal capture failed: ${JSON.stringify(error)}`);
    }

    const capture = await response.json();
    const captureDetails = capture.purchase_units[0].payments.captures[0];

    return {
      id: capture.id,
      status: capture.status,
      captureId: captureDetails.id,
      amount: parseFloat(captureDetails.amount.value),
      currency: captureDetails.amount.currency_code,
    };
  } catch (error) {
    console.error("PayPal capture failed:", error);
    throw new Error(
      `Failed to capture PayPal payment: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(paypalOrderId: string): Promise<{
  id: string;
  status: string;
  amount: number;
  currency: string;
}> {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get PayPal order details");
    }

    const order = await response.json();
    const amount = order.purchase_units[0].amount;

    return {
      id: order.id,
      status: order.status,
      amount: parseFloat(amount.value),
      currency: amount.currency_code,
    };
  } catch (error) {
    console.error("Failed to get PayPal order:", error);
    throw new Error(
      `Failed to retrieve PayPal order: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Refund PayPal capture
 */
export async function refundPayPalCapture(
  captureId: string,
  amount?: number,
  currency?: string
): Promise<{
  id: string;
  status: string;
  amount: number;
}> {
  try {
    const accessToken = await getPayPalAccessToken();

    const body: any = {};
    if (amount && currency) {
      body.amount = {
        value: amount.toFixed(2),
        currency_code: currency.toUpperCase(),
      };
    }

    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal refund failed: ${JSON.stringify(error)}`);
    }

    const refund = await response.json();

    return {
      id: refund.id,
      status: refund.status,
      amount: parseFloat(refund.amount.value),
    };
  } catch (error) {
    console.error("PayPal refund failed:", error);
    throw new Error(
      `Failed to refund PayPal payment: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Calculate PayPal fee (2.9% + $0.30)
 */
export function calculatePayPalFee(amount: number): number {
  return Math.round((amount * 0.029 + 0.3) * 100) / 100;
}

/**
 * Calculate net amount after PayPal fees
 */
export function calculatePayPalNet(amount: number): number {
  const fee = calculatePayPalFee(amount);
  return Math.round((amount - fee) * 100) / 100;
}
