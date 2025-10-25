/**
 * AUTOMATED SEQUENCES DASHBOARD
 * Divine automated email sequence management
 */

"use client";

import type { EmailSequence } from "@/types/automation.types";
import { Mail, PauseCircle, PlayCircle, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export function AutomatedSequencesDashboard() {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await fetch("/api/marketing/sequences");
      const data = await response.json();

      if (data.success) {
        setSequences(data.sequences);
      }
    } catch (error) {
      console.error("Failed to fetch sequences:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Automated Email Sequences
          </h2>
          <p className="text-gray-600 mt-1">
            Set it and forget it - emails sent on autopilot
          </p>
        </div>

        <button className="px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors font-medium">
          + Create Sequence
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="h-8 w-8 text-blue-600" />}
          label="Total Triggered"
          value={sequences
            .reduce((sum, s) => sum + s.stats.triggered, 0)
            .toLocaleString()}
          change="+12%"
        />
        <StatCard
          icon={<Mail className="h-8 w-8 text-purple-600" />}
          label="Emails Sent"
          value={sequences
            .reduce((sum, s) => sum + s.stats.emailsSent, 0)
            .toLocaleString()}
          change="+18%"
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-green-600" />}
          label="Conversion Rate"
          value={`${calculateConversionRate(sequences)}%`}
          change="+5%"
        />
        <StatCard
          icon={<span className="text-3xl">💰</span>}
          label="Revenue Generated"
          value={`$${sequences.reduce((sum, s) => sum + s.stats.revenue, 0).toLocaleString()}`}
          change="+28%"
        />
      </div>

      {/* Sequences List */}
      <div className="grid grid-cols-1 gap-6">
        {sequences.map((sequence) => (
          <SequenceCard
            key={sequence.id}
            sequence={sequence}
            onUpdate={fetchSequences}
          />
        ))}
      </div>
    </div>
  );
}

function SequenceCard({
  sequence,
  onUpdate,
}: {
  sequence: EmailSequence;
  onUpdate: () => void;
}) {
  const isActive = sequence.status === "ACTIVE";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-agricultural-600">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{sequence.name}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {sequence.status}
            </span>
          </div>

          <p className="text-gray-600 mb-3">{sequence.description}</p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>📧 {sequence.emails.length} emails</span>
            <span>🎯 Trigger: {formatTrigger(sequence.trigger)}</span>
          </div>
        </div>

        <button
          className={`p-3 rounded-lg transition-colors ${
            isActive
              ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
              : "bg-green-100 hover:bg-green-200 text-green-800"
          }`}
          title={isActive ? "Pause Sequence" : "Activate Sequence"}
        >
          {isActive ? (
            <PauseCircle className="h-6 w-6" />
          ) : (
            <PlayCircle className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Email Timeline */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Email Sequence:</h4>
        <div className="space-y-3">
          {sequence.emails.map((email, index) => (
            <div key={email.id} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-agricultural-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{email.subject}</p>
                <p className="text-sm text-gray-500">
                  {email.delayHours === 0
                    ? "Sent immediately"
                    : `Sent ${formatDelay(email.delayHours)} after ${index === 0 ? "trigger" : "previous email"}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricBox label="Triggered" value={sequence.stats.triggered} />
        <MetricBox label="Sent" value={sequence.stats.emailsSent} />
        <MetricBox label="Opened" value={sequence.stats.opened} />
        <MetricBox label="Clicked" value={sequence.stats.clicked} />
        <MetricBox label="Converted" value={sequence.stats.converted} />
      </div>

      {/* Conversion Stats */}
      {sequence.stats.revenue > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Revenue Generated:</span>
            <span className="text-lg font-bold text-green-600">
              ${sequence.stats.revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              Avg. Revenue per Email:
            </span>
            <span className="text-sm font-medium text-gray-900">
              ${(sequence.stats.revenue / sequence.stats.emailsSent).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, change }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-green-600 font-medium mt-1">{change}</p>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-agricultural-600">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function formatTrigger(trigger: string): string {
  return trigger
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDelay(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function calculateConversionRate(sequences: EmailSequence[]): string {
  const totalSent = sequences.reduce((sum, s) => sum + s.stats.emailsSent, 0);
  const totalConverted = sequences.reduce(
    (sum, s) => sum + s.stats.converted,
    0
  );

  if (totalSent === 0) return "0";

  return ((totalConverted / totalSent) * 100).toFixed(1);
}
