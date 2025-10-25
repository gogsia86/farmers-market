/**
 * REPORT GENERATOR COMPONENT
 * Divine agricultural report creation interface
 */

'use client';

import { useState } from 'react';
import { QuantumButton } from '@/components/ui/QuantumButton';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'SALES' | 'INVENTORY' | 'PRODUCTS' | 'CUSTOMERS';
type ReportFormat = 'JSON' | 'CSV';

export function ReportGenerator({ farmId }: { farmId?: string }) {
  const [reportType, setReportType] = useState<ReportType>('SALES');
  const [format, setFormat] = useState<ReportFormat>('JSON');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          startDate,
          endDate,
          farmId,
          format,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      if (format === 'CSV') {
        // Download CSV
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Report downloaded!');
      } else {
        // Show JSON
        const data = await response.json();
        console.log('Report data:', data);
        toast.success('Report generated!');
        // You could open a modal or new page to display the data
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    {
      value: 'SALES' as const,
      label: 'Sales Report',
      description: 'Orders, revenue, and customer details',
    },
    {
      value: 'INVENTORY' as const,
      label: 'Inventory Report',
      description: 'Stock levels and product status',
    },
    {
      value: 'PRODUCTS' as const,
      label: 'Product Report',
      description: 'Performance, ratings, and sales',
    },
    {
      value: 'CUSTOMERS' as const,
      label: 'Customer Report',
      description: 'Purchase history and analytics',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
        <p className="text-gray-600 mt-1">
          Create custom reports for your farm
        </p>
      </div>

      {/* Report Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Report Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                reportType === type.value
                  ? 'border-agricultural-500 bg-agricultural-50'
                  : 'border-gray-200 hover:border-agricultural-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText
                  className={`w-5 h-5 mt-0.5 ${
                    reportType === type.value
                      ? 'text-agricultural-600'
                      : 'text-gray-400'
                  }`}
                />
                <div>
                  <p className="font-medium text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Export Format
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setFormat('JSON')}
            className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              format === 'JSON'
                ? 'border-agricultural-500 bg-agricultural-50 text-agricultural-700'
                : 'border-gray-200 text-gray-700 hover:border-agricultural-300'
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => setFormat('CSV')}
            className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              format === 'CSV'
                ? 'border-agricultural-500 bg-agricultural-50 text-agricultural-700'
                : 'border-gray-200 text-gray-700 hover:border-agricultural-300'
            }`}
          >
            CSV (Spreadsheet)
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <QuantumButton
          variant="agricultural"
          size="lg"
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={!startDate || !endDate}
          icon={<Download className="w-5 h-5" />}
        >
          Generate Report
        </QuantumButton>
      </div>

      {/* Report Preview Info */}
      {startDate && endDate && (
        <div className="bg-agricultural-50 border border-agricultural-200 rounded-lg p-4">
          <h4 className="font-medium text-agricultural-900 mb-2">
            Report Preview
          </h4>
          <ul className="text-sm text-agricultural-700 space-y-1">
            <li>• Type: {reportTypes.find(t => t.value === reportType)?.label}</li>
            <li>• Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</li>
            <li>• Format: {format}</li>
            {farmId && <li>• Farm: Specific Farm</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
