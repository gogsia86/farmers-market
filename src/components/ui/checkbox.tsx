/**
 * 🌟 Checkbox & Radio Components - Divine Form Controls
 * Enhanced checkbox and radio components with form integration
 * Following: 08_UX_DESIGN_CONSCIOUSNESS, 12_ERROR_HANDLING_VALIDATION
 */

"use client";

import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Circle } from "lucide-react";
import * as React from "react";

// ============================================================================
// CHECKBOX VARIANTS
// ============================================================================

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        error:
          "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white",
        success:
          "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white",
        agricultural:
          "border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:text-white",
      },
      checkboxSize: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      checkboxSize: "default",
    },
  }
);

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  VariantProps<typeof checkboxVariants> { }

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, checkboxSize, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, checkboxSize, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

interface CheckboxGroupProps {
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value: string[];
  onChange: (value: string[]) => void;
  variant?: "default" | "error" | "success" | "agricultural";
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      options,
      value,
      onChange,
      variant = "default",
      orientation = "vertical",
      className,
    },
    ref
  ) => {
    const handleChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...value, optionValue]);
      } else {
        onChange(value.filter((v: any) => v !== optionValue));
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-3",
          orientation === "horizontal" && "flex flex-wrap gap-6 space-y-0",
          className
        )}
      >
        {options.map((option: any) => (
          <div key={option.value} className="flex items-start space-x-3">
            <Checkbox
              id={`checkbox-${option.value}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) =>
                handleChange(option.value, checked as boolean)
              }
              disabled={option.disabled}
              variant={variant}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={`checkbox-${option.value}`}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);
CheckboxGroup.displayName = "CheckboxGroup";

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  variant?: "default" | "error" | "success" | "agricultural";
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      value,
      onChange,
      name,
      variant = "default",
      orientation = "vertical",
      className,
    },
    ref
  ) => {
    const variantStyles = {
      default: "text-primary",
      error: "text-red-500",
      success: "text-green-500",
      agricultural: "text-green-600",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-3",
          orientation === "horizontal" && "flex flex-wrap gap-6 space-y-0",
          className
        )}
        role="radiogroup"
      >
        {options.map((option: any) => (
          <div key={option.value} className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                type="radio"
                id={`radio-${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={option.disabled}
                className={cn(
                  "h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2 transition-all duration-200 cursor-pointer",
                  variantStyles[variant],
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
            <div className="flex items-start gap-2 flex-1">
              {option.icon && (
                <span className="flex-shrink-0 mt-0.5">{option.icon}</span>
              )}
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={`radio-${name}-${option.value}`}
                  className={cn(
                    "text-sm font-medium leading-none cursor-pointer",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

// ============================================================================
// CARD RADIO GROUP (AGRICULTURAL PATTERN)
// ============================================================================

interface CardRadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  variant?: "default" | "agricultural";
  columns?: 1 | 2 | 3;
  className?: string;
}

const CardRadioGroup = React.forwardRef<HTMLDivElement, CardRadioGroupProps>(
  (
    { options, value, onChange, name, variant = "default", columns = 2, className },
    ref
  ) => {
    const variantStyles = {
      default: "border-primary ring-primary",
      agricultural: "border-green-500 ring-green-500",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4",
          {
            "grid-cols-1": columns === 1,
            "grid-cols-1 md:grid-cols-2": columns === 2,
            "grid-cols-1 md:grid-cols-3": columns === 3,
          },
          className
        )}
        role="radiogroup"
      >
        {options.map((option: any) => (
          <label
            key={option.value}
            htmlFor={`card-radio-${name}-${option.value}`}
            className={cn(
              "relative flex cursor-pointer rounded-lg border-2 bg-background p-4 hover:bg-accent focus:outline-none transition-all duration-200",
              value === option.value
                ? `border-2 ring-2 ring-offset-2 ${variantStyles[variant]}`
                : "border-gray-300",
              option.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              id={`card-radio-${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={option.disabled}
              className="sr-only"
            />
            <div className="flex w-full items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {option.icon && (
                  <span className="flex-shrink-0 text-2xl">{option.icon}</span>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{option.label}</span>
                  {option.description && (
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </div>
              <Circle
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all",
                  value === option.value
                    ? "text-primary fill-primary"
                    : "text-gray-300"
                )}
              />
            </div>
          </label>
        ))}
      </div>
    );
  }
);
CardRadioGroup.displayName = "CardRadioGroup";

// ============================================================================
// AGRICULTURAL CHECKBOX CARD (DIVINE PATTERN)
// ============================================================================

interface AgriculturalCheckboxCardProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  className?: string;
}

const AgriculturalCheckboxCard = React.forwardRef<
  HTMLDivElement,
  AgriculturalCheckboxCardProps
>(
  (
    {
      checked,
      onCheckedChange,
      title,
      description,
      icon,
      badge,
      disabled = false,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer rounded-lg border-2 bg-background p-4 hover:bg-accent transition-all duration-200",
          checked
            ? "border-green-500 ring-2 ring-green-500 ring-offset-2"
            : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && onCheckedChange(!checked)}
      >
        <div className="flex w-full items-start gap-4">
          {icon && (
            <span className="flex-shrink-0 text-2xl text-green-600">
              {icon}
            </span>
          )}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{title}</span>
              {badge && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </div>
          <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            variant="agricultural"
            className="pointer-events-none"
          />
        </div>
      </div>
    );
  }
);
AgriculturalCheckboxCard.displayName = "AgriculturalCheckboxCard";

// ============================================================================
// EXPORTS
// ============================================================================

export {
  AgriculturalCheckboxCard,
  CardRadioGroup,
  Checkbox,
  CheckboxGroup,
  RadioGroup
};

