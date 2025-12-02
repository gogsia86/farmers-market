"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue = [min],
      onValueChange,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(
      value || defaultValue,
    );
    const sliderRef = React.useRef<HTMLDivElement>(null);
    const [activeThumb, setActiveThumb] = React.useState<number | null>(null);

    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: number[]) => {
      if (disabled) return;

      const sortedValue = [...newValue].sort((a, b) => a - b);

      if (value === undefined) {
        setInternalValue(sortedValue);
      }
      onValueChange?.(sortedValue);
    };

    const getPercentage = (val: number) => {
      return ((val - min) / (max - min)) * 100;
    };

    const getValueFromPosition = (clientX: number) => {
      if (!sliderRef.current) return min;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;

      return Math.max(min, Math.min(max, steppedValue));
    };

    const handleMouseDown = (thumbIndex: number) => (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setActiveThumb(thumbIndex);
    };

    React.useEffect(() => {
      if (activeThumb === null) return;

      const handleMouseMove = (e: MouseEvent) => {
        const newValue = getValueFromPosition(e.clientX);
        const updatedValues = [...currentValue];
        updatedValues[activeThumb] = newValue;
        handleValueChange(updatedValues);
      };

      const handleMouseUp = () => {
        setActiveThumb(null);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [activeThumb, currentValue]);

    const handleTrackClick = (e: React.MouseEvent) => {
      if (disabled || activeThumb !== null) return;

      const newValue = getValueFromPosition(e.clientX);

      if (currentValue.length === 1) {
        handleValueChange([newValue]);
      } else {
        // Find closest thumb and update it
        const distances = currentValue.map((val) => Math.abs(val - newValue));
        const closestIndex = distances.indexOf(Math.min(...distances));
        const updatedValues = [...currentValue];
        updatedValues[closestIndex] = newValue;
        handleValueChange(updatedValues);
      }
    };

    const minValue = Math.min(...currentValue);
    const maxValue = Math.max(...currentValue);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
        )}
      >
        <div
          ref={sliderRef}
          onClick={handleTrackClick}
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer",
          )}
        >
          {/* Active range fill */}
          <div
            className="absolute h-full bg-primary-600"
            style={{
              left: `${getPercentage(minValue)}%`,
              width: `${getPercentage(maxValue) - getPercentage(minValue)}%`,
            }}
          />

          {/* Thumbs */}
          {currentValue.map((val, index) => (
            <div
              key={index}
              onMouseDown={handleMouseDown(index)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                "h-5 w-5 rounded-full border-2 border-primary-600 bg-white shadow",
                "transition-transform hover:scale-110",
                !disabled && "cursor-grab active:cursor-grabbing",
                disabled && "cursor-not-allowed",
                activeThumb === index && "scale-110",
              )}
              style={{
                left: `${getPercentage(val)}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);

Slider.displayName = "Slider";

export { Slider };
