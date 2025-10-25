/**
 * REFERRAL DASHBOARD
 * Divine viral growth referral interface
 */

"use client";

import type { Referral } from "@/types/marketing.types";
import {
  Check,
  Copy,
  DollarSign,
  Gift,
  Share2,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  rewardsPaid: number;
  rewardsPending: number;
}

export function ReferralDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
    fetchLeaderboard();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch(`/api/marketing/referrals?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setReferralLink(data.referralLink);
        setReferralCode(data.referralCode);
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        "/api/marketing/referrals/leaderboard?limit=10"
      );
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!stats) {
    return <div>Error loading referral data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-agricultural-600 to-agricultural-700 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Earn Money by Sharing!</h2>
        <p className="text-agricultural-100 text-lg">
          Invite friends and earn ${stats.totalEarned > 0 ? "10" : "10"} for
          each successful referral
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="h-8 w-8 text-blue-600" />}
          label="Total Referrals"
          value={stats.totalReferrals}
          subtext={`${stats.completedReferrals} completed`}
        />
        <StatCard
          icon={<DollarSign className="h-8 w-8 text-green-600" />}
          label="Total Earned"
          value={`$${stats.totalEarned}`}
          subtext="Lifetime earnings"
        />
        <StatCard
          icon={<Gift className="h-8 w-8 text-purple-600" />}
          label="Rewards Paid"
          value={`$${stats.rewardsPaid}`}
          subtext="Already in your account"
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-orange-600" />}
          label="Pending Rewards"
          value={`$${stats.rewardsPending}`}
          subtext="Will be paid soon"
        />
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Share2 className="h-6 w-6 text-agricultural-600" />
          Your Referral Link
        </h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <code className="flex-1 text-gray-900 font-mono">
              {referralLink}
            </code>
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">Your Code:</span>
            <code className="bg-white px-3 py-1 rounded border border-gray-300">
              {referralCode}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ShareButton
            platform="facebook"
            icon="📘"
            label="Share on Facebook"
            url={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
          />
          <ShareButton
            platform="twitter"
            icon="🐦"
            label="Share on Twitter"
            url={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=Join%20Farmers%20Market%20and%20get%20fresh%20local%20produce!`}
          />
          <ShareButton
            platform="whatsapp"
            icon="💚"
            label="Share on WhatsApp"
            url={`https://wa.me/?text=Check%20out%20Farmers%20Market!%20${encodeURIComponent(referralLink)}`}
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Step
            number={1}
            title="Share Your Link"
            description="Send your unique referral link to friends and family"
            icon="🔗"
          />
          <Step
            number={2}
            title="They Sign Up"
            description="Your friends join and make their first purchase"
            icon="✅"
          />
          <Step
            number={3}
            title="You Both Earn!"
            description="You get $10, they get $5 - everyone wins!"
            icon="💰"
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Top Referrers This Month
        </h3>

        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <LeaderboardEntry
              key={entry.userId}
              rank={index + 1}
              name={entry.userName}
              referrals={entry.referralCount}
              earned={entry.totalEarned}
              isCurrentUser={entry.userId === userId}
            />
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Your Recent Referrals</h3>
          <div className="space-y-3">
            {referrals.slice(0, 5).map((referral) => (
              <ReferralItem key={referral.id} referral={referral} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{subtext}</p>
    </div>
  );
}

function ShareButton({ platform, icon, label, url }: any) {
  return (
    <button
      onClick={() => window.open(url, "_blank", "width=600,height=400")}
      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-agricultural-600 hover:bg-agricultural-50 transition-all"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}

function Step({ number, title, description, icon }: any) {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">
        <div className="w-16 h-16 bg-agricultural-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
      <div className="text-sm text-agricultural-600 font-semibold mb-2">
        STEP {number}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function LeaderboardEntry({
  rank,
  name,
  referrals,
  earned,
  isCurrentUser,
}: any) {
  const medalEmoji =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg ${
        isCurrentUser
          ? "bg-agricultural-50 border-2 border-agricultural-600"
          : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center font-bold text-gray-700">
          {medalEmoji || `#${rank}`}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {name}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-agricultural-600">(You!)</span>
            )}
          </p>
          <p className="text-sm text-gray-600">{referrals} referrals</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">${earned}</p>
        <p className="text-xs text-gray-500">earned</p>
      </div>
    </div>
  );
}

function ReferralItem({ referral }: { referral: Referral }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">
          {referral.status === "COMPLETED" ? "✅ Completed" : "⏳ Pending"}
        </p>
        <p className="text-sm text-gray-600">
          {new Date(referral.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">+${referral.referrerReward}</p>
        {referral.rewardPaid && <p className="text-xs text-gray-500">Paid</p>}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
