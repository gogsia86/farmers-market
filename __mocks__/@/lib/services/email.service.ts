/**
 * 🧪 EMAIL SERVICE MOCK - For Jest Testing
 *
 * Mock implementation of the email service
 * Prevents actual email sending during tests
 */

export const emailService = {
  sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
  sendOrderStatusUpdate: jest.fn().mockResolvedValue(undefined),
  sendOrderShipped: jest.fn().mockResolvedValue(undefined),
  sendOrderDelivered: jest.fn().mockResolvedValue(undefined),
  sendOrderCancelled: jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendNotification: jest.fn().mockResolvedValue(undefined),
};

export default emailService;
