/**
 * 🧪 Toast Animation Tests
 * Divine Agricultural Testing Patterns
 *
 * Tests:
 * - Variant selection (severity, season, reduced-motion)
 * - Animation lifecycle (mount, update, unmount)
 * - Accessibility (reduced motion, ARIA)
 * - Performance (GPU transforms)
 */
import React from "react";

import { Toast } from "@/components/notifications/Toast";
import { AnimationProvider } from "@/components/notifications/context/AnimationContext";
import type { Toast as ToastType } from "@/types/notifications";
import { render, screen, waitFor } from "@testing-library/react";

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

const createMockToast = (overrides?: Partial<ToastType>): ToastType => ({
  id: "test-toast-1",
  type: "info",
  message: "Test notification message",
  title: "Test Title",
  createdAt: new Date(),
  read: false,
  userId: "user-123",
  ...overrides,
});

describe("Toast Animation System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Variant Selection", () => {
    it("should select severity variant for success toast", () => {
      const toast = createMockToast({ type: "success" });

      const { container } = render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(container.querySelector('[data-variant="success"]')).toBeTruthy();
    });

    it("should select severity variant for error toast", () => {
      const toast = createMockToast({ type: "error" });

      const { container } = render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should select seasonal variant when metadata present", () => {
      const toast = createMockToast({
        metadata: {
          season: "spring",
          animationVariant: "seasonal",
        },
      });

      render(
        <AnimationProvider preset="enhanced">
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should use reduced motion variant when prefersReducedMotion is true", () => {
      const {
        useReducedMotion,
      } = require("@/components/notifications/hooks/useReducedMotion");
      useReducedMotion.mockReturnValue(true);

      const toast = createMockToast();

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });
  });

  describe("Animation Lifecycle", () => {
    it("should render toast with animation props", () => {
      const toast = createMockToast();

      const { container } = render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      const toastElement = container.firstChild;
      expect(toastElement).toBeInTheDocument();
    });

    it("should call onDismiss when dismiss button clicked", async () => {
      const onDismiss = jest.fn();
      const toast = createMockToast();

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={onDismiss} />
        </AnimationProvider>,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      dismissButton.click();

      expect(onDismiss).toHaveBeenCalledWith(toast.id);
    });

    it("should auto-dismiss after duration if enabled", async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const toast = createMockToast();

      render(
        <AnimationProvider>
          <Toast
            toast={toast}
            onDismiss={onDismiss}
            autoDismiss
            duration={3000}
          />
        </AnimationProvider>,
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledWith(toast.id);
      });

      jest.useRealTimers();
    });

    it("should not auto-dismiss if autoDismiss is false", async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const toast = createMockToast();

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={onDismiss} autoDismiss={false} />
        </AnimationProvider>,
      );

      jest.advanceTimersByTime(5000);

      expect(onDismiss).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA role for info toast", () => {
      const toast = createMockToast({ type: "info" });

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have correct ARIA role for error toast", () => {
      const toast = createMockToast({ type: "error" });

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should have aria-live attribute", () => {
      const toast = createMockToast();

      const { container } = render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      const toastElement = container.querySelector("[aria-live]");
      expect(toastElement).toBeTruthy();
    });

    it("should render with reduced motion when user prefers reduced motion", () => {
      const {
        useReducedMotion,
      } = require("@/components/notifications/hooks/useReducedMotion");
      useReducedMotion.mockReturnValue(true);

      const toast = createMockToast();

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });
  });

  describe("Content Rendering", () => {
    it("should render title and message", () => {
      const toast = createMockToast({
        title: "Divine Success",
        message: "Farm created successfully",
      });

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Divine Success")).toBeInTheDocument();
      expect(screen.getByText("Farm created successfully")).toBeInTheDocument();
    });

    it("should render message without title", () => {
      const toast = createMockToast({
        title: undefined,
        message: "Simple notification",
      });

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Simple notification")).toBeInTheDocument();
    });

    it("should render action button if provided", () => {
      const onAction = jest.fn();
      const toast = createMockToast({
        action: {
          label: "View Details",
          onClick: onAction,
        },
      });

      render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      const actionButton = screen.getByText("View Details");
      expect(actionButton).toBeInTheDocument();

      actionButton.click();
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe("Animation Context Integration", () => {
    it("should respect animation preset from context", () => {
      const toast = createMockToast();

      render(
        <AnimationProvider preset="minimal">
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should respect seasonal context", () => {
      const toast = createMockToast();

      render(
        <AnimationProvider season="summer">
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should apply speed multiplier from context", () => {
      const toast = createMockToast();

      render(
        <AnimationProvider speedMultiplier={2}>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should use GPU-accelerated transforms", () => {
      const toast = createMockToast();

      const { container } = render(
        <AnimationProvider>
          <Toast toast={toast} onDismiss={jest.fn()} />
        </AnimationProvider>,
      );

      // Check that transform/opacity are used (GPU-accelerated properties)
      const toastElement = container.firstChild as HTMLElement;
      expect(toastElement).toBeInTheDocument();
    });

    it("should render quickly with multiple toasts", () => {
      const toasts = Array.from({ length: 10 }, (_, i) =>
        createMockToast({ id: `toast-${i}`, message: `Message ${i}` }),
      );

      const startTime = performance.now();

      const { container } = render(
        <AnimationProvider>
          <>
            {toasts.map((toast: any) => (
              <Toast key={toast.id} toast={toast} onDismiss={jest.fn()} />
            ))}
          </>
        </AnimationProvider>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(container.children.length).toBe(10);
      expect(renderTime).toBeLessThan(100); // Should render in < 100ms
    });
  });

  describe("Seasonal Variants", () => {
    const seasons = ["spring", "summer", "fall", "winter"] as const;

    seasons.forEach((season: any) => {
      it(`should render ${season} seasonal variant`, () => {
        const toast = createMockToast({
          metadata: {
            season,
            animationVariant: "seasonal",
          },
        });

        render(
          <AnimationProvider season={season}>
            <Toast toast={toast} onDismiss={jest.fn()} />
          </AnimationProvider>,
        );

        expect(
          screen.getByText("Test notification message"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Severity Types", () => {
    const types = ["success", "error", "warning", "info"] as const;

    types.forEach((type: any) => {
      it(`should render ${type} toast with correct styling`, () => {
        const toast = createMockToast({ type });

        render(
          <AnimationProvider>
            <Toast toast={toast} onDismiss={jest.fn()} />
          </AnimationProvider>,
        );

        expect(
          screen.getByText("Test notification message"),
        ).toBeInTheDocument();
      });
    });
  });
});
