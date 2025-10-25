/**
 * NOTIFICATION PREFERENCES COMPONENT
 * User notification settings management
 */

'use client';

import { useState, useEffect } from 'react';
import { QuantumButton } from '@/components/ui/QuantumButton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@/types/notification.types';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (response.ok) {
        setPreferences(data);
      }
    } catch (error) {
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferences saved successfully');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (
    category: keyof Omit<NotificationPreferences, 'id' | 'userId' | 'pauseAll' | 'pauseUntil' | 'createdAt' | 'updatedAt'>,
    channel: string,
    value: boolean
  ) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        [channel]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading preferences...</div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load preferences
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'reviewReceived' as const,
      label: 'New Reviews',
      description: 'When someone reviews your product',
      channels: ['email', 'inApp', 'push'],
    },
    {
      key: 'reviewResponse' as const,
      label: 'Review Responses',
      description: 'When a farmer responds to your review',
      channels: ['email', 'inApp', 'push'],
    },
    {
      key: 'orderStatus' as const,
      label: 'Order Updates',
      description: 'Order status changes and delivery notifications',
      channels: ['email', 'inApp', 'push', 'sms'],
    },
    {
      key: 'productAvailable' as const,
      label: 'Product Availability',
      description: 'When out-of-stock products become available',
      channels: ['email', 'inApp', 'push'],
    },
    {
      key: 'lowInventory' as const,
      label: 'Low Inventory Alerts',
      description: 'When your product stock is running low',
      channels: ['email', 'inApp'],
    },
    {
      key: 'newMessage' as const,
      label: 'New Messages',
      description: 'Direct messages from customers or farmers',
      channels: ['email', 'inApp', 'push'],
    },
    {
      key: 'systemAlert' as const,
      label: 'System Alerts',
      description: 'Important system announcements',
      channels: ['email', 'inApp'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Notification Preferences
        </h2>
        <p className="text-gray-600 mt-1">
          Choose how you want to receive notifications
        </p>
      </div>

      {/* Global Pause */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Pause All Notifications</h3>
            <p className="text-sm text-gray-600">
              Temporarily stop all notifications
            </p>
          </div>
          <Switch
            checked={preferences.pauseAll}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, pauseAll: checked })
            }
          />
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {notificationTypes.map((type) => (
          <div
            key={type.key}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="mb-4">
              <h3 className="font-medium text-gray-900">{type.label}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {type.channels.map((channel) => (
                <div key={channel} className="flex items-center gap-2">
                  <Switch
                    checked={
                      preferences[type.key]?.[
                        channel as keyof typeof preferences[typeof type.key]
                      ] ?? false
                    }
                    onCheckedChange={(checked) =>
                      updatePreference(type.key, channel, checked)
                    }
                    disabled={preferences.pauseAll}
                  />
                  <label className="text-sm text-gray-700 capitalize">
                    {channel === 'inApp' ? 'In-App' : channel}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <QuantumButton
          variant="agricultural"
          onClick={savePreferences}
          loading={isSaving}
        >
          Save Preferences
        </QuantumButton>
      </div>
    </div>
  );
}
