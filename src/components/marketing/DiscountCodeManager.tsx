/**
 * DISCOUNT CODE MANAGER
 * Divine promotional discount management interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, Calendar, Users, TrendingUp, Copy, Check } from 'lucide-react';
import type { DiscountCode, DiscountType } from '@/types/marketing.types';

export function DiscountCodeManager() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/marketing/discounts');
      const data = await response.json();
      
      if (data.success) {
        setDiscounts(data.discounts);
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Discount Codes</h2>
          <p className="text-gray-600 mt-1">Create and manage promotional discount codes</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Tag className="h-8 w-8 text-purple-600" />}
          label="Active Codes"
          value={discounts.filter((d) => d.isActive).length}
        />
        <StatCard
          icon={<Users className="h-8 w-8 text-blue-600" />}
          label="Total Uses"
          value={discounts.reduce((sum, d) => sum + d.usedCount, 0)}
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-green-600" />}
          label="Avg. Uses per Code"
          value={Math.round(
            discounts.reduce((sum, d) => sum + d.usedCount, 0) / discounts.length
          )}
        />
        <StatCard
          icon={<span className="text-3xl">💰</span>}
          label="Est. Discount Value"
          value={`$${calculateTotalDiscountValue(discounts)}`}
        />
      </div>

      {/* Discount Codes List */}
      <div className="grid grid-cols-1 gap-4">
        {discounts.map((discount) => (
          <DiscountCodeCard key={discount.id} discount={discount} onUpdate={fetchDiscounts} />
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDiscountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDiscounts();
          }}
        />
      )}
    </div>
  );
}

function DiscountCodeCard({ discount, onUpdate }: { discount: DiscountCode; onUpdate: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(discount.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = discount.expiresAt && new Date() > discount.expiresAt;
  const isLimitReached = discount.maxUses && discount.usedCount >= discount.maxUses;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-agricultural-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Code Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Tag className="h-5 w-5 text-agricultural-600" />
              <code className="text-xl font-bold text-gray-900">{discount.code}</code>
              <button
                onClick={copyCode}
                className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>

            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              discount.isActive && !isExpired && !isLimitReached
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {discount.isActive && !isExpired && !isLimitReached ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Discount Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold text-gray-900">{formatDiscountType(discount.type)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Value</p>
              <p className="font-semibold text-gray-900">
                {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Min. Order</p>
              <p className="font-semibold text-gray-900">
                {discount.minOrderAmount ? `$${discount.minOrderAmount}` : 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Uses</p>
              <p className="font-semibold text-gray-900">
                {discount.usedCount}
                {discount.maxUses ? ` / ${discount.maxUses}` : ' / ∞'}
              </p>
            </div>
          </div>

          {/* Expiration */}
          {discount.expiresAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Expires: {new Date(discount.expiresAt).toLocaleDateString()}
                {isExpired && <span className="text-red-600 ml-2 font-medium">(Expired)</span>}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Edit
          </button>
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateDiscountModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as DiscountType,
    value: 10,
    minOrderAmount: 0,
    maxUses: undefined as number | undefined,
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/marketing/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Failed to create discount code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">Create Discount Code</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code (uppercase, no spaces)
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="PERCENTAGE">Percentage Off (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
              <option value="BUY_ONE_GET_ONE">Buy One Get One</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Order Amount (optional)
            </label>
            <input
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
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
    </div>
  );
}

function formatDiscountType(type: DiscountType): string {
  const types = {
    PERCENTAGE: 'Percentage Off',
    FIXED_AMOUNT: 'Fixed Amount',
    FREE_SHIPPING: 'Free Shipping',
    BUY_ONE_GET_ONE: 'BOGO',
  };
  return types[type];
}

function calculateTotalDiscountValue(discounts: DiscountCode[]): string {
  // Simplified calculation
  const total = discounts.reduce((sum, d) => {
    if (d.type === 'FIXED_AMOUNT') {
      return sum + d.value * d.usedCount;
    }
    return sum + 5 * d.usedCount; // Approximate for percentage discounts
  }, 0);
  
  return total.toLocaleString();
}
