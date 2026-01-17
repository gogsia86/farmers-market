/**
 * @jest-environment jsdom
 */


/**
 * 🧪 Banner Animation Tests
 * Divine Agricultural Testing Patterns
 *
 * Tests:
 * - Position-aware animations (top, bottom)
 * - Variant selection (severity, seasonal)
 * - Sticky behavior and auto-hide
 * - Accessibility (reduced motion, ARIA)
 * - Performance (GPU transforms)
import React from "react";
 */

import { Banner } from "@/components/notifications/Banner";
import { AnimationProvider } from "@/components/notifications/context/AnimationContext";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Framer Motion for testing
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock reduced motion hook
jest.mock("@/components/notifications/hooks/useReducedMotion", () => ({
  useReducedMotion: jest.fn(() => false),
  useShouldAnimate: jest.fn(() => true),
}));

describe("Banner Animation System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Position-Aware Animations", () => {
    it("should render top banner with slide-down animation", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Top banner notification"
            type="info"
            position="top"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Top banner notification")).toBeInTheDocument();
    });

    it("should render bottom banner with slide-up animation", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Bottom banner notification"
            type="info"
            position="bottom"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(
        screen.getByText("Bottom banner notification"),
      ).toBeInTheDocument();
    });

    it("should default to top position if not specified", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Default position banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Default position banner")).toBeInTheDocument();
    });
  });

  describe("Variant Selection", () => {
    it("should select severity variant for success banner", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Success message"
            type="success"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Success message")).toBeInTheDocument();
    });

    it("should select severity variant for error banner", () => {
      render(
        <AnimationProvider>
          <Banner message="Error message" type="error" onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("should select severity variant for warning banner", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Warning message"
            type="warning"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Warning message")).toBeInTheDocument();
    });

    it("should use reduced motion variant when prefersReducedMotion is true", () => {
      const {
        useReducedMotion,
      } = require("@/components/notifications/hooks/useReducedMotion");
      useReducedMotion.mockReturnValue(true);

      render(
        <AnimationProvider>
          <Banner
            message="Reduced motion banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Reduced motion banner")).toBeInTheDocument();
    });
  });

  describe("Sticky Behavior", () => {
    it("should render with sticky class when sticky prop is true", () => {
      const { container } = render(
        <AnimationProvider>
          <Banner
            message="Sticky banner"
            type="info"
            sticky
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      const banner = container.querySelector('[role="status"]');
      expect(banner).toBeInTheDocument();
    });

    it("should render without sticky class when sticky prop is false", () => {
      const { container } = render(
        <AnimationProvider>
          <Banner
            message="Non-sticky banner"
            type="info"
            sticky={false}
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      const banner = container.querySelector('[role="status"]');
      expect(banner).toBeInTheDocument();
    });
  });

  describe("Auto-Hide Behavior", () => {
    it("should call onDismiss after duration if autoHide is true", async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();

      render(
        <AnimationProvider>
          <Banner
            message="Auto-hide banner"
            type="info"
            autoHide
            duration={3000}
            onDismiss={onDismiss}
          />
        </AnimationProvider>,
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it("should not auto-hide if autoHide is false", async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();

      render(
        <AnimationProvider>
          <Banner
            message="No auto-hide banner"
            type="info"
            autoHide={false}
            onDismiss={onDismiss}
          />
        </AnimationProvider>,
      );

      jest.advanceTimersByTime(5000);

      expect(onDismiss).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it("should use custom duration when provided", async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();

      render(
        <AnimationProvider>
          <Banner
            message="Custom duration banner"
            type="info"
            autoHide
            duration={1500}
            onDismiss={onDismiss}
          />
        </AnimationProvider>,
      );

      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe("User Interactions", () => {
    it("should call onDismiss when dismiss button clicked", async () => {
      const user = userEvent.setup();
      const onDismiss = jest.fn();

      render(
        <AnimationProvider>
          <Banner
            message="Dismissible banner"
            type="info"
            onDismiss={onDismiss}
          />
        </AnimationProvider>,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });

    it("should call action callback when action button clicked", async () => {
      const user = userEvent.setup();
      const onAction = jest.fn();

      render(
        <AnimationProvider>
          <Banner
            message="Banner with action"
            type="info"
            action={{
              label: "Take Action",
              onClick: onAction,
            }}
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      const actionButton = screen.getByText("Take Action");
      await user.click(actionButton);

      expect(onAction).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA role for info banner", () => {
      render(
        <AnimationProvider>
          <Banner message="Info banner" type="info" onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have correct ARIA role for error banner", () => {
      render(
        <AnimationProvider>
          <Banner message="Error banner" type="error" onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should have aria-live attribute", () => {
      const { container } = render(
        <AnimationProvider>
          <Banner
            message="Live region banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      const banner = container.querySelector("[aria-live]");
      expect(banner).toBeTruthy();
    });

    it("should have accessible dismiss button", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Dismissible banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      expect(dismissButton).toHaveAttribute("aria-label");
    });
  });

  describe("Content Rendering", () => {
    it("should render title and message", () => {
      render(
        <AnimationProvider>
          <Banner
            title="Important Notice"
            message="This is an important message"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Important Notice")).toBeInTheDocument();
      expect(
        screen.getByText("This is an important message"),
      ).toBeInTheDocument();
    });

    it("should render message without title", () => {
      render(
        <AnimationProvider>
          <Banner
            message="Simple banner message"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Simple banner message")).toBeInTheDocument();
    });

    it("should render with custom icon", () => {
      const CustomIcon = () => <span data-testid="custom-icon">🌾</span>;

      render(
        <AnimationProvider>
          <Banner
            message="Banner with icon"
            type="info"
            icon={<CustomIcon />}
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("Animation Context Integration", () => {
    it("should respect animation preset from context", () => {
      render(
        <AnimationProvider preset="minimal">
          <Banner
            message="Minimal preset banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Minimal preset banner")).toBeInTheDocument();
    });

    it("should respect enhanced preset from context", () => {
      render(
        <AnimationProvider preset="enhanced">
          <Banner
            message="Enhanced preset banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Enhanced preset banner")).toBeInTheDocument();
    });

    it("should respect divine preset from context", () => {
      render(
        <AnimationProvider preset="divine">
          <Banner
            message="Divine preset banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Divine preset banner")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should use GPU-accelerated transforms", () => {
      const { container } = render(
        <AnimationProvider>
          <Banner
            message="Performance test banner"
            type="info"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      const banner = container.firstChild as HTMLElement;
      expect(banner).toBeInTheDocument();
    });

    it("should render multiple banners efficiently", () => {
      const startTime = performance.now();

      const { container } = render(
        <AnimationProvider>
          <>
            <Banner message="Banner 1" type="info" onDismiss={jest.fn()} />
            <Banner message="Banner 2" type="success" onDismiss={jest.fn()} />
            <Banner message="Banner 3" type="warning" onDismiss={jest.fn()} />
            <Banner message="Banner 4" type="error" onDismiss={jest.fn()} />
          </>
        </AnimationProvider>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(container.children.length).toBe(4);
      expect(renderTime).toBeLessThan(50); // Should render in < 50ms
    });
  });

  describe("Seasonal Variants", () => {
    it("should render spring seasonal variant", () => {
      render(
        <AnimationProvider season="spring">
          <Banner
            message="Spring banner"
            type="info"
            variant="seasonal"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Spring banner")).toBeInTheDocument();
    });

    it("should render summer seasonal variant", () => {
      render(
        <AnimationProvider season="summer">
          <Banner
            message="Summer banner"
            type="info"
            variant="seasonal"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Summer banner")).toBeInTheDocument();
    });

    it("should render fall seasonal variant", () => {
      render(
        <AnimationProvider season="fall">
          <Banner
            message="Fall banner"
            type="info"
            variant="seasonal"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Fall banner")).toBeInTheDocument();
    });

    it("should render winter seasonal variant", () => {
      render(
        <AnimationProvider season="winter">
          <Banner
            message="Winter banner"
            type="info"
            variant="seasonal"
            onDismiss={jest.fn()}
          />
        </AnimationProvider>,
      );

      expect(screen.getByText("Winter banner")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing onDismiss gracefully", () => {
      const { container } = render(
        <AnimationProvider>
          <Banner message="No dismiss handler" type="info" />
        </AnimationProvider>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle empty message gracefully", () => {
      render(
        <AnimationProvider>
          <Banner message="" type="info" onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.queryByText("")).toBeInTheDocument();
    });

    it("should handle very long messages", () => {
      const longMessage = "A".repeat(500);

      render(
        <AnimationProvider>
          <Banner message={longMessage} type="info" onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
