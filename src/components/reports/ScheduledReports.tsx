/**
 * SCHEDULED REPORTS COMPONENT
 * Manage automated report schedules
 */

"use client";

import { QuantumButton } from "@/components/ui/QuantumButton";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: string;
  recipients: string[];
  active: boolean;
  lastRun: string | null;
  nextRun: string;
  createdAt: string;
}

export function ScheduledReports({ farmId }: { farmId?: string }) {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const fetchScheduledReports = async () => {
    try {
      const response = await fetch("/api/reports/scheduled");
      const data = await response.json();

      if (response.ok) {
        setReports(data.reports);
      }
    } catch (error) {
      toast.error("Failed to load scheduled reports");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this scheduled report?")) return;

    try {
      const response = await fetch(`/api/reports/scheduled/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        toast.success("Scheduled report deleted");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete scheduled report");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Scheduled Reports
          </h2>
          <p className="text-gray-600 mt-1">
            Automated report delivery to your inbox
          </p>
        </div>
        <QuantumButton
          variant="agricultural"
          onClick={() => setShowCreateForm(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          New Schedule
        </QuantumButton>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No scheduled reports</p>
          <p className="text-sm text-gray-500 mt-1">
            Create a schedule to receive automated reports
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Report Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.reportType} • {report.frequency}
                  </p>
                </div>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    report.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {report.active ? "Active" : "Paused"}
                </span>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Next run: {new Date(report.nextRun).toLocaleDateString()}
                  </span>
                </div>
                {report.lastRun && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Last run: {new Date(report.lastRun).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Recipients:</p>
                <div className="flex flex-wrap gap-1">
                  {report.recipients.map((email, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-agricultural-50 text-agricultural-700 px-2 py-1 rounded"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal (simplified - would be a full modal component) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create Scheduled Report
            </h3>
            <p className="text-gray-600 mb-4">Form would go here...</p>
            <div className="flex justify-end gap-3">
              <QuantumButton
                variant="secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </QuantumButton>
              <QuantumButton variant="agricultural">
                Create Schedule
              </QuantumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
