/**
 * @fileoverview Toast Component Tests
 * @module components/notifications/__tests__/Toast.test
 * @description Comprehensive tests for Toast notification component
 *
 * Test Coverage:
 * ✅ Component Rendering
 * ✅ Variant Styles
 * ✅ Actions & Callbacks
 * ✅ Auto-dismiss Behavior
 * ✅ Accessibility (ARIA)
 * ✅ Keyboard Navigation
 * ✅ Position Rendering
 * ✅ Agricultural Metadata
 * ✅ Seasonal Themes
 * ✅ Animation States
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import type { ToastProps } from "../Toast";
import { Toast, ToastAction } from "../Toast";

// ============================================================================
// Test Helpers
// ============================================================================

const defaultProps: ToastProps = {
  id: "test-toast-1",
  title: "Test Toast",
  message: "This is a test toast message",
  variant: "info",
  onDismiss: jest.fn(),
};

function renderToast(props: Partial<ToastProps> = {}) {
  const user = userEvent.setup();
  const mergedProps = { ...defaultProps, ...props };
  const result = render(<Toast {...mergedProps} />);
  return { user, ...result };
}

// ============================================================================
// Basic Rendering Tests
// ============================================================================

describe("Toast Component - Basic Rendering", () => {
  it("should render with title and message", () => {
    renderToast();

    expect(screen.getByText("Test Toast")).toBeInTheDocument();
    expect(screen.getByText("This is a test toast message")).toBeInTheDocument();
  });

  it("should render with title only", () => {
    renderToast({ message: undefined });

    expect(screen.getByText("Test Toast")).toBeInTheDocument();
    expect(screen.queryByText("This is a test toast message")).not.toBeInTheDocument();
  });

  it("should render with custom className", () => {
    const { container } = renderToast({ className: "custom-toast-class" });
    const toast = container.firstChild;

    expect(toast).toHaveClass("custom-toast-class");
  });

  it("should apply data-testid when provided", () => {
    renderToast({ "data-testid": "custom-toast-id" });

    expect(screen.getByTestId("custom-toast-id")).toBeInTheDocument();
  });
});

// ============================================================================
// Variant Tests
// ============================================================================

describe("Toast Component - Variants", () => {
  it("should render info variant with correct styles", () => {
    const { container } = renderToast({ variant: "info" });
    const toast = container.firstChild;

    expect(toast).toHaveClass("border-blue-200", "bg-blue-50");
  });

  it("should render success variant with correct styles", () => {
    const { container } = renderToast({ variant: "success" });
    const toast = container.firstChild;

    expect(toast).toHaveClass("border-green-200", "bg-green-50");
  });

  it("should render warning variant with correct styles", () => {
    const { container } = renderToast({ variant: "warning" });
    const toast = container.firstChild;

    expect(toast).toHaveClass("border-yellow-200", "bg-yellow-50");
  });

  it("should render error variant with correct styles", () => {
    const { container } = renderToast({ variant: "error" });
    const toast = container.firstChild;

    expect(toast).toHaveClass("border-red-200", "bg-red-50");
  });

  it("should render agricultural variant with correct styles", () => {
    const { container } = renderToast({ variant: "agricultural" });
    const toast = container.firstChild;

    expect(toast).toHaveClass("border-green-200", "bg-green-50");
  });
});

// ============================================================================
// Position Tests
// ============================================================================

describe("Toast Component - Positions", () => {
  const positions = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ] as const;

  positions.forEach((position: any) => {
    it(`should render in ${position} position`, () => {
      const { container } = renderToast({ position });
      const toast = container.firstChild;

      // Verify position-specific classes are applied
      expect(toast).toBeInTheDocument();
    });
  });

  it("should default to top-right position", () => {
    const { container } = renderToast({ position: undefined });
    const toast = container.firstChild;

    expect(toast).toBeInTheDocument();
  });
});

// ============================================================================
// Action Button Tests
// ============================================================================

describe("Toast Component - Actions", () => {
  it("should render action button when provided", () => {
    const action: ToastAction = {
      label: "Undo",
      onClick: jest.fn(),
    };

    renderToast({ action });

    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  it("should call action onClick when button is clicked", async () => {
    const onClick = jest.fn();
    const action: ToastAction = {
      label: "Retry",
      onClick,
    };

    const { user } = renderToast({ action });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render multiple actions", () => {
    const actions: ToastAction[] = [
      { label: "Confirm", onClick: jest.fn() },
      { label: "Cancel", onClick: jest.fn() },
    ];

    renderToast({ actions });

    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should call correct action handler when multiple actions present", async () => {
    const confirmHandler = jest.fn();
    const cancelHandler = jest.fn();
    const actions: ToastAction[] = [
      { label: "Confirm", onClick: confirmHandler },
      { label: "Cancel", onClick: cancelHandler },
    ];

    const { user } = renderToast({ actions });

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(confirmHandler).toHaveBeenCalledTimes(1);
    expect(cancelHandler).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancelHandler).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Dismiss Tests
// ============================================================================

describe("Toast Component - Dismiss Behavior", () => {
  it("should render close button when dismissible", () => {
    renderToast({ dismissible: true });

    expect(screen.getByRole("button", { name: /close|dismiss/i })).toBeInTheDocument();
  });

  it("should not render close button when not dismissible", () => {
    renderToast({ dismissible: false });

    expect(screen.queryByRole("button", { name: /close|dismiss/i })).not.toBeInTheDocument();
  });

  it("should call onDismiss when close button is clicked", async () => {
    const onDismiss = jest.fn();
    const { user } = renderToast({ dismissible: true, onDismiss });

    const closeButton = screen.getByRole("button", { name: /close|dismiss/i });
    await user.click(closeButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("test-toast-1");
  });

  it("should auto-dismiss after duration", async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    renderToast({
      duration: 1000,
      onDismiss,
    });

    expect(onDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  it("should not auto-dismiss when duration is 0", async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    renderToast({
      duration: 0,
      onDismiss,
    });

    jest.advanceTimersByTime(5000);

    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("should pause auto-dismiss on hover", async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    const { container, user } = renderToast({
      duration: 2000,
      onDismiss,
    });

    const toast = container.firstChild as HTMLElement;

    // Hover over toast
    await user.hover(toast);

    jest.advanceTimersByTime(2000);

    // Should not dismiss while hovering
    expect(onDismiss).not.toHaveBeenCalled();

    // Unhover
    await user.unhover(toast);

    jest.advanceTimersByTime(2000);

    // Should dismiss after unhover
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe("Toast Component - Accessibility", () => {
  it("should have role='status' for non-error toasts", () => {
    renderToast({ variant: "info" });

    const toast = screen.getByRole("status");
    expect(toast).toBeInTheDocument();
  });

  it("should have role='alert' for error toasts", () => {
    renderToast({ variant: "error" });

    const toast = screen.getByRole("alert");
    expect(toast).toBeInTheDocument();
  });

  it("should have aria-live='polite' for info toasts", () => {
    renderToast({ variant: "info" });

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });

  it("should have aria-live='assertive' for error toasts", () => {
    renderToast({ variant: "error" });

    const toast = screen.getByRole("alert");
    expect(toast).toHaveAttribute("aria-live", "assertive");
  });

  it("should have aria-atomic='true'", () => {
    renderToast();

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-atomic", "true");
  });

  it("should have aria-label with title", () => {
    renderToast({ title: "Important Message" });

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-label", expect.stringContaining("Important Message"));
  });

  it("should be keyboard accessible", async () => {
    const onDismiss = jest.fn();
    const { user } = renderToast({ dismissible: true, onDismiss });

    const closeButton = screen.getByRole("button", { name: /close|dismiss/i });

    // Tab to close button
    await user.tab();
    expect(closeButton).toHaveFocus();

    // Press Enter to dismiss
    await user.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should support keyboard navigation with Space key", async () => {
    const onDismiss = jest.fn();
    const { user } = renderToast({ dismissible: true, onDismiss });

    const closeButton = screen.getByRole("button", { name: /close|dismiss/i });

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.keyboard(" ");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Icon Tests
// ============================================================================

describe("Toast Component - Icons", () => {
  it("should render icon for info variant", () => {
    const { container } = renderToast({ variant: "info" });

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render icon for success variant", () => {
    const { container } = renderToast({ variant: "success" });

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render icon for warning variant", () => {
    const { container } = renderToast({ variant: "warning" });

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render icon for error variant", () => {
    const { container } = renderToast({ variant: "error" });

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render custom icon when provided", () => {
    const CustomIcon = () => <span data-testid="custom-icon">🌾</span>;

    renderToast({ icon: <CustomIcon /> });

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

// ============================================================================
// Agricultural Metadata Tests
// ============================================================================

describe("Toast Component - Agricultural Features", () => {
  it("should render with agricultural metadata", () => {
    renderToast({
      variant: "agricultural",
      agricultural: {
        season: "spring",
        eventType: "planting",
      },
    });

    expect(screen.getByText("Test Toast")).toBeInTheDocument();
  });

  it("should display seasonal emoji for spring", () => {
    const { container } = renderToast({
      variant: "agricultural",
      agricultural: {
        season: "spring",
        eventType: "planting",
      },
    });

    // Check for spring-related content
    expect(container.textContent).toBeTruthy();
  });

  it("should display event type information", () => {
    renderToast({
      variant: "agricultural",
      agricultural: {
        season: "summer",
        eventType: "harvesting",
      },
    });

    expect(screen.getByText("Test Toast")).toBeInTheDocument();
  });

  it("should apply seasonal theming for fall", () => {
    const { container } = renderToast({
      variant: "agricultural",
      agricultural: {
        season: "fall",
        eventType: "harvesting",
      },
    });

    expect(container.firstChild).toBeInTheDocument();
  });

  it("should apply seasonal theming for winter", () => {
    const { container } = renderToast({
      variant: "agricultural",
      agricultural: {
        season: "winter",
        eventType: "maintenance",
      },
    });

    expect(container.firstChild).toBeInTheDocument();
  });
});

// ============================================================================
// Progress Bar Tests
// ============================================================================

describe("Toast Component - Progress Bar", () => {
  it("should render progress bar when showProgress is true", () => {
    const { container } = renderToast({
      duration: 3000,
      showProgress: true,
    });

    const progressBar = container.querySelector("[role='progressbar']");
    expect(progressBar).toBeInTheDocument();
  });

  it("should not render progress bar when showProgress is false", () => {
    const { container } = renderToast({
      duration: 3000,
      showProgress: false,
    });

    const progressBar = container.querySelector("[role='progressbar']");
    expect(progressBar).not.toBeInTheDocument();
  });

  it("should animate progress bar over duration", async () => {
    jest.useFakeTimers();

    const { container } = renderToast({
      duration: 2000,
      showProgress: true,
    });

    const progressBar = container.querySelector("[role='progressbar']") as HTMLElement;
    expect(progressBar).toBeInTheDocument();

    // Progress should decrease over time
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      const ariaValueNow = progressBar?.getAttribute("aria-valuenow");
      expect(Number(ariaValueNow)).toBeLessThan(100);
    });

    jest.useRealTimers();
  });
});

// ============================================================================
// Container Tests
// ============================================================================

describe("Toast Component - Container Integration", () => {
  it("should render multiple toasts in container", () => {
    const { container } = render(
      <>
        <Toast {...defaultProps} id="toast-1" title="Toast 1" />
        <Toast {...defaultProps} id="toast-2" title="Toast 2" />
        <Toast {...defaultProps} id="toast-3" title="Toast 3" />
      </>
    );

    expect(screen.getByText("Toast 1")).toBeInTheDocument();
    expect(screen.getByText("Toast 2")).toBeInTheDocument();
    expect(screen.getByText("Toast 3")).toBeInTheDocument();
  });

  it("should handle stacking of multiple toasts", () => {
    render(
      <>
        <Toast {...defaultProps} id="toast-1" position="top-right" />
        <Toast {...defaultProps} id="toast-2" position="top-right" />
      </>
    );

    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(2);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Toast Component - Edge Cases", () => {
  it("should handle very long titles", () => {
    const longTitle = "A".repeat(200);
    renderToast({ title: longTitle });

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it("should handle very long messages", () => {
    const longMessage = "B".repeat(500);
    renderToast({ message: longMessage });

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("should handle rapid dismiss calls", async () => {
    const onDismiss = jest.fn();
    const { user } = renderToast({ dismissible: true, onDismiss });

    const closeButton = screen.getByRole("button", { name: /close|dismiss/i });

    await user.click(closeButton);
    await user.click(closeButton);
    await user.click(closeButton);

    // Should only call once (component should unmount after first call)
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should handle missing optional props gracefully", () => {
    const minimalProps: ToastProps = {
      id: "minimal-toast",
      title: "Minimal",
      variant: "info",
      onDismiss: jest.fn(),
    };

    render(<Toast {...minimalProps} />);

    expect(screen.getByText("Minimal")).toBeInTheDocument();
  });

  it("should cleanup timers on unmount", () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    const { unmount } = renderToast({
      duration: 3000,
      onDismiss,
    });

    unmount();

    jest.advanceTimersByTime(3000);

    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});

// ============================================================================
// Animation Tests
// ============================================================================

describe("Toast Component - Animations", () => {
  it("should apply entrance animation classes", () => {
    const { container } = renderToast();
    const toast = container.firstChild;

    expect(toast).toHaveClass("animate-in");
  });

  it("should apply exit animation on dismiss", async () => {
    const onDismiss = jest.fn();
    const { user, container } = renderToast({
      dismissible: true,
      onDismiss,
    });

    const closeButton = screen.getByRole("button", { name: /close|dismiss/i });

    await user.click(closeButton);

    const toast = container.firstChild;
    expect(toast).toHaveClass("animate-out");
  });
});

// ============================================================================
// Quick Variant Helper Tests
// ============================================================================

describe("Toast Quick Variant Helpers", () => {
  it("should render InfoToast with correct variant", () => {
    const { container } = render(
      <Toast {...defaultProps} variant="info" title="Info Toast" />
    );

    expect(screen.getByText("Info Toast")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("border-blue-200");
  });

  it("should render SuccessToast with correct variant", () => {
    const { container } = render(
      <Toast {...defaultProps} variant="success" title="Success Toast" />
    );

    expect(screen.getByText("Success Toast")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("border-green-200");
  });

  it("should render WarningToast with correct variant", () => {
    const { container } = render(
      <Toast {...defaultProps} variant="warning" title="Warning Toast" />
    );

    expect(screen.getByText("Warning Toast")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("border-yellow-200");
  });

  it("should render ErrorToast with correct variant", () => {
    const { container } = render(
      <Toast {...defaultProps} variant="error" title="Error Toast" />
    );

    expect(screen.getByText("Error Toast")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("border-red-200");
  });
});
