/**
 * Tests for ServiceResponse types and utilities
 */

import {
  type ServiceResponse,
  type ServiceSuccessResponse,
  type ServiceErrorResponse,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  calculatePagination,
  validatePagination,
  isSuccess,
  isError,
  ErrorCodes,
} from "../service-response";

describe("ServiceResponse Types", () => {
  describe("createSuccessResponse", () => {
    it("should create a success response with data", () => {
      const data = { id: "123", name: "Test" };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });

    it("should include metadata when provided", () => {
      const data = { id: "123" };
      const meta = { cached: true, requestId: "req-123" };
      const response = createSuccessResponse(data, meta);

      expect(response.meta).toEqual(meta);
    });
  });

  describe("createErrorResponse", () => {
    it("should create an error response", () => {
      const error = {
        code: "TEST_ERROR",
        message: "Test error message",
      };
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toEqual(error);
    });

    it("should include error details", () => {
      const error = {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { field: "email", value: "invalid" },
      };
      const response = createErrorResponse(error);

      expect(response.error.details).toEqual(error.details);
    });
  });

  describe("createPaginatedResponse", () => {
    it("should create a paginated response", () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      const response = createPaginatedResponse(items, pagination);

      expect(response.success).toBe(true);
      expect(response.data.items).toEqual(items);
      expect(response.data.pagination).toEqual(pagination);
    });
  });

  describe("Type Guards", () => {
    describe("isSuccess", () => {
      it("should return true for success responses", () => {
        const response: ServiceResponse<string> = createSuccessResponse("test");
        expect(isSuccess(response)).toBe(true);
      });

      it("should return false for error responses", () => {
        const response: ServiceResponse<string> = createErrorResponse({
          code: "ERROR",
          message: "Error",
        });
        expect(isSuccess(response)).toBe(false);
      });

      it("should narrow type correctly", () => {
        const response: ServiceResponse<string> = createSuccessResponse("test");
        
        if (isSuccess(response)) {
          // TypeScript should know response.data is string
          const data: string = response.data;
          expect(data).toBe("test");
        }
      });
    });

    describe("isError", () => {
      it("should return true for error responses", () => {
        const response: ServiceResponse<string> = createErrorResponse({
          code: "ERROR",
          message: "Error",
        });
        expect(isError(response)).toBe(true);
      });

      it("should return false for success responses", () => {
        const response: ServiceResponse<string> = createSuccessResponse("test");
        expect(isError(response)).toBe(false);
      });
    });
  });

  describe("calculatePagination", () => {
    it("should calculate pagination for first page", () => {
      const result = calculatePagination(1, 10, 25);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
        startIndex: 0,
        endIndex: 9,
      });
    });

    it("should calculate pagination for middle page", () => {
      const result = calculatePagination(2, 10, 25);

      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true,
        startIndex: 10,
        endIndex: 19,
      });
    });

    it("should calculate pagination for last page", () => {
      const result = calculatePagination(3, 10, 25);

      expect(result).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrevious: true,
        startIndex: 20,
        endIndex: 24,
      });
    });

    it("should handle single page", () => {
      const result = calculatePagination(1, 10, 5);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        startIndex: 0,
        endIndex: 4,
      });
    });

    it("should handle empty results", () => {
      const result = calculatePagination(1, 10, 0);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        startIndex: 0,
        endIndex: -1,
      });
    });
  });

  describe("validatePagination", () => {
    it("should accept valid pagination parameters", () => {
      const result = validatePagination(1, 10);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject page less than 1", () => {
      const result = validatePagination(0, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Page must be >= 1");
    });

    it("should reject limit less than 1", () => {
      const result = validatePagination(1, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Limit must be >= 1");
    });

    it("should reject limit greater than 100", () => {
      const result = validatePagination(1, 101);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Limit must be <= 100");
    });

    it("should accept limit of 100", () => {
      const result = validatePagination(1, 100);
      expect(result.valid).toBe(true);
    });
  });

  describe("ErrorCodes", () => {
    it("should have validation error codes", () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
      expect(ErrorCodes.INVALID_INPUT).toBe("INVALID_INPUT");
    });

    it("should have authentication error codes", () => {
      expect(ErrorCodes.AUTHENTICATION_REQUIRED).toBe("AUTHENTICATION_REQUIRED");
      expect(ErrorCodes.TOKEN_EXPIRED).toBe("TOKEN_EXPIRED");
    });

    it("should have not found error codes", () => {
      expect(ErrorCodes.NOT_FOUND).toBe("NOT_FOUND");
      expect(ErrorCodes.RESOURCE_NOT_FOUND).toBe("RESOURCE_NOT_FOUND");
    });

    it("should have server error codes", () => {
      expect(ErrorCodes.INTERNAL_SERVER_ERROR).toBe("INTERNAL_SERVER_ERROR");
      expect(ErrorCodes.DATABASE_ERROR).toBe("DATABASE_ERROR");
    });
  });
});
