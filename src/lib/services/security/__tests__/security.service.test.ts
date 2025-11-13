import { describe, expect, it } from "vitest";
import { SecurityService } from "../security.service";

describe("SecurityService", () => {
  describe("sanitizeInput", () => {
    it("should sanitize HTML tags", () => {
      const input = "<script>alert('xss')</script>";
      const result = SecurityService.sanitizeInput(input);
      expect(result).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
      );
    });

    it("should sanitize quotes", () => {
      const input = 'Test "quoted" text';
      const result = SecurityService.sanitizeInput(input);
      expect(result).toContain("&quot;");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email", () => {
      expect(SecurityService.isValidEmail("test@example.com")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(SecurityService.isValidEmail("invalid-email")).toBe(false);
      expect(SecurityService.isValidEmail("test@")).toBe(false);
      expect(SecurityService.isValidEmail("@example.com")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("should validate correct phone numbers", () => {
      expect(SecurityService.isValidPhone("(503) 555-1234")).toBe(true);
      expect(SecurityService.isValidPhone("503-555-1234")).toBe(true);
      expect(SecurityService.isValidPhone("5035551234")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(SecurityService.isValidPhone("123")).toBe(false);
      expect(SecurityService.isValidPhone("abc-def-ghij")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should validate strong password", () => {
      const result = SecurityService.isStrongPassword("Test123!@#");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject weak passwords", () => {
      const result = SecurityService.isStrongPassword("weak");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should require minimum length", () => {
      const result = SecurityService.isStrongPassword("Test1!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });
  });

  describe("validateFileUpload", () => {
    it("should validate correct file", () => {
      const file = {
        size: 1024 * 1024, // 1MB
        type: "image/jpeg",
      };

      const result = SecurityService.validateFileUpload(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png"],
      });

      expect(result.valid).toBe(true);
    });

    it("should reject file that is too large", () => {
      const file = {
        size: 10 * 1024 * 1024, // 10MB
        type: "image/jpeg",
      };

      const result = SecurityService.validateFileUpload(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg"],
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("File too large");
    });

    it("should reject invalid file type", () => {
      const file = {
        size: 1024,
        type: "application/exe",
      };

      const result = SecurityService.validateFileUpload(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/png"],
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });
  });
});
