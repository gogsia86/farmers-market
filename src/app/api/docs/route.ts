/**
 * 📚 API DOCUMENTATION ENDPOINT
 *
 * Provides comprehensive API documentation and reference
 * OpenAPI/Swagger compatible format
 *
 * Divine Patterns Applied:
 * - Auto-generated API reference
 * - Interactive documentation
 * - Agricultural consciousness
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/docs
 *
 * Returns API documentation in JSON format
 * Compatible with OpenAPI 3.0 specification
 *
 * Response:
 * {
 *   "openapi": "3.0.0",
 *   "info": { ... },
 *   "servers": [ ... ],
 *   "paths": { ... }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const apiDocs = {
    openapi: "3.0.0",
    info: {
      title: "Farmers Market Platform API",
      version: "1.0.0",
      description:
        "Divine Agricultural Platform - Comprehensive API for connecting farmers, customers, and agricultural consciousness",
      contact: {
        name: "API Support",
        email: "api@farmersmarket.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: baseUrl,
        description: "Production server",
      },
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Farms",
        description: "Farm management and discovery endpoints",
      },
      {
        name: "Products",
        description: "Product catalog and search endpoints",
      },
      {
        name: "Orders",
        description: "Order management endpoints",
      },
      {
        name: "Auth",
        description: "Authentication and authorization endpoints",
      },
      {
        name: "Marketplace",
        description: "Marketplace and shopping endpoints",
      },
      {
        name: "Health",
        description: "System health and monitoring endpoints",
      },
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check endpoint",
          description: "Check system health and database connectivity",
          responses: {
            200: {
              description: "System is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "healthy" },
                      database: { type: "string", example: "connected" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/farms": {
        get: {
          tags: ["Farms"],
          summary: "List all farms",
          description: "Get a paginated list of all active farms",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
              description: "Items per page",
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["ACTIVE", "PENDING", "SUSPENDED"],
              },
              description: "Filter by farm status",
            },
          ],
          responses: {
            200: {
              description: "List of farms",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Farm" },
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/farms/featured": {
        get: {
          tags: ["Farms"],
          summary: "Get featured farms",
          description:
            "Get a curated list of featured farms based on rating and activity",
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 6, maximum: 20 },
              description: "Number of featured farms to return",
            },
          ],
          responses: {
            200: {
              description: "Featured farms",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          farms: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Farm" },
                          },
                          count: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List all products",
          description: "Get a paginated list of all active products",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
            {
              name: "category",
              in: "query",
              schema: { type: "string" },
              description: "Filter by category",
            },
          ],
          responses: {
            200: {
              description: "List of products",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/products/search": {
        get: {
          tags: ["Products"],
          summary: "Search products",
          description: "Search for products by keyword",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Search query",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
          ],
          responses: {
            200: {
              description: "Search results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/marketplace": {
        get: {
          tags: ["Marketplace"],
          summary: "Get marketplace data",
          description: "Get products and farms for the marketplace",
          responses: {
            200: {
              description: "Marketplace data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/farmer/dashboard": {
        get: {
          tags: ["Auth"],
          summary: "Farmer dashboard",
          description: "Get farmer dashboard statistics and data",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Dashboard data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          stats: { type: "object" },
                          recentOrders: { type: "array" },
                          topProducts: { type: "array" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Authentication required",
            },
            403: {
              description: "Forbidden - Not a farmer",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Farm: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: "string" },
            location: {
              type: "object",
              properties: {
                city: { type: "string" },
                state: { type: "string" },
              },
            },
            images: {
              type: "object",
              properties: {
                logo: { type: "string", format: "uri" },
                banner: { type: "string", format: "uri" },
              },
            },
            rating: { type: "number", format: "float", minimum: 0, maximum: 5 },
            reviewCount: { type: "integer" },
            farmingPractices: { type: "object" },
            productCategories: { type: "object" },
            deliveryRadius: { type: "integer" },
            activeProductCount: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number", format: "decimal" },
            unit: { type: "string" },
            category: { type: "string" },
            stockQuantity: { type: "integer" },
            images: { type: "array", items: { type: "string" } },
            farmId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };

  return NextResponse.json(apiDocs, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/**
 * 🌟 Divine API documentation route established ✨
 * - OpenAPI 3.0 compatible
 * - Comprehensive endpoint documentation
 * - Interactive API reference
 * - Agricultural consciousness maintained
 * Ready for quantum API exploration! 📚
 */
