/**
 * 📦 BULK PRODUCT UPLOAD API ENDPOINT
 * Allows farmers to upload multiple products at once via CSV
 *
 * Divine Patterns:
 * - CSV parsing with validation
 * - Transaction-based bulk insert
 * - Error reporting per row
 * - Agricultural consciousness
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

// CSV row validation schema
const ProductCSVRowSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(2000).optional(),
  category: z.enum([
    "VEGETABLES",
    "FRUITS",
    "DAIRY",
    "EGGS",
    "MEAT",
    "POULTRY",
    "SEAFOOD",
    "PANTRY",
    "BEVERAGES",
    "BAKED_GOODS",
    "PREPARED_FOODS",
    "FLOWERS",
    "OTHER",
  ]),
  pricePerUnit: z.number().positive().min(0.01).max(10000),
  unit: z.string().min(1).max(20),
  stockQuantity: z.number().int().min(0).default(0),
  minimumOrder: z.number().int().min(1).default(1),
  maximumOrder: z.number().int().min(1).optional(),
  organic: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  availableFrom: z.string().optional(), // ISO date string
  availableTo: z.string().optional(), // ISO date string
});

interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  createdProducts: string[]; // Product IDs
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify user is a farmer
    const user = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        farms: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!user || user.role !== "FARMER" || user.farms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Only active farmers can bulk upload products",
        },
        { status: 403 },
      );
    }

    const farmId = user.farms?.[0]?.id;

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: "No farm found for user" },
        { status: 404 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "CSV file is required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { success: false, error: "Only CSV files are supported" },
        { status: 400 },
      );
    }

    // Read file content
    const fileContent = await file.text();
    const rows = parseCSV(fileContent);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "CSV file is empty" },
        { status: 400 },
      );
    }

    if (rows.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Maximum 500 products per upload. Please split into smaller batches.",
        },
        { status: 400 },
      );
    }

    // Process rows
    const result: BulkUploadResult = {
      success: true,
      totalRows: rows.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdProducts: [],
    };

    // Process in transaction
    await database.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because row 1 is header, arrays are 0-indexed

        try {
          // Validate row data
          const validatedData = ProductCSVRowSchema.parse(row);

          // Create product
          const product = await tx.product.create({
            data: {
              farmId: farmId || "",
              name: validatedData.name,
              slug: validatedData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-"),
              description: validatedData.description || "",
              category: validatedData.category,
              price: validatedData.pricePerUnit,
              unit: validatedData.unit,
              quantityAvailable: validatedData.stockQuantity,
              organic: validatedData.organic,
              seasonal: validatedData.seasonal,
              seasonalStart: validatedData.availableFrom
                ? new Date(validatedData.availableFrom)
                : null,
              seasonalEnd: validatedData.availableTo
                ? new Date(validatedData.availableTo)
                : null,
              status: "ACTIVE",
              inStock: validatedData.stockQuantity > 0,
              featured: false,
              publishedAt: new Date(),
            },
          });

          result.createdProducts.push(product.id);
          result.successCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            row: rowNumber,
            data: row,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          // If more than 50% errors, abort transaction
          if (result.errorCount > rows.length * 0.5) {
            throw new Error(
              "Too many errors (>50%). Upload aborted. Please fix CSV and try again.",
            );
          }
        }
      }
    });

    // Determine overall success
    result.success = result.errorCount === 0;

    return NextResponse.json(
      {
        success: result.success,
        data: result,
        message: result.success
          ? `Successfully uploaded ${result.successCount} products`
          : `Uploaded ${result.successCount} products with ${result.errorCount} errors`,
      },
      { status: result.success ? 201 : 207 }, // 207 = Multi-Status
    );
  } catch (error) {
    console.error("[BULK_UPLOAD_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Bulk upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Parse CSV content into array of objects
 */
function parseCSV(content: string): any[] {
  const lines = content.trim().split("\n");

  if (lines.length < 2) {
    return [];
  }

  // Parse header
  const headers = lines[0]?.split(",").map((h) => h.trim()) || [];

  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = parseCSVLine(line);

    if (values.length !== headers.length) {
      continue; // Skip malformed rows
    }

    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";

      // Type conversion
      if (
        header === "pricePerUnit" ||
        header === "stockQuantity" ||
        header === "minimumOrder" ||
        header === "maximumOrder"
      ) {
        row[header] = value ? parseFloat(value) : undefined;
      } else if (header === "organic" || header === "seasonal") {
        row[header] = value.toLowerCase() === "true" || value === "1";
      } else {
        row[header] = value || undefined;
      }
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current); // Push last value
  return result;
}

/**
 * GET endpoint to download CSV template
 */
export async function GET(_request: NextRequest) {
  const csvTemplate = `name,description,category,pricePerUnit,unit,stockQuantity,minimumOrder,maximumOrder,organic,seasonal,availableFrom,availableTo
"Organic Tomatoes","Fresh organic tomatoes grown on our farm",VEGETABLES,3.99,lb,50,1,10,true,false,2024-01-01,2024-12-31
"Farm Fresh Eggs","Free-range eggs from happy chickens",EGGS,6.99,dozen,100,1,5,true,false,,
"Raw Honey","Pure raw honey from local bees",PANTRY,12.99,jar,30,1,3,true,false,,
"Mixed Greens","Seasonal mixed salad greens",VEGETABLES,4.99,bag,40,1,8,true,true,2024-03-01,2024-11-30`;

  return new NextResponse(csvTemplate, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; filename="product-upload-template.csv"',
    },
  });
}
