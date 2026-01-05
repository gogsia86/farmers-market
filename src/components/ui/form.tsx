/**
 * 🌟 Form Components - Divine Form System
 * Comprehensive form wrapper components with React Hook Form integration
 * Following: 08_UX_DESIGN_CONSCIOUSNESS, 12_ERROR_HANDLING_VALIDATION
 */

"use client";

import { cn } from "@/lib/utils";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

// ============================================================================
// FORM CONTEXT
// ============================================================================

const Form = FormProvider;

// ============================================================================
// FORM FIELD CONTEXT
// ============================================================================

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// ============================================================================
// FORM ITEM CONTEXT
// ============================================================================

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

// ============================================================================
// USE FORM FIELD HOOK
// ============================================================================

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// ============================================================================
// FORM ITEM COMPONENT
// ============================================================================

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

// ============================================================================
// FORM LABEL COMPONENT
// ============================================================================

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
    hint?: string;
  }
>(({ className, required, hint, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <div className="flex items-center justify-between">
      <LabelPrimitive.Root
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-red-600 dark:text-red-500",
          className
        )}
        htmlFor={formItemId}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">
            *
          </span>
        )}
      </LabelPrimitive.Root>
      {hint && (
        <span className="text-xs text-muted-foreground italic">{hint}</span>
      )}
    </div>
  );
});
FormLabel.displayName = "FormLabel";

// ============================================================================
// FORM CONTROL COMPONENT
// ============================================================================

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// ============================================================================
// FORM DESCRIPTION COMPONENT
// ============================================================================

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// ============================================================================
// FORM MESSAGE COMPONENT
// ============================================================================

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-sm font-medium text-red-600 dark:text-red-500",
        className
      )}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// ============================================================================
// FORM SUCCESS MESSAGE COMPONENT
// ============================================================================

const FormSuccess = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn(
        "text-sm font-medium text-green-600 dark:text-green-500",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});
FormSuccess.displayName = "FormSuccess";

// ============================================================================
// FORM SECTION COMPONENT (DIVINE PATTERN)
// ============================================================================

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  consciousness?: "DIVINE" | "AGRICULTURAL" | "STANDARD";
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  (
    { className, title, description, consciousness = "STANDARD", children, ...props },
    ref
  ) => {
    const consciousnessStyles = {
      DIVINE: "border-l-4 border-purple-500 pl-4",
      AGRICULTURAL: "border-l-4 border-green-500 pl-4",
      STANDARD: "border-l-2 border-gray-300 pl-4",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-4 py-4",
          consciousnessStyles[consciousness],
          className
        )}
        {...props}
      >
        {title && (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);
FormSection.displayName = "FormSection";

// ============================================================================
// FORM ACTIONS COMPONENT
// ============================================================================

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: "start" | "end" | "center" | "between";
  sticky?: boolean;
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, justify = "end", sticky = false, children, ...props }, ref) => {
    const justifyStyles = {
      start: "justify-start",
      end: "justify-end",
      center: "justify-center",
      between: "justify-between",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 pt-6 mt-6 border-t",
          justifyStyles[justify],
          sticky &&
          "sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormActions.displayName = "FormActions";

// ============================================================================
// FORM GRID COMPONENT (AGRICULTURAL PATTERN)
// ============================================================================

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

const FormGrid = React.forwardRef<HTMLDivElement, FormGridProps>(
  ({ className, columns = 2, gap = "md", children, ...props }, ref) => {
    const gapStyles = {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          {
            "grid-cols-1": columns === 1,
            "grid-cols-1 md:grid-cols-2": columns === 2,
            "grid-cols-1 md:grid-cols-3": columns === 3,
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
          },
          gapStyles[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormGrid.displayName = "FormGrid";

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Form,
  FormActions,
  FormControl,
  FormDescription,
  FormField,
  FormGrid,
  FormItem,
  FormLabel,
  FormMessage,
  FormSection,
  FormSuccess,
  useFormField
};

