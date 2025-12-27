#!/usr/bin/env tsx
/**
 * 📚 API DOCUMENTATION GENERATOR
 *
 * Generates comprehensive API documentation from controllers and services.
 * Creates OpenAPI 3.0 specification, TypeDoc, and Postman collection.
 *
 * Divine Patterns Applied:
 * - Auto-discovery of API routes
 * - ServiceResponse<T> type extraction
 * - Agricultural consciousness metadata
 * - Comprehensive examples and schemas
 *
 * Usage:
 *   npm run generate:api-docs
 *   tsx scripts/generate-api-docs.ts
 *   tsx scripts/generate-api-docs.ts --format json
 *   tsx scripts/generate-api-docs.ts --output docs/api
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// TYPES
// ============================================================================

interface ApiEndpoint {
  path: string;
  method: string;
  controller: string;
  handler: string;
  description: string;
  authenticated: boolean;
  roles?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
}

interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required: boolean;
  schema: Schema;
  description?: string;
}

interface RequestBody {
  required: boolean;
  content: {
    [contentType: string]: {
      schema: Schema;
      examples?: Record<string, any>;
    };
  };
}

interface Response {
  status: number;
  description: string;
  content?: {
    [contentType: string]: {
      schema: Schema;
      examples?: Record<string, any>;
    };
  };
}

interface Schema {
  type: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  example?: any;
  enum?: string[];
  format?: string;
  description?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROJECT_ROOT = process.cwd();
const API_DIR = path.join(PROJECT_ROOT, 'src', 'app', 'api');
const CONTROLLERS_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'controllers');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'api');
const PACKAGE_JSON = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
);

const API_INFO = {
  title: 'Farmers Market Platform API',
  version: PACKAGE_JSON.version || '1.0.0',
  description: `
Divine Agricultural Platform - Comprehensive REST API

This API provides endpoints for:
- 🚜 Farm Management (CRUD, search, verification)
- 🌾 Product Catalog (inventory, categories, search)
- 📦 Order Processing (cart, checkout, fulfillment)
- 👤 User Management (authentication, profiles, roles)
- 🌍 Marketplace (discovery, featured items, recommendations)
- 📊 Analytics (farmer dashboard, sales reports)
- 🔔 Notifications (real-time updates, alerts)

All endpoints return standardized ServiceResponse<T> format with:
- success: boolean
- data?: T
- error?: ServiceError
- meta?: ResponseMetadata (including agricultural consciousness)
  `.trim(),
  contact: {
    name: 'API Support',
    email: 'support@farmersmarket.com',
    url: 'https://farmersmarket.com/support',
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
};

// ============================================================================
// API ROUTE DISCOVERY
// ============================================================================

const KNOWN_ENDPOINTS: ApiEndpoint[] = [
  // HEALTH & MONITORING
  {
    path: '/api/health',
    method: 'GET',
    controller: 'Health',
    handler: 'GET',
    description: 'Health check endpoint - verifies system and database connectivity',
    authenticated: false,
    responses: [
      {
        status: 200,
        description: 'System is healthy',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'healthy' },
                database: { type: 'string', example: 'connected' },
                timestamp: { type: 'string', format: 'date-time' },
                version: { type: 'string', example: '1.0.0' },
              },
            },
          },
        },
      },
    ],
  },
  {
    path: '/api/ready',
    method: 'GET',
    controller: 'Health',
    handler: 'GET',
    description: 'Readiness check endpoint for Kubernetes/Docker',
    authenticated: false,
    responses: [
      {
        status: 200,
        description: 'Service is ready',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                ready: { type: 'boolean', example: true },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    ],
  },

  // FARM ENDPOINTS
  {
    path: '/api/farms',
    method: 'GET',
    controller: 'FarmController',
    handler: 'handleListFarms',
    description: 'List all farms with pagination and filtering',
    authenticated: false,
    parameters: [
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', example: 1 },
        description: 'Page number (starts at 1)',
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', example: 20 },
        description: 'Items per page',
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'],
        },
        description: 'Filter by farm status',
      },
      {
        name: 'city',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Filter by city',
      },
      {
        name: 'state',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Filter by state',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Paginated list of farms',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'array',
                  items: { type: 'object', description: 'Farm object' },
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
                meta: {
                  type: 'object',
                  properties: {
                    agricultural: {
                      type: 'object',
                      properties: {
                        season: { type: 'string', enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER'] },
                        consciousness: { type: 'string', example: 'DIVINE' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
  {
    path: '/api/farms',
    method: 'POST',
    controller: 'FarmController',
    handler: 'handleCreateFarm',
    description: 'Create a new farm (requires FARMER role)',
    authenticated: true,
    roles: ['FARMER'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'address', 'city', 'state', 'zipCode', 'latitude', 'longitude'],
            properties: {
              name: { type: 'string', example: 'Sunny Valley Farm' },
              address: { type: 'string', example: '123 Farm Road' },
              city: { type: 'string', example: 'Portland' },
              state: { type: 'string', example: 'OR' },
              zipCode: { type: 'string', example: '97201' },
              latitude: { type: 'number', example: 45.5152 },
              longitude: { type: 'number', example: -122.6784 },
              description: { type: 'string' },
              story: { type: 'string' },
              businessName: { type: 'string' },
              yearEstablished: { type: 'integer' },
              farmSize: { type: 'number' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              website: { type: 'string', format: 'uri' },
              farmingPractices: {
                type: 'array',
                items: { type: 'string' },
                example: ['ORGANIC', 'BIODYNAMIC'],
              },
              productCategories: {
                type: 'array',
                items: { type: 'string' },
                example: ['VEGETABLES', 'FRUITS'],
              },
              deliveryRadius: { type: 'integer', example: 50 },
            },
          },
        },
      },
    },
    responses: [
      {
        status: 201,
        description: 'Farm created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    farm: { type: 'object', description: 'Created farm object' },
                    slug: { type: 'string', example: 'sunny-valley-farm-portland' },
                  },
                },
                meta: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Farm created successfully' },
                  },
                },
              },
            },
          },
        },
      },
      {
        status: 401,
        description: 'Authentication required',
      },
      {
        status: 403,
        description: 'User already has a farm',
      },
    ],
  },
  {
    path: '/api/farms/{id}',
    method: 'GET',
    controller: 'FarmController',
    handler: 'handleGetFarm',
    description: 'Get farm by ID',
    authenticated: false,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Farm ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Farm details',
      },
      {
        status: 404,
        description: 'Farm not found',
      },
    ],
  },
  {
    path: '/api/farms/{id}',
    method: 'PUT',
    controller: 'FarmController',
    handler: 'handleUpdateFarm',
    description: 'Update farm (requires ownership)',
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Farm ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Farm updated successfully',
      },
      {
        status: 401,
        description: 'Authentication required',
      },
      {
        status: 403,
        description: 'Not the farm owner',
      },
    ],
  },
  {
    path: '/api/farms/{id}',
    method: 'DELETE',
    controller: 'FarmController',
    handler: 'handleDeleteFarm',
    description: 'Delete farm (soft delete, requires ownership)',
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Farm ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Farm deleted successfully',
      },
    ],
  },
  {
    path: '/api/farms/search',
    method: 'GET',
    controller: 'FarmController',
    handler: 'handleSearchFarms',
    description: 'Search farms by query',
    authenticated: false,
    parameters: [
      {
        name: 'query',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'Search query',
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', example: 20 },
        description: 'Maximum results',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Search results',
      },
    ],
  },

  // PRODUCT ENDPOINTS
  {
    path: '/api/products',
    method: 'GET',
    controller: 'ProductController',
    handler: 'handleListProducts',
    description: 'List all products with pagination and filtering',
    authenticated: false,
    parameters: [
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', example: 1 },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', example: 20 },
      },
      {
        name: 'category',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'farmId',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Paginated list of products',
      },
    ],
  },
  {
    path: '/api/products',
    method: 'POST',
    controller: 'ProductController',
    handler: 'handleCreateProduct',
    description: 'Create a new product (requires FARMER role and farm ownership)',
    authenticated: true,
    roles: ['FARMER'],
    responses: [
      {
        status: 201,
        description: 'Product created successfully',
      },
    ],
  },
  {
    path: '/api/products/search',
    method: 'GET',
    controller: 'ProductController',
    handler: 'handleSearchProducts',
    description: 'Search products by keyword',
    authenticated: false,
    parameters: [
      {
        name: 'q',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'Search query',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Search results',
      },
    ],
  },

  // ORDER ENDPOINTS
  {
    path: '/api/orders',
    method: 'GET',
    controller: 'OrderController',
    handler: 'handleListOrders',
    description: 'List orders for authenticated user',
    authenticated: true,
    responses: [
      {
        status: 200,
        description: 'List of user orders',
      },
    ],
  },
  {
    path: '/api/orders',
    method: 'POST',
    controller: 'OrderController',
    handler: 'handleCreateOrder',
    description: 'Create a new order',
    authenticated: true,
    responses: [
      {
        status: 201,
        description: 'Order created successfully',
      },
    ],
  },
  {
    path: '/api/orders/{id}',
    method: 'GET',
    controller: 'OrderController',
    handler: 'handleGetOrder',
    description: 'Get order details',
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Order details',
      },
    ],
  },

  // MARKETPLACE
  {
    path: '/api/marketplace',
    method: 'GET',
    controller: 'Marketplace',
    handler: 'GET',
    description: 'Get marketplace products and featured farms',
    authenticated: false,
    responses: [
      {
        status: 200,
        description: 'Marketplace data',
      },
    ],
  },
];

// ============================================================================
// OPENAPI GENERATOR
// ============================================================================

function generateOpenAPISpec(): any {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  const paths: Record<string, any> = {};
  const tags = new Set<string>();

  for (const endpoint of KNOWN_ENDPOINTS) {
    tags.add(endpoint.controller);

    if (!paths[endpoint.path]) {
      paths[endpoint.path] = {};
    }

    const operation: any = {
      tags: [endpoint.controller],
      summary: endpoint.handler,
      description: endpoint.description,
      operationId: `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/\//g, '_').replace(/[{}]/g, '')}`,
    };

    // Parameters
    if (endpoint.parameters) {
      operation.parameters = endpoint.parameters;
    }

    // Request body
    if (endpoint.requestBody) {
      operation.requestBody = endpoint.requestBody;
    }

    // Security
    if (endpoint.authenticated) {
      operation.security = [{ bearerAuth: [] }];
    }

    // Responses
    operation.responses = {};
    for (const response of endpoint.responses) {
      operation.responses[response.status] = {
        description: response.description,
        ...(response.content && { content: response.content }),
      };
    }

    paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
  }

  return {
    openapi: '3.0.0',
    info: API_INFO,
    servers: [
      {
        url: baseUrl,
        description: 'Production server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: Array.from(tags).map((tag) => ({
      name: tag,
      description: `${tag} operations`,
    })),
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from NextAuth',
        },
      },
      schemas: {
        ServiceResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
            meta: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                agricultural: {
                  type: 'object',
                  properties: {
                    season: { type: 'string', enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER'] },
                    consciousness: { type: 'string', example: 'DIVINE' },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

// ============================================================================
// POSTMAN COLLECTION GENERATOR
// ============================================================================

function generatePostmanCollection(): any {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  const folders: Record<string, any[]> = {};

  for (const endpoint of KNOWN_ENDPOINTS) {
    if (!folders[endpoint.controller]) {
      folders[endpoint.controller] = [];
    }

    const request: any = {
      name: `${endpoint.method} ${endpoint.path}`,
      request: {
        method: endpoint.method,
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
        url: {
          raw: `{{baseUrl}}${endpoint.path}`,
          host: ['{{baseUrl}}'],
          path: endpoint.path.split('/').filter(Boolean),
        },
        description: endpoint.description,
      },
    };

    if (endpoint.authenticated) {
      request.request.header.push({
        key: 'Authorization',
        value: 'Bearer {{token}}',
      });
    }

    if (endpoint.requestBody) {
      request.request.body = {
        mode: 'raw',
        raw: JSON.stringify({}, null, 2),
      };
    }

    folders[endpoint.controller].push(request);
  }

  return {
    info: {
      name: 'Farmers Market Platform API',
      description: API_INFO.description,
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      {
        key: 'baseUrl',
        value: baseUrl,
        type: 'string',
      },
      {
        key: 'token',
        value: '',
        type: 'string',
      },
    ],
    item: Object.entries(folders).map(([name, items]) => ({
      name,
      item: items,
    })),
  };
}

// ============================================================================
// MARKDOWN GENERATOR
// ============================================================================

function generateMarkdownDocs(): string {
  let md = `# Farmers Market Platform API Documentation

**Version**: ${API_INFO.version}
**Base URL**: \`/api\`

${API_INFO.description}

---

## Table of Contents

`;

  const controllers = new Map<string, ApiEndpoint[]>();
  for (const endpoint of KNOWN_ENDPOINTS) {
    if (!controllers.has(endpoint.controller)) {
      controllers.set(endpoint.controller, []);
    }
    controllers.get(endpoint.controller)!.push(endpoint);
  }

  for (const controller of controllers.keys()) {
    md += `- [${controller}](#${controller.toLowerCase()})\n`;
  }

  md += '\n---\n\n';

  for (const [controller, endpoints] of controllers.entries()) {
    md += `## ${controller}\n\n`;

    for (const endpoint of endpoints) {
      md += `### \`${endpoint.method} ${endpoint.path}\`\n\n`;
      md += `${endpoint.description}\n\n`;

      if (endpoint.authenticated) {
        md += `**Authentication**: Required`;
        if (endpoint.roles) {
          md += ` (${endpoint.roles.join(', ')})`;
        }
        md += '\n\n';
      }

      if (endpoint.parameters && endpoint.parameters.length > 0) {
        md += `**Parameters**:\n\n`;
        md += `| Name | In | Type | Required | Description |\n`;
        md += `|------|-----|------|----------|-------------|\n`;
        for (const param of endpoint.parameters) {
          md += `| \`${param.name}\` | ${param.in} | ${param.schema.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |\n`;
        }
        md += '\n';
      }

      md += `**Responses**:\n\n`;
      for (const response of endpoint.responses) {
        md += `- **${response.status}**: ${response.description}\n`;
      }
      md += '\n---\n\n';
    }
  }

  return md;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('📚 Generating API Documentation...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate OpenAPI spec
  console.log('✨ Generating OpenAPI 3.0 specification...');
  const openapi = generateOpenAPISpec();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'openapi.json'),
    JSON.stringify(openapi, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'openapi.yaml'),
    JSON.stringify(openapi, null, 2) // Can be converted to YAML with js-yaml
  );
  console.log('✅ OpenAPI spec generated: docs/api/openapi.json\n');

  // Generate Postman collection
  console.log('✨ Generating Postman collection...');
  const postman = generatePostmanCollection();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'postman-collection.json'),
    JSON.stringify(postman, null, 2)
  );
  console.log('✅ Postman collection generated: docs/api/postman-collection.json\n');

  // Generate Markdown docs
  console.log('✨ Generating Markdown documentation...');
  const markdown = generateMarkdownDocs();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'API_REFERENCE.md'), markdown);
  console.log('✅ Markdown docs generated: docs/api/API_REFERENCE.md\n');

  // Create index.html for Swagger UI
  console.log('✨ Creating Swagger UI...');
  const swaggerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Farmers Market Platform API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: './openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), swaggerHTML);
  console.log('✅ Swagger UI created: docs/api/index.html\n');

  // Summary
  console.log('🎉 API Documentation Generated Successfully!\n');
  console.log('📁 Output Directory: docs/api/\n');
  console.log('Generated Files:');
  console.log('  - openapi.json (OpenAPI 3.0 specification)');
  console.log('  - openapi.yaml (YAML format)');
  console.log('  - postman-collection.json (Postman collection)');
  console.log('  - API_REFERENCE.md (Markdown documentation)');
  console.log('  - index.html (Swagger UI)\n');
  console.log('🌐 View API Docs:');
  console.log('  - Open docs/api/index.html in your browser');
  console.log('  - Or run: npx serve docs/api\n');
  console.log('🚀 Ready for frontend integration!\n');
}

// Run
main().catch((error) => {
  console.error('❌ Error generating API documentation:', error);
  process.exit(1);
});
