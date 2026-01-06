/**
 * 🌟 Multi-Step Form Components - Divine Form Orchestration
 * Comprehensive multi-step form management with progress tracking
 * Following: 08_UX_DESIGN_CONSCIOUSNESS, 12_ERROR_HANDLING_VALIDATION
 */

"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import * as React from "react";
import { Button } from "./button";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  validate?: () => Promise<boolean> | boolean;
}

export interface MultiStepFormContextValue {
  currentStep: number;
  steps: FormStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  completedSteps: Set<number>;
  errors: Map<number, string>;
  setStepError: (step: number, error: string | null) => void;
  consciousness?: "DIVINE" | "AGRICULTURAL" | "STANDARD";
}

// ============================================================================
// MULTI-STEP FORM CONTEXT
// ============================================================================

const MultiStepFormContext = React.createContext<
  MultiStepFormContextValue | undefined
>(undefined);

export const useMultiStepForm = () => {
  const context = React.useContext(MultiStepFormContext);
  if (!context) {
    throw new Error(
      "useMultiStepForm must be used within a MultiStepFormProvider"
    );
  }
  return context;
};

// ============================================================================
// MULTI-STEP FORM PROVIDER
// ============================================================================

interface MultiStepFormProviderProps {
  children: React.ReactNode;
  steps: FormStep[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  consciousness?: "DIVINE" | "AGRICULTURAL" | "STANDARD";
}

export function MultiStepFormProvider({
  children,
  steps,
  initialStep = 0,
  onStepChange,
  consciousness = "STANDARD",
}: MultiStepFormProviderProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set()
  );
  const [errors, setErrors] = React.useState<Map<number, string>>(new Map());

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoPrevious = currentStep > 0;
  const canGoNext = currentStep < steps.length - 1;

  const setStepError = React.useCallback((step: number, error: string | null) => {
    setErrors((prev) => {
      const newErrors = new Map(prev);
      if (error) {
        newErrors.set(step, error);
      } else {
        newErrors.delete(step);
      }
      return newErrors;
    });
  }, []);

  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [steps.length, onStepChange]
  );

  const nextStep = React.useCallback(async () => {
    const currentStepDef = steps[currentStep] || steps[0];

    // Clear previous error
    setStepError(currentStep, null);

    // Validate current step if validation function provided
    if (currentStepDef && currentStepDef.validate) {
      try {
        const isValid = await currentStepDef.validate();
        if (!isValid) {
          setStepError(currentStep, "Please complete all required fields");
          return;
        }
      } catch (error) {
        setStepError(
          currentStep,
          error instanceof Error ? error.message : "Validation failed"
        );
        return;
      }
    }

    // Mark step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    // Move to next step
    if (canGoNext) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      onStepChange?.(nextStepIndex);
    }
  }, [currentStep, steps, canGoNext, onStepChange, setStepError]);

  const previousStep = React.useCallback(() => {
    if (canGoPrevious) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      onStepChange?.(prevStepIndex);
    }
  }, [currentStep, canGoPrevious, onStepChange]);

  const value: MultiStepFormContextValue = {
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    goToStep,
    nextStep,
    previousStep,
    completedSteps,
    errors,
    setStepError,
    consciousness,
  };

  return (
    <MultiStepFormContext.Provider value={value}>
      {children}
    </MultiStepFormContext.Provider>
  );
}

// ============================================================================
// STEP INDICATOR VARIANTS
// ============================================================================

