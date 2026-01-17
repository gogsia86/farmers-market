/**
 * @jest-environment jsdom
 */


/**
 * 🧪 FARMER SETTINGS - INTEGRATION TESTS
 * End-to-end integration test suite for complete farmer settings workflow
 * Sprint 5: Settings & Configuration
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FarmSettingsClient } from "@/components/features/settings/FarmSettingsClient";
import type { FarmSettingsData } from "@/types/settings";

// Mock fetch for API calls
global.fetch = jest.fn();

describe("Farmer Settings Integration", () => {
  const mockFarmSettings: FarmSettingsData = {
    businessHours: [
      {
        dayOfWeek: "MONDAY",
        openTime: "09:00",
        closeTime: "17:00",
        closed: false,
      },
      {
        dayOfWeek: "TUESDAY",
        openTime: "09:00",
        closeTime: "17:00",
        closed: false,
      },
    ],
    deliveryAreas: [
      {
        name: "Downtown",
        postalCodes: ["12345"],
        radius: 10,
        deliveryFee: 5.0,
      },
    ],
    deliveryFee: 5.0,
    minOrderValue: 25.0,
    acceptedPaymentMethods: ["CARD", "CASH"],
    requireDepositOnOrders: false,
    depositPercentage: 25,
    policies: {
      cancellationPolicy: "Cancel within 24 hours for full refund",
      returnPolicy: "Returns accepted within 7 days",
      termsAndConditions: "By ordering, you agree to our terms",
    },
    features: {
      enablePreOrders: true,
      enableSubscriptions: false,
      enableGiftCards: false,
    },
  };

  const farmLocation = {
    lat: 40.7128,
    lng: -74.006,
    address: "123 Farm Road, City, State 12345",
  };

  const farmId = "farm_123";

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockFarmSettings }),
    });
  });

  describe("Complete Settings Workflow", () => {
    it("should render all settings tabs", () => {
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      expect(screen.getByTestId("tab-hours")).toBeInTheDocument();
      expect(screen.getByTestId("tab-delivery")).toBeInTheDocument();
      expect(screen.getByTestId("tab-payment")).toBeInTheDocument();
      expect(screen.getByTestId("tab-policies")).toBeInTheDocument();
      expect(screen.getByTestId("tab-features")).toBeInTheDocument();
    });

    it("should navigate between tabs", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Click on delivery tab
      const deliveryTab = screen.getByTestId("tab-delivery");
      await user.click(deliveryTab);

      // Should show delivery content
      await waitFor(() => {
        expect(screen.getByText("Delivery Zones")).toBeInTheDocument();
      });

      // Click on payment tab
      const paymentTab = screen.getByTestId("tab-payment");
      await user.click(paymentTab);

      // Should show payment content
      await waitFor(() => {
        expect(screen.getByText("Payment Methods")).toBeInTheDocument();
      });
    });

    it("should detect changes in business hours", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Toggle Monday closed
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Should show unsaved changes indicator
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });

      // Save button should be enabled
      const saveButton = screen.getByTestId("save-button");
      expect(saveButton).not.toBeDisabled();
    });

    it("should save business hours changes", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Toggle Monday closed
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Click save
      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      // Should call API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/settings/farm/${farmId}`,
          expect.objectContaining({
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByTestId("save-success-message")).toBeInTheDocument();
      });
    });

    it("should add a new delivery zone", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to delivery tab
      const deliveryTab = screen.getByTestId("tab-delivery");
      await user.click(deliveryTab);

      // Click add zone
      const addZoneButton = screen.getByTestId("add-zone-button");
      await user.click(addZoneButton);

      // Fill in zone details
      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "Suburbs");

      const radiusInput = screen.getByTestId("new-zone-radius");
      await user.clear(radiusInput);
      await user.type(radiusInput, "15");

      const feeInput = screen.getByTestId("new-zone-fee");
      await user.clear(feeInput);
      await user.type(feeInput, "7.50");

      // Save zone
      const saveZoneButton = screen.getByTestId("save-new-zone");
      await user.click(saveZoneButton);

      // Should show unsaved changes
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });
    });

    it("should toggle payment methods", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to payment tab
      const paymentTab = screen.getByTestId("tab-payment");
      await user.click(paymentTab);

      // Toggle Venmo payment method
      const venmoMethod = screen.getByTestId("payment-method-venmo");
      await user.click(venmoMethod);

      // Should show unsaved changes
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });
    });

    it("should configure deposit settings", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to payment tab
      const paymentTab = screen.getByTestId("tab-payment");
      await user.click(paymentTab);

      // Enable deposit requirement
      const depositCheckbox = screen.getByTestId("require-deposit-checkbox");
      await user.click(depositCheckbox);

      // Adjust deposit percentage
      const depositSlider = screen.getByTestId("deposit-percentage-slider");
      fireEvent.change(depositSlider, { target: { value: "50" } });

      // Should show unsaved changes
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });
    });

    it("should update farm policies", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to policies tab
      const policiesTab = screen.getByTestId("tab-policies");
      await user.click(policiesTab);

      // Update cancellation policy
      const cancellationTextarea = screen.getByTestId(
        "cancellation-policy-textarea",
      );
      await user.clear(cancellationTextarea);
      await user.type(cancellationTextarea, "New cancellation policy");

      // Should show unsaved changes
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });
    });

    it("should toggle farm features", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to features tab
      const featuresTab = screen.getByTestId("tab-features");
      await user.click(featuresTab);

      // Toggle subscriptions
      const subscriptionsCheckbox = screen.getByTestId(
        "enable-subscriptions-checkbox",
      );
      await user.click(subscriptionsCheckbox);

      // Should show unsaved changes
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });
    });

    it("should reset all changes", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Make a change
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Should show unsaved changes
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-indicator"),
        ).toBeInTheDocument();
      });

      // Click reset
      const resetButton = screen.getByTestId("reset-button");
      await user.click(resetButton);

      // Unsaved changes indicator should disappear
      await waitFor(() => {
        expect(
          screen.queryByTestId("unsaved-changes-indicator"),
        ).not.toBeInTheDocument();
      });
    });

    it("should handle save errors gracefully", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Make a change
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Click save
      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId("save-error-message")).toBeInTheDocument();
      });
    });

    it("should complete full settings update workflow", async () => {
      const user = userEvent.setup();
      const mockOnSaveSuccess = jest.fn();

      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
          onSaveSuccess={mockOnSaveSuccess}
        />,
      );

      // 1. Update business hours
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // 2. Switch to delivery tab and add zone
      const deliveryTab = screen.getByTestId("tab-delivery");
      await user.click(deliveryTab);

      const addZoneButton = screen.getByTestId("add-zone-button");
      await user.click(addZoneButton);

      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "New Zone");

      const saveZoneButton = screen.getByTestId("save-new-zone");
      await user.click(saveZoneButton);

      // 3. Switch to payment tab and toggle method
      const paymentTab = screen.getByTestId("tab-payment");
      await user.click(paymentTab);

      const checkMethod = screen.getByTestId("payment-method-check");
      await user.click(checkMethod);

      // 4. Save all changes
      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      // Should call API with all updates
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/settings/farm/${farmId}`,
          expect.objectContaining({
            method: "PATCH",
            body: expect.any(String),
          }),
        );
      });

      // Should call success callback
      await waitFor(() => {
        expect(mockOnSaveSuccess).toHaveBeenCalled();
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByTestId("save-success-message")).toBeInTheDocument();
      });
    });
  });

  describe("Data Persistence", () => {
    it("should persist business hours across tab changes", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Toggle Monday closed
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Switch to delivery tab
      const deliveryTab = screen.getByTestId("tab-delivery");
      await user.click(deliveryTab);

      // Switch back to hours tab
      const hoursTab = screen.getByTestId("tab-hours");
      await user.click(hoursTab);

      // Monday should still be toggled closed
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });

    it("should persist all changes until save", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Make changes in hours tab
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Switch to payment tab and make changes
      const paymentTab = screen.getByTestId("tab-payment");
      await user.click(paymentTab);

      const depositCheckbox = screen.getByTestId("require-deposit-checkbox");
      await user.click(depositCheckbox);

      // Should show unsaved changes
      expect(
        screen.getByTestId("unsaved-changes-indicator"),
      ).toBeInTheDocument();

      // Save should include all changes
      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/settings/farm/${farmId}`,
          expect.objectContaining({
            method: "PATCH",
          }),
        );
      });
    });
  });

  describe("Validation", () => {
    it("should validate minimum order value", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to delivery tab
      const deliveryTab = screen.getByTestId("tab-delivery");
      await user.click(deliveryTab);

      // Enter invalid minimum order value
      const minOrderInput = screen.getByTestId("min-order-value-input");
      await user.clear(minOrderInput);
      await user.type(minOrderInput, "-10");

      // Browser validation should handle this
      expect(minOrderInput).toHaveAttribute("min", "0");
    });

    it("should prevent saving without accepted payment methods", async () => {
      const user = userEvent.setup();
      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Switch to payment tab
      const paymentTab = screen.getByTestId("tab-payment");
      await user.click(paymentTab);

      // Uncheck all payment methods
      const cardMethod = screen.getByTestId("payment-method-card");
      await user.click(cardMethod);

      const cashMethod = screen.getByTestId("payment-method-cash");
      await user.click(cashMethod);

      // Should show warning
      await waitFor(() => {
        expect(
          screen.getByText(/must accept at least one payment method/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state while saving", async () => {
      const user = userEvent.setup();
      let resolveFetch: any;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

      render(
        <FarmSettingsClient
          settings={mockFarmSettings}
          farmId={farmId}
          farmLocation={farmLocation}
        />,
      );

      // Make a change
      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      // Click save
      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      // Should show loading state
      expect(saveButton).toHaveTextContent("Saving...");
      expect(saveButton).toBeDisabled();

      // Resolve fetch
      resolveFetch({
        ok: true,
        json: async () => ({ success: true, data: mockFarmSettings }),
      });

      // Should return to normal state
      await waitFor(() => {
        expect(saveButton).toHaveTextContent("Save Settings");
        expect(saveButton).toBeDisabled(); // Still disabled because no new changes
      });
    });
  });
});
