import { render, screen, fireEvent } from "@testing-library/react";
import { Timeline, OrderTimeline, TimelineEvent } from "../Timeline";

describe("Timeline Component", () => {
  const mockEvents: TimelineEvent[] = [
    {
      id: "1",
      title: "Order Placed",
      description: "Your order has been received",
      timestamp: new Date("2024-01-15T10:00:00"),
      status: "completed"
    },
    {
      id: "2",
      title: "Processing",
      description: "Preparing your items",
      timestamp: new Date("2024-01-15T12:00:00"),
      status: "processing"
    },
    {
      id: "3",
      title: "Shipped",
      timestamp: new Date("2024-01-15T15:00:00"),
      status: "pending"
    }
  ];

  describe("Rendering", () => {
    it("should render timeline with all events", () => {
      render(<Timeline events={mockEvents} />);

      expect(screen.getByText("Order Placed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Shipped")).toBeInTheDocument();
    });

    it("should render event descriptions when provided", () => {
      render(<Timeline events={mockEvents} />);

      expect(screen.getByText("Your order has been received")).toBeInTheDocument();
      expect(screen.getByText("Preparing your items")).toBeInTheDocument();
    });

    it("should render empty state when no events provided", () => {
      render(<Timeline events={[]} />);

      expect(screen.getByText("No timeline events to display")).toBeInTheDocument();
    });

    it("should apply agricultural theme when enabled", () => {
      const { container } = render(
        <Timeline events={mockEvents} agriculturalTheme />
      );

      expect(container.querySelector(".agricultural-timeline")).toBeInTheDocument();
    });
  });

  describe("Orientation", () => {
    it("should render vertical timeline by default", () => {
      const { container } = render(<Timeline events={mockEvents} />);

      expect(container.querySelector(".space-y-4")).toBeInTheDocument();
    });

    it("should render horizontal timeline when specified", () => {
      const { container } = render(
        <Timeline events={mockEvents} orientation="horizontal" />
      );

      expect(container.querySelector(".flex.items-start.space-x-8")).toBeInTheDocument();
    });
  });

  describe("Status Indicators", () => {
    it("should display correct status colors for completed events", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const completedNode = container.querySelector(".bg-green-100");

      expect(completedNode).toBeInTheDocument();
    });

    it("should display correct status colors for processing events", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const processingNode = container.querySelector(".bg-blue-100");

      expect(processingNode).toBeInTheDocument();
    });

    it("should display correct status colors for pending events", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const pendingNode = container.querySelector(".bg-yellow-100");

      expect(pendingNode).toBeInTheDocument();
    });

    it("should handle failed status", () => {
      const failedEvent: TimelineEvent = {
        id: "failed",
        title: "Failed",
        timestamp: new Date(),
        status: "failed"
      };

      const { container } = render(<Timeline events={[failedEvent]} />);
      const failedNode = container.querySelector(".bg-red-100");

      expect(failedNode).toBeInTheDocument();
    });

    it("should handle cancelled status", () => {
      const cancelledEvent: TimelineEvent = {
        id: "cancelled",
        title: "Cancelled",
        timestamp: new Date(),
        status: "cancelled"
      };

      const { container } = render(<Timeline events={[cancelledEvent]} />);
      const cancelledNode = container.querySelector(".bg-gray-100");

      expect(cancelledNode).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("should highlight active event when activeIndex is provided", () => {
      const { container } = render(
        <Timeline events={mockEvents} activeIndex={1} />
      );

      const activeElements = container.querySelectorAll(".scale-105");
      expect(activeElements.length).toBeGreaterThan(0);
    });

    it("should not highlight any event when activeIndex is not provided", () => {
      const { container } = render(<Timeline events={mockEvents} />);

      // Check that scale-105 is only applied on hover, not by default
      const timelineEvents = container.querySelectorAll(".timeline-event");
      timelineEvents.forEach((event) => {
        expect(event.classList.contains("scale-105")).toBe(false);
      });
    });
  });

  describe("Connectors", () => {
    it("should show connectors between events by default", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const connectors = container.querySelectorAll(".timeline-connector");

      expect(connectors.length).toBe(mockEvents.length - 1);
    });

    it("should hide connectors when showConnectors is false", () => {
      const { container } = render(
        <Timeline events={mockEvents} showConnectors={false} />
      );
      const connectors = container.querySelectorAll(".timeline-connector");

      expect(connectors.length).toBe(0);
    });

    it("should not show connector after last event", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const connectors = container.querySelectorAll(".timeline-connector");

      // Should have one less connector than events
      expect(connectors.length).toBe(mockEvents.length - 1);
    });
  });

  describe("Metadata Display", () => {
    it("should render event metadata when provided", () => {
      const eventWithMetadata: TimelineEvent[] = [
        {
          id: "1",
          title: "Event",
          timestamp: new Date(),
          status: "completed",
          metadata: {
            tracking_number: "ABC123",
            carrier: "FedEx"
          }
        }
      ];

      render(<Timeline events={eventWithMetadata} />);

      expect(screen.getByText(/tracking number/i)).toBeInTheDocument();
      expect(screen.getByText("ABC123")).toBeInTheDocument();
      expect(screen.getByText(/carrier/i)).toBeInTheDocument();
      expect(screen.getByText("FedEx")).toBeInTheDocument();
    });

    it("should not render metadata section when metadata is empty", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const metadataElements = container.querySelectorAll(".timeline-metadata");

      expect(metadataElements.length).toBe(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<Timeline events={mockEvents} />);

      expect(screen.getByRole("list", { name: /timeline/i })).toBeInTheDocument();
    });

    it("should have proper ARIA labels for status", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const statusNodes = container.querySelectorAll('[aria-label*="status"]');

      expect(statusNodes.length).toBe(mockEvents.length);
    });

    it("should have proper datetime attributes", () => {
      const { container } = render(<Timeline events={mockEvents} />);
      const timeElements = container.querySelectorAll("time[datetime]");

      expect(timeElements.length).toBe(mockEvents.length);
    });
  });

  describe("Animation", () => {
    it("should apply animation classes when animated is true", () => {
      const { container } = render(<Timeline events={mockEvents} animated />);
      const animatedElements = container.querySelectorAll(".transition-all");

      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it("should not apply animation classes when animated is false", () => {
      const { container } = render(<Timeline events={mockEvents} animated={false} />);
      const timelineEvents = container.querySelectorAll(".timeline-event");

      timelineEvents.forEach((event) => {
        expect(event.classList.contains("transition-all")).toBe(false);
      });
    });
  });
});

