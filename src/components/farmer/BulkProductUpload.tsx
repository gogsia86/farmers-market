"use client";

/**
 * 📦 BULK PRODUCT UPLOAD COMPONENT
 * Allows farmers to upload multiple products at once via CSV
 *
 * Divine Patterns:
 * - Drag & drop file upload
 * - CSV validation and preview
 * - Progress tracking
 * - Error reporting per row
 * - Template download
 */

import { Upload, Download, AlertCircle, CheckCircle2, X, FileText } from "lucide-react";
import { useCallback, useState, useRef } from "react";

interface UploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  createdProducts: string[];
}

interface BulkProductUploadProps {
  onSuccess?: (result: UploadResult) => void;
  onClose?: () => void;
}

export function BulkProductUpload({ onSuccess, onClose }: BulkProductUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  // Download CSV template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/products/bulk");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-upload-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download template");
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/bulk", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
        if (onSuccess) {
          onSuccess(data.data);
        }
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h2>
          <p className="text-gray-600 mt-1">Upload multiple products at once using CSV</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">How to upload products:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the CSV template below</li>
              <li>Fill in your product information</li>
              <li>Upload the completed CSV file (max 500 products per upload)</li>
              <li>Review any errors and re-upload if needed</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template Button */}
      <div className="mb-6">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-agricultural-100 text-agricultural-700 rounded-lg hover:bg-agricultural-200 transition-colors font-medium"
        >
          <Download className="h-5 w-5" />
          Download CSV Template
        </button>
      </div>

      {/* Upload Area */}
      {!result && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-agricultural-500 bg-agricultural-50"
              : "border-gray-300 hover:border-agricultural-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!file ? (
            <div>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Maximum file size: 5MB (up to 500 products)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors font-medium"
              >
                Select CSV File
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="h-12 w-12 text-agricultural-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload Products"}
                </button>
                <button
                  onClick={handleReset}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-agricultural-600 h-full w-1/2 animate-pulse" />
            </div>
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Success Summary */}
          <div
            className={`border rounded-lg p-4 ${
              result.success
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                className={`h-6 w-6 flex-shrink-0 ${
                  result.success ? "text-green-600" : "text-yellow-600"
                }`}
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-2">
                  {result.success
                    ? "Upload Completed Successfully!"
                    : "Upload Completed with Errors"}
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Rows:</span>
                    <span className="ml-2 font-semibold">{result.totalRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Successful:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {result.successCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Failed:</span>
                    <span className="ml-2 font-semibold text-red-600">
                      {result.errorCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.errors.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                <h3 className="font-semibold text-red-900">
                  Errors ({result.errors.length})
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  The following rows had errors and were not uploaded:
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        Row
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {result.errors.map((error, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900 font-medium">
                          {error.row}
                        </td>
                        <td className="px-4 py-2 text-red-700">{error.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors font-medium"
            >
              Upload Another File
            </button>
            {result.successCount > 0 && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                View Products
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSV Format Reference */}
      <div className="mt-8 border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-3">CSV Format Reference</h3>
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <table className="text-sm min-w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">
                  Column
                </th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">
                  Type
                </th>
                <th className="text-left py-2 font-semibold text-gray-700">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">name</td>
                <td className="py-2 pr-4 text-gray-600">Required</td>
                <td className="py-2 text-gray-600">Product name (3-200 characters)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">description</td>
                <td className="py-2 pr-4 text-gray-600">Optional</td>
                <td className="py-2 text-gray-600">Product description</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">category</td>
                <td className="py-2 pr-4 text-gray-600">Required</td>
                <td className="py-2 text-gray-600">
                  VEGETABLES, FRUITS, DAIRY, EGGS, MEAT, etc.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">pricePerUnit</td>
                <td className="py-2 pr-4 text-gray-600">Required</td>
                <td className="py-2 text-gray-600">Price (0.01 - 10,000)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">unit</td>
                <td className="py-2 pr-4 text-gray-600">Required</td>
                <td className="py-2 text-gray-600">Unit (lb, kg, dozen, etc.)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">stockQuantity</td>
                <td className="py-2 pr-4 text-gray-600">Required</td>
                <td className="py-2 text-gray-600">Stock quantity (integer)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">organic</td>
                <td className="py-2 pr-4 text-gray-600">Optional</td>
                <td className="py-2 text-gray-600">true/false</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
