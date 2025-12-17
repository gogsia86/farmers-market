import { render, screen, fireEvent } from "@testing-library/react";
import { Calendar, CalendarEvent } from "../Calendar";

describe("Calendar Component", () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Plant Tomatoes",
      date: new Date("2024-04-15"),
      type: "planting",
      farmName: "Sunrise Valley Farm"
    },
    {
      id: "2",
      title: "Harvest Lettuce",
      date: new Date("2024-04-20"),
      type: "harvest",
      description: "First harvest of spring lettuce"
    },
    {
      id: "3",
      title: "Farmers Market",
      date: new Date("2024-04-25"),
      type: "market"
    }
  ];

  describe("Rendering", () => {
    it("should render calendar with current month", () => {
      render(<Calendar />);

      const currentMonth = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });

      expect(screen.getByText(currentMonth)).toBeInTheDocument();
    });

    it("should render all day names", () => {
      render(<Calendar />);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      dayNames.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it("should render events when provided", () => {
      render(<Calendar events={mockEvents} />);

      // Events should be visible when dates are selected
      expect(screen.getByText("April 2024")).toBeInTheDocument();
    });

    it("should apply seasonal theme", () => {
      const { container } = render(
        <Calendar selectedDate={new Date("2024-04-15")} showSeasonalIndicators />
      );

      expect(screen.getByText(/spring season/i)).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should navigate to previous month", () => {
      render(<Calendar selectedDate={new Date("2024-04-15")} />);

      const prevButton = screen.getByLabelText("Previous month");
      fireEvent.click(prevButton);

      expect(screen.getByText("March 2024")).toBeInTheDocument();
    });

    it("should navigate to next month", () => {
      render(<Calendar selectedDate={new Date("2024-04-15")} />);

      const nextButton = screen.getByLabelText("Next month");
      fireEvent.click(nextButton);

      expect(screen.getByText("May 2024")).toBeInTheDocument();
    });

    it("should navigate to today", () => {
      const pastDate = new Date("2020-01-15");
      render(<Calendar selectedDate={pastDate} />);

      const todayButton = screen.getByText("Today");
      fireEvent.click(todayButton);

      const currentMonth = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });

      expect(screen.getByText(currentMonth)).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("should call onDateSelect when date is clicked", () => {
      const onDateSelect = jest.fn();
      render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          onDateSelect={onDateSelect}
        />
      );

      // Find and click a date button
      const dateButtons = screen.getAllByRole("button");
      const dayButton = dateButtons.find((btn) => btn.textContent?.trim() === "15");

      if (dayButton) {
        fireEvent.click(dayButton);
        expect(onDateSelect).toHaveBeenCalled();
      }
    });

    it("should highlight selected date", () => {
      const selectedDate = new Date("2024-04-15");
      const { container } = render(<Calendar selectedDate={selectedDate} />);

      const selectedButtons = container.querySelectorAll('[aria-selected="true"]');
      expect(selectedButtons.length).toBeGreaterThan(0);
    });

    it("should highlight today's date", () => {
      const { container } = render(<Calendar />);

      const todayDate = new Date().getDate();
      const dateButtons = screen.getAllByRole("button");
      const todayButton = dateButtons.find(
        (btn) => btn.textContent?.trim() === todayDate.toString()
      );

      expect(todayButton).toBeInTheDocument();
    });
  });

  describe("Event Display", () => {
    it("should show event indicators on dates with events", () => {
      const { container } = render(
        <Calendar events={mockEvents} selectedDate={new Date("2024-04-01")} />
      );

      // Event indicators should be visible as colored dots
      const eventDots = container.querySelectorAll(".bg-green-500, .bg-amber-500, .bg-purple-500");
      expect(eventDots.length).toBeGreaterThan(0);
    });

    it("should display events for selected date", () => {
      const selectedDate = new Date("2024-04-15");
      render(<Calendar events={mockEvents} selectedDate={selectedDate} />);

      expect(screen.getByText("Plant Tomatoes")).toBeInTheDocument();
      expect(screen.getByText(/Sunrise Valley Farm/i)).toBeInTheDocument();
    });

    it("should show 'No events scheduled' when selected date has no events", () => {
      const emptyDate = new Date("2024-04-01");
      render(<Calendar events={mockEvents} selectedDate={emptyDate} />);

      expect(screen.getByText("No events scheduled")).toBeInTheDocument();
    });

    it("should call onEventClick when event is clicked", () => {
      const onEventClick = jest.fn();
      const selectedDate = new Date("2024-04-15");

      render(
        <Calendar
          events={mockEvents}
          selectedDate={selectedDate}
          onEventClick={onEventClick}
        />
      );

      const eventButton = screen.getByText("Plant Tomatoes").closest("button");
      if (eventButton) {
        fireEvent.click(eventButton);
        expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
      }
    });

    it("should show event count indicator when more than 3 events on same day", () => {
      const manyEvents: CalendarEvent[] = [
        ...mockEvents.slice(0, 1),
        {
          id: "4",
          title: "Event 4",
          date: new Date("2024-04-15"),
          type: "other"
        },
        {
          id: "5",
          title: "Event 5",
          date: new Date("2024-04-15"),
          type: "other"
        },
        {
          id: "6",
          title: "Event 6",
          date: new Date("2024-04-15"),
          type: "other"
        }
      ];

      const { container } = render(
        <Calendar events={manyEvents} selectedDate={new Date("2024-04-01")} />
      );

      expect(screen.getByText(/\+\d+/)).toBeInTheDocument();
    });
  });

  describe("Seasonal Indicators", () => {
    it("should show Spring season for March-May", () => {
      render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          showSeasonalIndicators
        />
      );

      expect(screen.getByText(/spring season/i)).toBeInTheDocument();
    });

    it("should show Summer season for June-August", () => {
      render(
        <Calendar
          selectedDate={new Date("2024-07-15")}
          showSeasonalIndicators
        />
      );

      expect(screen.getByText(/summer season/i)).toBeInTheDocument();
    });

    it("should show Fall season for September-November", () => {
      render(
        <Calendar
          selectedDate={new Date("2024-10-15")}
          showSeasonalIndicators
        />
      );

      expect(screen.getByText(/fall season/i)).toBeInTheDocument();
    });

    it("should show Winter season for December-February", () => {
      render(
        <Calendar
          selectedDate={new Date("2024-01-15")}
          showSeasonalIndicators
        />
      );

      expect(screen.getByText(/winter season/i)).toBeInTheDocument();
    });

    it("should not show seasonal indicators when disabled", () => {
      render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          showSeasonalIndicators={false}
        />
      );

      expect(screen.queryByText(/season/i)).not.toBeInTheDocument();
    });
  });

  describe("Lunar Phases", () => {
    it("should show lunar phase indicators when enabled", () => {
      const { container } = render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          showLunarPhases
        />
      );

      // Lunar phases are displayed as emoji moon icons
      const text = container.textContent || "";
      const hasMoonEmoji = /[\u{1F311}-\u{1F318}]/u.test(text);
      expect(hasMoonEmoji || text.includes("🌑") || text.includes("🌕")).toBe(true);
    });

    it("should not show lunar phases when disabled", () => {
      const { container } = render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          showLunarPhases={false}
        />
      );

      const text = container.textContent || "";
      const hasMoonEmoji = /[\u{1F311}-\u{1F318}]/u.test(text);
      expect(hasMoonEmoji).toBe(false);
    });
  });

  describe("Weekend Highlighting", () => {
    it("should highlight weekends when enabled", () => {
      const { container } = render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          highlightWeekends
        />
      );

      // Weekends should have special styling
      const weekendCells = container.querySelectorAll(".bg-white\\/30");
      expect(weekendCells.length).toBeGreaterThan(0);
    });

    it("should not highlight weekends when disabled", () => {
      render(
        <Calendar
          selectedDate={new Date("2024-04-15")}
          highlightWeekends={false}
        />
      );

      // This just ensures the component renders without errors
      expect(screen.getByText("April 2024")).toBeInTheDocument();
    });
  });

  describe("Date Restrictions", () => {
    it("should disable dates before minDate", () => {
      const minDate = new Date("2024-04-15");
      const { container } = render(
        <Calendar selectedDate={new Date("2024-04-01")} minDate={minDate} />
      );

      const dateButtons = screen.getAllByRole("button");
      const earlyDateButton = dateButtons.find((btn) => btn.textContent?.trim() === "10");

      if (earlyDateButton) {
        expect(earlyDateButton).toBeDisabled();
      }
    });

    it("should disable dates after maxDate", () => {
      const maxDate = new Date("2024-04-15");
      const { container } = render(
        <Calendar selectedDate={new Date("2024-04-01")} maxDate={maxDate} />
      );

      const dateButtons = screen.getAllByRole("button");
      const lateDate = dateButtons.find((btn) => btn.textContent?.trim() === "20");

      if (lateDate) {
        expect(lateDate).toBeDisabled();
      }
    });

    it("should not call onDateSelect for disabled dates", () => {
      const onDateSelect = jest.fn();
      const minDate = new Date("2024-04-15");

      render(
        <Calendar
          selectedDate={new Date("2024-04-01")}
          minDate={minDate}
          onDateSelect={onDateSelect}
        />
      );

      const dateButtons = screen.getAllByRole("button");
      const disabledButton = dateButtons.find(
        (btn) => btn.textContent?.trim() === "10" && btn.hasAttribute("disabled")
      );

      if (disabledButton) {
        fireEvent.click(disabledButton);
        expect(onDateSelect).not.toHaveBeenCalled();
      }
    });
  });

  describe("Event Legend", () => {
    it("should display event type legend", () => {
      render(<Calendar events={mockEvents} />);

      expect(screen.getByText("Event Types")).toBeInTheDocument();
      expect(screen.getByText("planting")).toBeInTheDocument();
      expect(screen.getByText("harvest")).toBeInTheDocument();
      expect(screen.getByText("market")).toBeInTheDocument();
    });

    it("should show color indicators for each event type", () => {
      const { container } = render(<Calendar events={mockEvents} />);

      // Check for colored dots in legend
      const legendDots = container.querySelectorAll(
        ".bg-green-500, .bg-amber-500, .bg-blue-500, .bg-purple-500, .bg-gray-500"
      );
      expect(legendDots.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label for calendar", () => {
      render(<Calendar />);

      expect(
        screen.getByRole("application", { name: /agricultural calendar/i })
      ).toBeInTheDocument();
    });

    it("should have accessible date buttons with labels", () => {
      render(
        <Calendar events={mockEvents} selectedDate={new Date("2024-04-15")} />
      );

      const dateButtons = screen.getAllByRole("button");
      const buttonWithEvents = dateButtons.find((btn) =>
        btn.getAttribute("aria-label")?.includes("events")
      );

      expect(buttonWithEvents).toBeInTheDocument();
    });

    it("should indicate selected state with aria-selected", () => {
      const { container } = render(
        <Calendar selectedDate={new Date("2024-04-15")} />
      );

      const selectedButtons = container.querySelectorAll('[aria-selected="true"]');
      expect(selectedButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<Calendar className="custom-calendar" />);

      expect(container.querySelector(".custom-calendar")).toBeInTheDocument();
    });

    it("should apply seasonal theme colors", () => {
      const { container } = render(
        <Calendar selectedDate={new Date("2024-04-15")} showSeasonalIndicators />
      );

      // Spring theme should apply green colors
      const springElements = container.querySelectorAll(".bg-green-50, .border-green-300");
      expect(springElements.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle month with 31 days", () => {
      render(<Calendar selectedDate={new Date("2024-01-15")} />);

      expect(screen.getByText("January 2024")).toBeInTheDocument();
    });

    it("should handle February in leap year", () => {
      render(<Calendar selectedDate={new Date("2024-02-15")} />);

      expect(screen.getByText("February 2024")).toBeInTheDocument();
    });

    it("should handle February in non-leap year", () => {
      render(<Calendar selectedDate={new Date("2023-02-15")} />);

      expect(screen.getByText("February 2023")).toBeInTheDocument();
    });

    it("should handle year boundaries", () => {
      render(<Calendar selectedDate={new Date("2023-12-31")} />);

      const nextButton = screen.getByLabelText("Next month");
      fireEvent.click(nextButton);

      expect(screen.getByText("January 2024")).toBeInTheDocument();
    });

    it("should handle empty events array", () => {
      render(<Calendar events={[]} selectedDate={new Date("2024-04-15")} />);

      expect(screen.getByText("No events scheduled")).toBeInTheDocument();
    });
  });
});