describe("OrderTimeline Component", () => {
  const baseProps = {
    orderId: "ORDER123",
    status: "placed" as const,
    placedAt: new Date("2024-01-15T10:00:00")
  };

  describe("Order Status Flow", () => {
    it("should render placed order correctly", () => {
      render(<OrderTimeline {...baseProps} status="placed" />);

      expect(screen.getByText("Order Placed")).toBeInTheDocument();
      expect(screen.getByText("Farmer Preparing")).toBeInTheDocument();
      expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
      expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
      expect(screen.getByText("Delivered")).toBeInTheDocument();
    });

    it("should show preparing status as active", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="preparing"
          preparedAt={new Date("2024-01-15T12:00:00")}
        />
      );

      expect(screen.getByText("Farmer Preparing")).toBeInTheDocument();
    });

    it("should show ready status", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="ready"
          preparedAt={new Date("2024-01-15T12:00:00")}
          readyAt={new Date("2024-01-15T14:00:00")}
        />
      );

      expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
    });

    it("should show in_transit status", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="in_transit"
          preparedAt={new Date("2024-01-15T12:00:00")}
          readyAt={new Date("2024-01-15T14:00:00")}
        />
      );

      expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    });

    it("should show delivered status", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="delivered"
          preparedAt={new Date("2024-01-15T12:00:00")}
          readyAt={new Date("2024-01-15T14:00:00")}
          deliveredAt={new Date("2024-01-15T16:00:00")}
        />
      );

      expect(screen.getByText("Delivered")).toBeInTheDocument();
      expect(screen.getByText("Enjoy your fresh farm products!")).toBeInTheDocument();
    });

    it("should handle cancelled orders", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="cancelled"
          cancelledAt={new Date("2024-01-15T12:00:00")}
        />
      );

      expect(screen.getByText("Order Cancelled")).toBeInTheDocument();
      expect(screen.getByText("This order has been cancelled")).toBeInTheDocument();
    });
  });

  describe("Farm and Delivery Information", () => {
    it("should display farm name when provided", () => {
      render(
        <OrderTimeline
          {...baseProps}
          farmName="Sunrise Valley Farm"
          status="preparing"
          preparedAt={new Date()}
        />
      );

      expect(screen.getByText(/Harvest in progress at Sunrise Valley Farm/i)).toBeInTheDocument();
    });

    it("should display delivery address when provided", () => {
      render(
        <OrderTimeline
          {...baseProps}
          deliveryAddress="123 Main St, City, State"
          status="in_transit"
          readyAt={new Date()}
        />
      );

      expect(screen.getByText(/En route to 123 Main St, City, State/i)).toBeInTheDocument();
    });

    it("should show default text when farm name is not provided", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="preparing"
          preparedAt={new Date()}
        />
      );

      expect(screen.getByText(/Preparing your fresh produce/i)).toBeInTheDocument();
    });

    it("should show default text when delivery address is not provided", () => {
      render(
        <OrderTimeline
          {...baseProps}
          status="in_transit"
          readyAt={new Date()}
        />
      );

      expect(screen.getByText(/On the way to you/i)).toBeInTheDocument();
    });
  });

  describe("Agricultural Theme", () => {
    it("should apply agricultural theme by default", () => {
      const { container } = render(<OrderTimeline {...baseProps} />);

      expect(container.querySelector(".agricultural-timeline")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <OrderTimeline {...baseProps} className="custom-class" />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });
});

describe("Timeline Timestamp Formatting", () => {
  it("should format recent timestamps as relative time", () => {
    const recentEvent: TimelineEvent = {
      id: "1",
      title: "Recent Event",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: "completed"
    };

    render(<Timeline events={[recentEvent]} />);

    expect(screen.getByText(/30 minute.*ago/i)).toBeInTheDocument();
  });

  it("should format hour-old timestamps correctly", () => {
    const hourOldEvent: TimelineEvent = {
      id: "1",
      title: "Hour Old Event",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: "completed"
    };

    render(<Timeline events={[hourOldEvent]} />);

    expect(screen.getByText(/2 hour.*ago/i)).toBeInTheDocument();
  });

  it("should format day-old timestamps correctly", () => {
    const dayOldEvent: TimelineEvent = {
      id: "1",
      title: "Day Old Event",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      status: "completed"
    };

    render(<Timeline events={[dayOldEvent]} />);

    expect(screen.getByText(/3 day.*ago/i)).toBeInTheDocument();
  });

  it("should format very recent timestamps as 'Just now'", () => {
    const justNowEvent: TimelineEvent = {
      id: "1",
      title: "Just Now Event",
      timestamp: new Date(Date.now() - 1000 * 30), // 30 seconds ago
      status: "completed"
    };

    render(<Timeline events={[justNowEvent]} />);

    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });
});
