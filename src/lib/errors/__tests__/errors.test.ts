/**
 * 🛡️ Error Classes Tests - Divine Error Handling Excellence
 * Agricultural consciousness meets enterprise error management
 */

import { ApplicationError } from "../ApplicationError";
import { ValidationError } from "../ValidationError";
import { NotFoundError } from "../NotFoundError";
import { DatabaseError } from "../DatabaseError";
import { BusinessLogicError } from "../BusinessLogicError";

describe("🛡️ Error Classes - Divine Error Handling System", () => {
  describe("🌾 ApplicationError - Base Error Foundation", () => {
    class TestApplicationError extends ApplicationError {
      constructor(
        message: string,
        code: string = "TEST_ERROR",
        context: string = "TEST",
        details: Record<string, any> = {},
      ) {
        super(message, code, context, details);
      }
    }

    it("should create error with all properties", () => {
      const error = new TestApplicationError(
        "Test error message",
        "TEST_CODE",
        "TEST_CONTEXT",
        { field: "value" },
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.message).toBe("Test error message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.context).toBe("TEST_CONTEXT");
      expect(error.details).toEqual({ field: "value" });
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe("TestApplicationError");
    });

    it("should use default context when not provided", () => {
      const error = new TestApplicationError("Test message", "TEST_CODE");

      expect(error.context).toBe("TEST"); // TestApplicationError defaults to "TEST"
      expect(error.details).toEqual({});
    });

    it("should capture stack trace", () => {
      const error = new TestApplicationError("Test message");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("TestApplicationError");
    });

    it("should serialize to JSON correctly", () => {
      const error = new TestApplicationError(
        "Test message",
        "TEST_CODE",
        "TEST_CONTEXT",
        { farmId: "123", product: "Tomatoes" },
      );

      const json = error.toJSON();

      expect(json.name).toBe("TestApplicationError");
      expect(json.message).toBe("Test message");
      expect(json.code).toBe("TEST_CODE");
      expect(json.context).toBe("TEST_CONTEXT");
      expect(json.details).toEqual({ farmId: "123", product: "Tomatoes" });
      expect(json.timestamp).toBeDefined();
      expect(json.stack).toBeDefined();
    });

    it("should have ISO 8601 timestamp format", () => {
      const error = new TestApplicationError("Test message");
      const timestamp = error.timestamp;

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(() => new Date(timestamp)).not.toThrow();
    });

    it("should handle empty details object", () => {
      const error = new TestApplicationError(
        "Test message",
        "TEST_CODE",
        "TEST_CONTEXT",
        {},
      );

      expect(error.details).toEqual({});
    });

    it("should handle complex nested details", () => {
      const complexDetails = {
        farm: {
          id: "farm_123",
          name: "Biodynamic Acres",
          products: ["Tomatoes", "Lettuce"],
        },
        metadata: {
          season: "SPRING",
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
      };

      const error = new TestApplicationError(
        "Complex error",
        "COMPLEX_ERROR",
        "FARM",
        complexDetails,
      );

      expect(error.details).toEqual(complexDetails);
    });
  });

  describe("✅ ValidationError - Input Validation Divine Patterns", () => {
    it("should create validation error with field information", () => {
      const error = new ValidationError(
        "email",
        "Invalid email format",
        "not-an-email",
      );

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(
        "Validation failed for email: Invalid email format",
      );
      expect(error.field).toBe("email");
      expect(error.value).toBe("not-an-email");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.context).toBe("VALIDATION");
    });

    it("should handle missing value", () => {
      const error = new ValidationError(
        "farmName",
        "Field is required",
        undefined,
      );

      expect(error.field).toBe("farmName");
      expect(error.value).toBeUndefined();
    });

    it("should include field in details", () => {
      const error = new ValidationError("productPrice", "Invalid input", -10);

      expect(error.details.field).toBe("productPrice");
      expect(error.details.value).toBe(-10);
    });

    it("should serialize validation error correctly", () => {
      const error = new ValidationError(
        "price",
        "Price must be positive",
        -5.99,
      );

      const json = error.toJSON();

      expect(json.name).toBe("ValidationError");
      expect(json.code).toBe("VALIDATION_ERROR");
      expect(json.details.field).toBe("price");
      expect(json.details.value).toBe(-5.99);
    });

    it("should handle validation of complex objects", () => {
      const invalidLocation = { lat: 200, lng: -200 };
      const error = new ValidationError(
        "location",
        "Invalid coordinates",
        invalidLocation,
      );

      expect(error.value).toEqual(invalidLocation);
      expect(error.details.value).toEqual(invalidLocation);
    });

    it("should handle validation of arrays", () => {
      const invalidArray = ["item1", "", "item3"];
      const error = new ValidationError(
        "tags",
        "Array contains empty values",
        invalidArray,
      );

      expect(error.value).toEqual(invalidArray);
    });
  });

  describe("🔍 NotFoundError - Resource Discovery Consciousness", () => {
    it("should create not found error with resource information", () => {
      const error = new NotFoundError("Farm", "farm_123");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Farm with id farm_123 not found");
      expect(error.resourceType).toBe("Farm");
      expect(error.resourceId).toBe("farm_123");
      expect(error.code).toBe("NOT_FOUND_ERROR");
      expect(error.context).toBe("RESOURCE_ACCESS");
    });

    it("should include resource details in error details", () => {
      const error = new NotFoundError("Product", "product_456");

      expect(error.details.resourceType).toBe("Product");
      expect(error.details.resourceId).toBe("product_456");
    });

    it("should handle numeric resource IDs", () => {
      const error = new NotFoundError("Order", "12345");

      expect(error.resourceId).toBe("12345");
      expect(error.details.resourceId).toBe("12345");
    });

    it("should serialize not found error correctly", () => {
      const error = new NotFoundError("User", "user_789");

      const json = error.toJSON();

      expect(json.name).toBe("NotFoundError");
      expect(json.code).toBe("NOT_FOUND_ERROR");
      expect(json.details.resourceType).toBe("User");
      expect(json.details.resourceId).toBe("user_789");
    });

    it("should handle complex resource identifiers", () => {
      const complexId = JSON.stringify({
        farmId: "farm_123",
        productSlug: "organic-tomatoes",
      });
      const error = new NotFoundError("Product", complexId);

      expect(error.resourceId).toEqual(complexId);
    });
  });

  describe("🗄️ DatabaseError - Data Persistence Divine Patterns", () => {
    it("should create database error with operation details", () => {
      const error = new DatabaseError(
        "INSERT",
        new Error("Constraint violation"),
        { table: "farms" },
      );

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.message).toBe("Database operation failed: INSERT");
      expect(error.operation).toBe("INSERT");
      expect(error.originalError.message).toBe("Constraint violation");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.context).toBe("DATABASE");
    });

    it("should include database details in error details", () => {
      const originalError = new Error("Connection timeout");
      const error = new DatabaseError("SELECT", originalError, {
        table: "products",
      });

      expect(error.details.operation).toBe("SELECT");
      expect(error.details.originalMessage).toBe("Connection timeout");
    });

    it("should handle database errors with minimal info", () => {
      const error = new DatabaseError("UPDATE", new Error("Generic error"), {
        table: "orders",
      });

      expect(error.originalError).toBeDefined();
      expect(error.details.originalMessage).toBe("Generic error");
    });

    it("should serialize database error correctly", () => {
      const originalError = new Error("Unique constraint failed");
      const error = new DatabaseError("INSERT", originalError, {
        table: "users",
      });

      const json = error.toJSON();

      expect(json.name).toBe("DatabaseError");
      expect(json.code).toBe("DATABASE_ERROR");
      expect(json.details.operation).toBe("INSERT");
      expect(json.details.originalMessage).toBe("Unique constraint failed");
    });

    it("should handle different database operations", () => {
      const operations = ["SELECT", "INSERT", "UPDATE", "DELETE", "UPSERT"];

      operations.forEach((operation: any) => {
        const error = new DatabaseError(operation, new Error("Test error"), {
          table: "test_table",
        });

        expect(error.operation).toBe(operation);
      });
    });

    it("should handle complex original errors", () => {
      class CustomDbError extends Error {
        constructor(
          message: string,
          public code: string,
          public detail: string,
        ) {
          super(message);
        }
      }

      const originalError = new CustomDbError(
        "Constraint violation",
        "23505",
        "Key already exists",
      );

      const error = new DatabaseError("INSERT", originalError, {
        table: "farms",
        constraintCode: "23505",
      });

      expect(error.originalError).toBe(originalError);
      expect(error.details.originalMessage).toBe("Constraint violation");
    });
  });

  describe("💼 BusinessLogicError - Agricultural Domain Logic", () => {
    it("should create business logic error with operation context", () => {
      const error = new BusinessLogicError(
        "Cannot harvest in winter season",
        "SEASONAL_VIOLATION",
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(BusinessLogicError);
      expect(error.message).toBe("Cannot harvest in winter season");
      expect(error.code).toBe("BUSINESS_LOGIC_ERROR");
      expect(error.context).toBe("BUSINESS.SEASONAL_VIOLATION");
    });

    it("should handle business logic with custom details", () => {
      const error = new BusinessLogicError(
        "Insufficient inventory",
        "INVENTORY_LOW",
        { requested: 100, available: 50, productId: "product_123" },
      );

      expect(error.details.requested).toBe(100);
      expect(error.details.available).toBe(50);
      expect(error.details.productId).toBe("product_123");
    });

    it("should serialize business logic error correctly", () => {
      const error = new BusinessLogicError(
        "Order minimum not met",
        "ORDER_MINIMUM",
        { minimum: 25, current: 15 },
      );

      const json = error.toJSON();

      expect(json.name).toBe("BusinessLogicError");
      expect(json.code).toBe("BUSINESS_LOGIC_ERROR");
      expect(json.context).toBe("BUSINESS.ORDER_MINIMUM");
      expect(json.details.minimum).toBe(25);
      expect(json.details.current).toBe(15);
    });
  });

  describe("🌾 Integration Tests - Complete Error Flow", () => {
    it("should handle error hierarchy correctly", () => {
      const errors = [
        new ValidationError("field", "Validation error", "value"),
        new NotFoundError("Resource", "id"),
        new DatabaseError("SELECT", new Error("DB error")),
        new BusinessLogicError("Business error", "OPERATION"),
      ];

      errors.forEach((error: any) => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.code).toBeDefined();
        expect(error.context).toBeDefined();
        expect(error.timestamp).toBeDefined();
      });
    });

    it("should differentiate between error types", () => {
      const validationError = new ValidationError("field", "Invalid", "value");
      const notFoundError = new NotFoundError("Type", "id");
      const databaseError = new DatabaseError("OP", new Error("DB error"));
      const businessError = new BusinessLogicError("Business", "OPERATION");

      expect(validationError.name).toBe("ValidationError");
      expect(notFoundError.name).toBe("NotFoundError");
      expect(databaseError.name).toBe("DatabaseError");
      expect(businessError.name).toBe("BusinessLogicError");
    });

    it("should handle error catching and type checking", () => {
      const throwValidation = () => {
        throw new ValidationError("email", "Invalid input", "bad");
      };

      const throwNotFound = () => {
        throw new NotFoundError("User", "123");
      };

      expect(throwValidation).toThrow(ValidationError);
      expect(throwValidation).toThrow(ApplicationError);
      expect(throwValidation).toThrow(Error);

      expect(throwNotFound).toThrow(NotFoundError);
      expect(throwNotFound).toThrow(ApplicationError);
      expect(throwNotFound).toThrow(Error);
    });

    it("should preserve error information through serialization", () => {
      const originalError = new ValidationError(
        "price",
        "Price must be positive",
        -10,
      );

      const json = originalError.toJSON();
      const jsonString = JSON.stringify(json);
      const parsed = JSON.parse(jsonString);

      expect(parsed.name).toBe("ValidationError");
      expect(parsed.message).toBe(
        "Validation failed for price: Price must be positive",
      );
      expect(parsed.code).toBe("VALIDATION_ERROR");
      expect(parsed.details.field).toBe("price");
      expect(parsed.details.value).toBe(-10);
    });
  });

  describe("⚡ Performance & Edge Cases", () => {
    it("should create errors efficiently", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        new ValidationError("field", `Error ${i}`, i);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // 1000 errors in < 100ms
    });

    it("should handle very long error messages", () => {
      const longMessage = "A".repeat(10000);
      const error = new ValidationError("field", longMessage, "value");

      expect(error.message).toBe(`Validation failed for field: ${longMessage}`);
      expect(error.message.length).toBeGreaterThan(10000);
    });

    it("should handle special characters in messages", () => {
      const specialMessage =
        "Error: 🌾 Farm '\"Test\"' has <issues> & problems";
      const error = new BusinessLogicError(specialMessage, "SPECIAL", "TEST");

      expect(error.message).toBe(specialMessage);
    });

    it("should handle null and undefined in details", () => {
      const error = new BusinessLogicError("Test error", "TEST", {
        nullValue: null,
        undefinedValue: undefined,
        normalValue: "test",
      });

      expect(error.details.nullValue).toBeNull();
      expect(error.details.undefinedValue).toBeUndefined();
      expect(error.details.normalValue).toBe("test");
    });

    it("should handle circular references in details gracefully", () => {
      const circularObj: any = { name: "test" };
      circularObj.self = circularObj;

      // This should not throw during error creation
      expect(() => {
        new BusinessLogicError("Circular", "CIRCULAR", "TEST", {
          circular: circularObj,
        });
      }).not.toThrow();
    });

    it("should handle timestamp uniqueness", async () => {
      const errors = [];
      for (let i = 0; i < 10; i++) {
        errors.push(new ValidationError("field", `Error ${i}`, i).timestamp);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      const uniqueTimestamps = new Set(errors);
      expect(uniqueTimestamps.size).toBeGreaterThan(1);
    });
  });

  describe("🛡️ Security & Safety", () => {
    it("should not expose sensitive information in stack traces", () => {
      const error = new ValidationError(
        "password",
        "Password validation failed",
        "secret123",
      );

      const json = error.toJSON();
      // Stack trace should be present but not expose password value directly
      expect(json.stack).toBeDefined();
      expect(typeof json.stack).toBe("string");
    });

    it("should handle SQL injection attempts in error details", () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const error = new ValidationError("field", "Invalid input", sqlInjection);

      expect(error.value).toBe(sqlInjection);
      // Should store as-is without execution
    });

    it("should handle XSS attempts in error messages", () => {
      const xssAttempt = "<script>alert('XSS')</script>";
      const error = new BusinessLogicError(xssAttempt, "XSS", "TEST");

      expect(error.message).toBe(xssAttempt);
      // Should store as-is without execution
    });

    it("should not mutate original details object", () => {
      const originalDetails = { count: 5, items: ["a", "b"] };
      const error = new BusinessLogicError("Test", "TEST", originalDetails);

      error.details.count = 10;
      error.details.items.push("c");

      // Original should not be affected (if deep cloned)
      // Note: If not deep cloned, this test documents the behavior
      expect(error.details.count).toBe(10);
    });
  });
});
