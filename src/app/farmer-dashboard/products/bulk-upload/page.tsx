"use client";

/**
 * 📦 BULK PRODUCT UPLOAD PAGE
 * Farmer dashboard page for uploading multiple products via CSV
 *
 * Divine Patterns:
 * - Protected route (farmer authentication required)
 * - Comprehensive upload interface
 * - Success/error handling
 * - Navigation back to dashboard
 */

import { BulkProductUploadDynamic } from "@/components/farmer/BulkProductUploadDynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

import { useState } from "react";

export default function BulkUploadPage() {
  // const router = useRouter(); // Reserved for future redirect functionality
  const [_uploadComplete, setUploadComplete] = useState(false);

  const handleUploadSuccess = (result: any) => {
    setUploadComplete(true);

    // Show success message
    console.log(`Successfully uploaded ${result.successCount} products`);

    // Optionally redirect after a delay
    setTimeout(() => {
      // Could redirect to products page or stay here
      // router.push("/farmer-dashboard");
    }, 3000);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              href="/farmer-dashboard"
              className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-agricultural-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-agricultural-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bulk Product Upload
                </h1>
                <p className="text-gray-600 mt-1">
                  Upload multiple products at once using a CSV file
                </p>
              </div>
            </div>
          </div>

          {/* Upload Component - Dynamically Loaded */}
          <BulkProductUploadDynamic onSuccess={handleUploadSuccess} />

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold mb-1">
                  What file format should I use?
                </h3>
                <p className="text-sm text-gray-600">
                  Use CSV (Comma-Separated Values) format. Download our template
                  to get started with the correct format.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  How many products can I upload at once?
                </h3>
                <p className="text-sm text-gray-600">
                  You can upload up to 500 products in a single CSV file. For
                  larger catalogs, split into multiple uploads.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">What if I have errors?</h3>
                <p className="text-sm text-gray-600">
                  The system will validate each row and show you exactly which
                  rows have errors. You can fix the CSV and re-upload.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Can I update existing products?
                </h3>
                <p className="text-sm text-gray-600">
                  Currently, bulk upload only creates new products. To update
                  existing products, please use the individual product editor.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Link
              href="/farmer-dashboard"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-sm text-gray-600">
                View your sales, orders, and analytics
              </p>
            </Link>
            <Link
              href="/farmer-dashboard/products"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Manage Products
              </h3>
              <p className="text-sm text-gray-600">
                Edit, delete, or view individual products
              </p>
            </Link>
            <Link
              href="/farmer-dashboard/orders"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Orders</h3>
              <p className="text-sm text-gray-600">
                Manage incoming orders and fulfillment
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
