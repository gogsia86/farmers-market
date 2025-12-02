"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "ring-offset-white placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  const [displayValue, setDisplayValue] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (value) {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <span className="block truncate">
      {displayValue || placeholder || "Select..."}
    </span>
  );
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg",
          "animate-in fade-in-80",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const {
    value: selectedValue,
    onValueChange,
    setOpen,
  } = React.useContext(SelectContext);

  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
        "hover:bg-gray-100",
        isSelected && "bg-primary-50 text-primary-900 font-medium",
        className,
      )}
    >
      {children}
    </button>
  );
}
