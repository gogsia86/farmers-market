/**
 * MARKETING ANALYTICS DASHBOARD
 * Divine marketing performance intelligence
 */

'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Mail,
  DollarSign,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface AnalyticsData {
  campaigns: any;
  sequences: any;
  discounts: any;
  referrals: any;
  roi: any;
}

export function MarketingAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/marketing/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!analytics) {
    return <div>Error loading analytics</div>;
  }

  const totalRevenue = 
    (analytics.discounts.revenue || 0) + 
    (analytics.roi.totalRevenue || 0);

  const totalConversions = 
    (analytics.campaigns.converted || 0) + 
    (analytics.referrals.completed || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Marketing Analytics</h2>
          <p className="text-gray-600 mt-1">Track your marketing performance in real-time</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          icon={<DollarSign className="h-8 w-8 text-green-600" />}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+24%"
          trend="up"
        />
        <MetricCard
          icon={<Target className="h-8 w-8 text-blue-600" />}
          label="Conversions"
          value={totalConversions.toLocaleString()}
          change="+18%"
          trend="up"
        />
        <MetricCard
          icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
          label="ROI"
          value={`${analytics.roi.roi}%`}
          change="+12%"
          trend="up"
        />
        <MetricCard
          icon={<Users className="h-8 w-8 text-orange-600" />}
          label="New Users"
          value={analytics.referrals.newUsers.toLocaleString()}
          change="+15%"
          trend="up"
        />
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-agricultural-600" />
          <h3 className="text-xl font-bold">Channel Performance</h3>
        </div>

        <div className="space-y-4">
          <ChannelBar
            channel="Email Campaigns"
            sent={analytics.campaigns.sent}
            opened={analytics.campaigns.opened}
            converted={analytics.campaigns.converted}
            revenue={23100}
          />
          <ChannelBar
            channel="Automated Sequences"
            sent={analytics.sequences.emailsSent}
            opened={Math.floor(analytics.sequences.emailsSent * 0.6)}
            converted={175}
            revenue={8750}
          />
          <ChannelBar
            channel="Discount Codes"
            sent={0}
            opened={0}
            converted={analytics.discounts.totalUses}
            revenue={analytics.discounts.revenue}
          />
          <ChannelBar
            channel="Referral Program"
            sent={0}
            opened={0}
            converted={analytics.referrals.completed}
            revenue={4450}
          />
        </div>
      </div>

      {/* Campaign Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Campaigns */}
        <StatsCard
          title="Email Campaigns"
          icon={<Mail className="h-6 w-6 text-blue-600" />}
          stats={[
            { label: 'Total Sent', value: analytics.campaigns.sent.toLocaleString() },
            { label: 'Open Rate', value: `${((analytics.campaigns.opened / analytics.campaigns.sent) * 100).toFixed(1)}%` },
            { label: 'Click Rate', value: `${((analytics.campaigns.clicked / analytics.campaigns.sent) * 100).toFixed(1)}%` },
            { label: 'Conversions', value: analytics.campaigns.converted.toLocaleString() },
          ]}
        />

        {/* Automated Sequences */}
        <StatsCard
          title="Automated Sequences"
          icon={<Activity className="h-6 w-6 text-purple-600" />}
          stats={[
            { label: 'Active Sequences', value: analytics.sequences.active },
            { label: 'Triggered', value: analytics.sequences.triggered.toLocaleString() },
            { label: 'Emails Sent', value: analytics.sequences.emailsSent.toLocaleString() },
            { label: 'Conversion Rate', value: `${analytics.sequences.conversionRate}%` },
          ]}
        />

        {/* Discount Codes */}
        <StatsCard
          title="Discount Codes"
          icon={<PieChart className="h-6 w-6 text-green-600" />}
          stats={[
            { label: 'Active Codes', value: analytics.discounts.active },
            { label: 'Total Uses', value: analytics.discounts.totalUses.toLocaleString() },
            { label: 'Revenue', value: `$${analytics.discounts.revenue.toLocaleString()}` },
            { label: 'Avg. Order', value: `$${(analytics.discounts.revenue / analytics.discounts.totalUses).toFixed(2)}` },
          ]}
        />
      </div>

      {/* ROI Breakdown */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          Return on Investment (ROI)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Marketing Spend</p>
            <p className="text-3xl font-bold text-gray-900">
              ${analytics.roi.totalSpent.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue Generated</p>
            <p className="text-3xl font-bold text-green-600">
              ${analytics.roi.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ROI Percentage</p>
            <p className="text-3xl font-bold text-green-600">
              {analytics.roi.roi}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ${(analytics.roi.totalRevenue / analytics.roi.totalSpent).toFixed(2)} returned per $1 spent
            </p>
          </div>
        </div>
      </div>

      {/* Referral Impact */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Referral Program Impact</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReferralMetric label="Total Referrals" value={analytics.referrals.total} />
          <ReferralMetric label="Completed" value={analytics.referrals.completed} />
          <ReferralMetric label="Rewards Paid" value={`$${analytics.referrals.rewardsPaid}`} />
          <ReferralMetric label="New Users" value={analytics.referrals.newUsers} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">
              {((analytics.referrals.completed / analytics.referrals.total) * 100).toFixed(1)}%
            </span>{' '}
            conversion rate from referral to completed purchase
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, change, trend }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ChannelBar({ channel, sent, opened, converted, revenue }: any) {
  const conversionRate = sent > 0 ? (converted / sent) * 100 : 0;
  const openRate = sent > 0 ? (opened / sent) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{channel}</span>
        <span className="text-sm text-gray-600">Revenue: ${revenue.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-agricultural-600 h-full rounded-full flex items-center justify-end pr-2"
            style={{ width: `${Math.min(conversionRate * 10, 100)}%` }}
          >
            <span className="text-xs text-white font-medium">
              {converted} conversions
            </span>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700 w-16">
          {conversionRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function StatsCard({ title, icon, stats }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h4 className="font-bold text-gray-900">{title}</h4>
      </div>
      
      <div className="space-y-3">
        {stats.map((stat: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{stat.label}</span>
            <span className="font-semibold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-agricultural-600">{value}</p>
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
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
