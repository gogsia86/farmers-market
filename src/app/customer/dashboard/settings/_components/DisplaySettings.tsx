// ============================================
// DISPLAY SETTINGS COMPONENT
// ============================================
// Sprint 5: Settings & Configuration
// Manages user display and UI preferences
// Following divine agricultural patterns with type safety

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Moon,
  Sun,
  Globe,
  MapPin,
  DollarSign,
  Palette,
} from "lucide-react";
import type { UserSettingsData, Theme, DistanceUnit } from "@/types/settings";

interface DisplaySettingsProps {
  settings: UserSettingsData;
  onUpdate: (updates: Partial<UserSettingsData>) => void;
  disabled?: boolean;
}

/**
 * Display Settings Component
 * Provides UI for managing display preferences including theme, language, timezone, and units
 */
export function DisplaySettings({
  settings,
  onUpdate,
  disabled = false,
}: DisplaySettingsProps) {
  const { display } = settings;

  /**
   * Update display settings
   */
  const updateDisplay = (updates: Partial<typeof display>) => {
    onUpdate({
      display: {
        ...display,
        ...updates,
      },
    });
  };

  /**
   * Get theme icon
   */
  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
    }
  };

  /**
   * Common languages
   */
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "ar", name: "Arabic" },
  ];

  /**
   * Common timezones
   */
  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  ];

  /**
   * Common currencies
   */
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "MXN", symbol: "$", name: "Mexican Peso" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred color theme
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Theme Selector */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => updateDisplay({ theme: "light" })}
                disabled={disabled}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${
                    display.theme === "light"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <Sun className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">Light</p>
                  <p className="text-xs text-muted-foreground">Day theme</p>
                </div>
                {display.theme === "light" && (
                  <Badge
                    variant="default"
                    className="absolute top-2 right-2 text-xs"
                  >
                    Active
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => updateDisplay({ theme: "dark" })}
                disabled={disabled}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${
                    display.theme === "dark"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <Moon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">Dark</p>
                  <p className="text-xs text-muted-foreground">Night theme</p>
                </div>
                {display.theme === "dark" && (
                  <Badge
                    variant="default"
                    className="absolute top-2 right-2 text-xs"
                  >
                    Active
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => updateDisplay({ theme: "system" })}
                disabled={disabled}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${
                    display.theme === "system"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <Monitor className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">System</p>
                  <p className="text-xs text-muted-foreground">Auto theme</p>
                </div>
                {display.theme === "system" && (
                  <Badge
                    variant="default"
                    className="absolute top-2 right-2 text-xs"
                  >
                    Active
                  </Badge>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {display.theme === "system"
                ? "Theme will automatically match your device settings"
                : `Currently using ${display.theme} theme`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Language</CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Display Language</Label>
            <Select
              value={display.language}
              onValueChange={(value) => updateDisplay({ language: value })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the language for the user interface
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure timezone and measurement units
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={display.timezone}
              onValueChange={(value) => updateDisplay({ timezone: value })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for displaying dates and times accurately
            </p>
          </div>

          <Separator />

          {/* Distance Unit */}
          <div className="space-y-2">
            <Label htmlFor="distance-unit">Distance Unit</Label>
            <Select
              value={display.distanceUnit}
              onValueChange={(value) =>
                updateDisplay({ distanceUnit: value as DistanceUnit })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="miles">Miles (mi)</SelectItem>
                <SelectItem value="kilometers">Kilometers (km)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for displaying distances to farms and markets
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle>Currency</CardTitle>
              <CardDescription>Choose your preferred currency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select
              value={display.currency}
              onValueChange={(value) => updateDisplay({ currency: value })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Prices will be displayed in this currency (conversion rates apply)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            {getThemeIcon(display.theme)}
            <div className="space-y-1">
              <p className="text-sm font-medium">Current Settings</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Theme: <span className="font-medium">{display.theme}</span>
                </p>
                <p>
                  Language:{" "}
                  <span className="font-medium">
                    {languages.find((l) => l.code === display.language)?.name ||
                      display.language}
                  </span>
                </p>
                <p>
                  Distance:{" "}
                  <span className="font-medium">
                    {display.distanceUnit === "miles" ? "Miles" : "Kilometers"}
                  </span>
                </p>
                <p>
                  Currency:{" "}
                  <span className="font-medium">
                    {currencies.find((c) => c.code === display.currency)
                      ?.symbol || display.currency}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
