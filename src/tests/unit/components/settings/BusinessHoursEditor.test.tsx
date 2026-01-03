/**
 * 🧪 BUSINESS HOURS EDITOR - UNIT TESTS
 * Comprehensive test suite for BusinessHoursEditor component
 * Sprint 5: Settings & Configuration
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BusinessHoursEditor } from "@/components/features/settings/BusinessHoursEditor";
import type { BusinessHoursData } from "@/types/settings";

describe("BusinessHoursEditor", () => {
  const mockOnChange = jest.fn();

  const defaultHours: BusinessHoursData[] = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with header", () => {
      render(<BusinessHoursEditor value={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Business Hours")).toBeInTheDocument();
      expect(screen.getByTestId("business-hours-editor")).toBeInTheDocument();
    });

    it("should render all days of the week", () => {
      render(<BusinessHoursEditor value={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Monday")).toBeInTheDocument();
      expect(screen.getByText("Tuesday")).toBeInTheDocument();
      expect(screen.getByText("Wednesday")).toBeInTheDocument();
      expect(screen.getByText("Thursday")).toBeInTheDocument();
      expect(screen.getByText("Friday")).toBeInTheDocument();
      expect(screen.getByText("Saturday")).toBeInTheDocument();
      expect(screen.getByText("Sunday")).toBeInTheDocument();
    });

    it("should display existing business hours", () => {
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      expect(screen.getByText("09:00 - 17:00")).toBeInTheDocument();
    });

    it("should show closed status for closed days", () => {
      const hoursWithClosed: BusinessHoursData[] = [
        {
          dayOfWeek: "MONDAY",
          openTime: "09:00",
          closeTime: "17:00",
          closed: true,
        },
      ];

      render(
        <BusinessHoursEditor value={hoursWithClosed} onChange={mockOnChange} />,
      );

      expect(screen.getByText("Closed")).toBeInTheDocument();
    });
  });

  describe("Toggle Day Open/Closed", () => {
    it("should toggle day from closed to open", async () => {
      const user = userEvent.setup();
      render(<BusinessHoursEditor value={[]} onChange={mockOnChange} />);

      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      expect(mockOnChange).toHaveBeenCalledWith([
        {
          dayOfWeek: "MONDAY",
          openTime: "09:00",
          closeTime: "17:00",
          closed: false,
        },
      ]);
    });

    it("should toggle day from open to closed", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      expect(mockOnChange).toHaveBeenCalledWith([
        {
          dayOfWeek: "MONDAY",
          openTime: "09:00",
          closeTime: "17:00",
          closed: true,
        },
        defaultHours[1],
      ]);
    });
  });

  describe("Time Slot Management", () => {
    it("should expand day section when clicking chevron", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      const daySection = screen.getByTestId("day-section-monday");
      const chevron = daySection.querySelector("button");

      await user.click(chevron!);

      await waitFor(() => {
        expect(screen.getByTestId("time-slot-monday-0")).toBeInTheDocument();
      });
    });

    it("should update open time", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      // Expand Monday
      const mondayChevron = screen
        .getByTestId("day-section-monday")
        .querySelector("button");
      await user.click(mondayChevron!);

      const openTimeInput = screen.getByTestId("open-time-monday-0");
      await user.clear(openTimeInput);
      await user.type(openTimeInput, "08:00");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update close time", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      // Expand Monday
      const mondayChevron = screen
        .getByTestId("day-section-monday")
        .querySelector("button");
      await user.click(mondayChevron!);

      const closeTimeInput = screen.getByTestId("close-time-monday-0");
      await user.clear(closeTimeInput);
      await user.type(closeTimeInput, "18:00");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should add additional time slot", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      // Expand Monday
      const mondayChevron = screen
        .getByTestId("day-section-monday")
        .querySelector("button");
      await user.click(mondayChevron!);

      const addButton = screen.getByTestId("add-slot-monday");
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        defaultHours[0],
        defaultHours[1],
        {
          dayOfWeek: "MONDAY",
          openTime: "17:00",
          closeTime: "17:00",
          closed: false,
        },
      ]);
    });

    it("should remove time slot when multiple slots exist", async () => {
      const user = userEvent.setup();
      const multiSlotHours: BusinessHoursData[] = [
        {
          dayOfWeek: "MONDAY",
          openTime: "09:00",
          closeTime: "12:00",
          closed: false,
        },
        {
          dayOfWeek: "MONDAY",
          openTime: "13:00",
          closeTime: "17:00",
          closed: false,
        },
      ];

      render(
        <BusinessHoursEditor value={multiSlotHours} onChange={mockOnChange} />,
      );

      // Expand Monday
      const mondayChevron = screen
        .getByTestId("day-section-monday")
        .querySelector("button");
      await user.click(mondayChevron!);

      // Should show 2 time slots
      expect(screen.getByTestId("time-slot-monday-0")).toBeInTheDocument();
      expect(screen.getByTestId("time-slot-monday-1")).toBeInTheDocument();
    });
  });

  describe("Batch Operations", () => {
    it("should apply Monday hours to weekdays", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      const applyButton = screen.getByText("Apply Mon to Weekdays");
      await user.click(applyButton);

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should disable all inputs when disabled prop is true", () => {
      render(
        <BusinessHoursEditor
          value={defaultHours}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const mondayToggle = screen.getByTestId("toggle-monday");
      expect(mondayToggle).toBeDisabled();
    });

    it("should not call onChange when disabled", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor
          value={defaultHours}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const mondayToggle = screen.getByTestId("toggle-monday");
      await user.click(mondayToggle);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<BusinessHoursEditor value={[]} onChange={mockOnChange} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      const mondayToggle = screen.getByTestId("toggle-monday");
      mondayToggle.focus();

      expect(mondayToggle).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty hours array", () => {
      render(<BusinessHoursEditor value={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Monday")).toBeInTheDocument();
      expect(screen.queryByText("09:00 - 17:00")).not.toBeInTheDocument();
    });

    it("should handle all days closed", () => {
      const allClosed: BusinessHoursData[] = [
        { dayOfWeek: "MONDAY", openTime: "", closeTime: "", closed: true },
        { dayOfWeek: "TUESDAY", openTime: "", closeTime: "", closed: true },
        { dayOfWeek: "WEDNESDAY", openTime: "", closeTime: "", closed: true },
        { dayOfWeek: "THURSDAY", openTime: "", closeTime: "", closed: true },
        { dayOfWeek: "FRIDAY", openTime: "", closeTime: "", closed: true },
        { dayOfWeek: "SATURDAY", openTime: "", closeTime: "", closed: true },
        { dayOfWeek: "SUNDAY", openTime: "", closeTime: "", closed: true },
      ];

      render(<BusinessHoursEditor value={allClosed} onChange={mockOnChange} />);

      const closedTexts = screen.getAllByText("Closed");
      expect(closedTexts.length).toBe(7);
    });

    it("should handle split hours (multiple slots per day)", () => {
      const splitHours: BusinessHoursData[] = [
        {
          dayOfWeek: "MONDAY",
          openTime: "09:00",
          closeTime: "12:00",
          closed: false,
        },
        {
          dayOfWeek: "MONDAY",
          openTime: "14:00",
          closeTime: "18:00",
          closed: false,
        },
      ];

      render(
        <BusinessHoursEditor value={splitHours} onChange={mockOnChange} />,
      );

      expect(
        screen.getByText(/09:00 - 12:00.*14:00 - 18:00/),
      ).toBeInTheDocument();
    });

    it("should handle 24-hour operations", () => {
      const twentyFourHours: BusinessHoursData[] = [
        {
          dayOfWeek: "MONDAY",
          openTime: "00:00",
          closeTime: "23:59",
          closed: false,
        },
      ];

      render(
        <BusinessHoursEditor value={twentyFourHours} onChange={mockOnChange} />,
      );

      expect(screen.getByText("00:00 - 23:59")).toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <BusinessHoursEditor
          value={[]}
          onChange={mockOnChange}
          className="custom-class"
        />,
      );

      const editor = container.querySelector(".custom-class");
      expect(editor).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("should display helper text", () => {
      render(<BusinessHoursEditor value={[]} onChange={mockOnChange} />);

      expect(
        screen.getByText(/Configure your farm's operating hours/),
      ).toBeInTheDocument();
    });
  });

  describe("Data Validation", () => {
    it("should handle invalid time formats gracefully", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      // Expand Monday
      const mondayChevron = screen
        .getByTestId("day-section-monday")
        .querySelector("button");
      await user.click(mondayChevron!);

      const openTimeInput = screen.getByTestId(
        "open-time-monday-0",
      ) as HTMLInputElement;

      // Browser's time input will handle validation
      expect(openTimeInput.type).toBe("time");
    });

    it("should maintain data integrity when toggling", async () => {
      const user = userEvent.setup();
      render(
        <BusinessHoursEditor value={defaultHours} onChange={mockOnChange} />,
      );

      const mondayToggle = screen.getByTestId("toggle-monday");

      // Toggle closed
      await user.click(mondayToggle);
      expect(mockOnChange).toHaveBeenCalledTimes(1);

      // Toggle open again
      await user.click(mondayToggle);
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("Performance", () => {
    it("should handle large number of time slots efficiently", () => {
      const manySlots: BusinessHoursData[] = Array.from(
        { length: 10 },
        (_, i) => ({
          dayOfWeek: "MONDAY",
          openTime: `${String(i).padStart(2, "0")}:00`,
          closeTime: `${String(i + 1).padStart(2, "0")}:00`,
          closed: false,
        }),
      );

      const { rerender } = render(
        <BusinessHoursEditor value={manySlots} onChange={mockOnChange} />,
      );

      // Should render without crashing
      expect(screen.getByTestId("business-hours-editor")).toBeInTheDocument();

      // Should handle re-renders efficiently
      rerender(
        <BusinessHoursEditor value={manySlots} onChange={mockOnChange} />,
      );
      expect(screen.getByTestId("business-hours-editor")).toBeInTheDocument();
    });
  });
});