const stepIndicatorVariants = cva(
  "flex items-center justify-center rounded-full font-semibold transition-all duration-200",
  {
    variants: {
      status: {
        pending: "bg-gray-200 text-gray-600",
        current: "bg-primary text-primary-foreground ring-4 ring-primary/20",
        completed: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
      },
      size: {
        sm: "h-8 w-8 text-sm",
        default: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  }
);

// ============================================================================
// STEP INDICATOR COMPONENT
// ============================================================================

interface StepIndicatorProps extends VariantProps<typeof stepIndicatorVariants> {
  step: FormStep;
  stepNumber: number;
  isCurrent: boolean;
  isCompleted: boolean;
  hasError: boolean;
  onClick?: () => void;
  className?: string;
}

function StepIndicator({
  step,
  stepNumber,
  isCurrent,
  isCompleted,
  hasError,
  onClick,
  size,
  className,
}: StepIndicatorProps) {
  const status = hasError
    ? "error"
    : isCompleted
      ? "completed"
      : isCurrent
        ? "current"
        : "pending";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(stepIndicatorVariants({ status, size }))}>
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : hasError ? (
          <AlertCircle className="h-5 w-5" />
        ) : step.icon ? (
          step.icon
        ) : (
          stepNumber + 1
        )}
      </div>
      <div className="text-center max-w-[120px]">
        <p
          className={cn(
            "text-sm font-medium transition-colors",
            isCurrent
              ? "text-primary"
              : isCompleted
                ? "text-green-600"
                : hasError
                  ? "text-red-600"
                  : "text-gray-600 group-hover:text-gray-900"
          )}
        >
          {step.title}
        </p>
        {step.optional && (
          <p className="text-xs text-muted-foreground">(Optional)</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEPS PROGRESS COMPONENT
// ============================================================================

interface StepsProgressProps {
  variant?: "default" | "compact" | "minimal";
  orientation?: "horizontal" | "vertical";
  allowStepClick?: boolean;
  showConnector?: boolean;
  className?: string;
}

export function StepsProgress({
  variant = "default",
  orientation = "horizontal",
  allowStepClick = false,
  showConnector = true,
  className,
}: StepsProgressProps) {
  const {
    steps,
    currentStep,
    completedSteps,
    errors,
    goToStep,
    consciousness,
  } = useMultiStepForm();

  const consciousnessColors = {
    DIVINE: "bg-purple-500",
    AGRICULTURAL: "bg-green-500",
    STANDARD: "bg-primary",
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              index === currentStep
                ? `w-8 ${consciousnessColors[consciousness || "STANDARD"]}`
                : completedSteps.has(index)
                  ? "w-2 bg-green-500"
                  : "w-2 bg-gray-300"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
        <span className="text-sm font-medium">
          Step {currentStep + 1} of {steps.length}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              consciousnessColors[consciousness || "STANDARD"]
            )}
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "flex items-start justify-between"
          : "flex flex-col space-y-4",
        className
      )}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <StepIndicator
            step={step}
            stepNumber={index}
            isCurrent={index === currentStep}
            isCompleted={completedSteps.has(index)}
            hasError={errors.has(index)}
            onClick={
              allowStepClick && (completedSteps.has(index) || index < currentStep)
                ? () => goToStep(index)
                : undefined
            }
          />
          {showConnector && index < steps.length - 1 && (
            <div
              className={cn(
                "flex items-center justify-center",
                orientation === "horizontal"
                  ? "flex-1 h-0.5 mx-2 mt-5"
                  : "w-0.5 h-8 ml-5"
              )}
            >
              <div
                className={cn(
                  "h-full w-full transition-all duration-300",
                  completedSteps.has(index)
                    ? consciousnessColors[consciousness || "STANDARD"]
                    : "bg-gray-300"
                )}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================================
// STEP CONTENT COMPONENT
// ============================================================================

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({
  children,
  className,
}: StepContentProps) {
  const { currentStep, steps, errors } = useMultiStepForm();
  const currentStepDef = steps[currentStep] || steps[0];
  const error = errors.get(currentStep);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Step Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{currentStepDef?.title}</h2>
        {currentStepDef?.description && (
          <p className="text-muted-foreground">{currentStepDef.description}</p>
        )}
      </div>

      {/* Step Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Validation Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div>{children}</div>
    </div>
  );
};

// ============================================================================
// STEP NAVIGATION COMPONENT
// ============================================================================

interface StepNavigationProps {
  onSubmit?: () => void;
  submitLabel?: string;
  nextLabel?: string;
  previousLabel?: string;
  isSubmitting?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  className?: string;
}

export function StepNavigation({
  onSubmit,
  submitLabel = "Submit",
  nextLabel = "Next",
  previousLabel = "Previous",
  isSubmitting = false,
  showPrevious = true,
  showNext = true,
  className,
}: StepNavigationProps) {
  const { isFirstStep, isLastStep, canGoPrevious, nextStep, previousStep } =
    useMultiStepForm();

  const handleNext = async () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else {
      await nextStep();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between pt-6 mt-6 border-t",
        className
      )}
    >
      <div>
        {showPrevious && !isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={!canGoPrevious || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {previousLabel}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showNext && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isLastStep ? (
              submitLabel
            ) : (
              <>
                {nextLabel}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MULTI-STEP FORM CONTAINER
// ============================================================================

interface MultiStepFormContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MultiStepFormContainer({
  children,
  className,
}: MultiStepFormContainerProps) {
  const { consciousness } = useMultiStepForm();

  const consciousnessStyles = {
    DIVINE:
      "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200",
    AGRICULTURAL:
      "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    STANDARD: "bg-background border-gray-200",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-6 shadow-sm",
        consciousnessStyles[consciousness || "STANDARD"],
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================================================
// AGRICULTURAL MULTI-STEP FORM (DIVINE PATTERN)
// ============================================================================

interface AgriculturalMultiStepFormProps {
  steps: FormStep[];
  onComplete: () => void;
  children: React.ReactNode;
  initialStep?: number;
  className?: string;
}

export function AgriculturalMultiStepForm({
  steps,
  onComplete,
  children,
  initialStep = 0,
  className
}: AgriculturalMultiStepFormProps) {
  return (
    <MultiStepFormProvider
      steps={steps}
      initialStep={initialStep}
      consciousness="AGRICULTURAL"
    >
      <MultiStepFormContainer className={className}>
        <div className="space-y-8">
          <StepsProgress variant="default" allowStepClick />
          <StepContent>{children}</StepContent>
          <StepNavigation onSubmit={onComplete} submitLabel="Complete" />
        </div>
      </MultiStepFormContainer>
    </MultiStepFormProvider>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
// All components are already exported inline above
