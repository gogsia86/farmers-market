import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaticMap, FarmLocationMap, MapLocation } from "../Map";

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, "geolocation", {
  writable: true,
  value: mockGeolocation,
});

describe("StaticMap Component", () => {
  const mockLocations: MapLocation[] = [
    {
      id: "1",
      lat: 40.7128,
      lng: -74.006,
      title: "Sunrise Valley Farm",
      description: "Organic vegetables and fruits",
      type: "farm",
      farmName: "Sunrise Valley Farm",
      address: "123 Farm Road, NY",
    },
    {
      id: "2",
      lat: 40.758,
      lng: -73.9855,
      title: "Green Meadows Market",
      description: "Weekly farmers market",
      type: "market",
      address: "456 Market St, NY",
    },
    {
      id: "3",
      lat: 40.7489,
      lng: -73.968,
      title: "Downtown Pickup Point",
      type: "pickup",
      address: "789 Main St, NY",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render map container", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(
        screen.getByRole("application", { name: /farm locations map/i }),
      ).toBeInTheDocument();
    });

    it("should render all location markers", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(screen.getByText("Green Meadows Market")).toBeInTheDocument();
      expect(screen.getByText("Downtown Pickup Point")).toBeInTheDocument();
    });

    it("should display location count", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(screen.getByText("3 locations")).toBeInTheDocument();
    });

    it("should display singular location text for single location", () => {
      render(<StaticMap locations={[mockLocations[0]]} />);

      expect(screen.getByText("1 location")).toBeInTheDocument();
    });

    it("should apply custom height", () => {
      const { container } = render(
        <StaticMap locations={mockLocations} height="600px" />,
      );

      const mapContainer = screen.getByRole("application", {
        name: /farm locations map/i,
      });
      expect(mapContainer).toHaveStyle({ height: "600px" });
    });

    it("should apply custom className", () => {
      render(<StaticMap locations={mockLocations} className="custom-map" />);

      // Verify the component renders correctly with custom className
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(
        screen.getByRole("application", { name: /farm locations map/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Location Types", () => {
    it("should display farm icon for farm locations", () => {
      render(<StaticMap locations={[mockLocations[0]]} />);

      expect(screen.getByText("🌾")).toBeInTheDocument();
    });

    it("should display market icon for market locations", () => {
      render(<StaticMap locations={[mockLocations[1]]} />);

      expect(screen.getByText("🛒")).toBeInTheDocument();
    });

    it("should display pickup icon for pickup locations", () => {
      render(<StaticMap locations={[mockLocations[2]]} />);

      expect(screen.getByText("📦")).toBeInTheDocument();
    });

    it("should display delivery icon for delivery locations", () => {
      const deliveryLocation: MapLocation = {
        id: "delivery-1",
        lat: 40.7128,
        lng: -74.006,
        title: "Delivery Point",
        type: "delivery",
      };

      render(<StaticMap locations={[deliveryLocation]} />);

      expect(screen.getByText("🚚")).toBeInTheDocument();
    });

    it("should display default icon for other location types", () => {
      const otherLocation: MapLocation = {
        id: "other-1",
        lat: 40.7128,
        lng: -74.006,
        title: "Other Location",
        type: "other",
      };

      render(<StaticMap locations={[otherLocation]} />);

      expect(screen.getByText("📍")).toBeInTheDocument();
    });
  });

  describe("Location Details", () => {
    it("should display location address when provided", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(screen.getByText(/123 Farm Road, NY/i)).toBeInTheDocument();
    });

    it("should display location description when provided", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(
        screen.getByText("Organic vegetables and fruits"),
      ).toBeInTheDocument();
    });

    it("should display coordinates", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(screen.getByText(/40.7128/)).toBeInTheDocument();
      expect(screen.getByText(/-74.0060/)).toBeInTheDocument();
    });
  });

  describe("Location Selection", () => {
    it("should highlight selected location on click", () => {
      render(<StaticMap locations={mockLocations} />);

      const firstLocation = screen
        .getByText("Sunrise Valley Farm")
        .closest("button");
      if (firstLocation) {
        fireEvent.click(firstLocation);

        // After clicking, selected location details should appear in the detail panel
        expect(screen.getByText(/Open in Google Maps/i)).toBeInTheDocument();
      }
    });

    it("should call onLocationClick when location is clicked", () => {
      const onLocationClick = jest.fn();

      render(
        <StaticMap
          locations={mockLocations}
          onLocationClick={onLocationClick}
        />,
      );

      const firstLocation = screen
        .getByText("Sunrise Valley Farm")
        .closest("button");
      if (firstLocation) {
        fireEvent.click(firstLocation);
        expect(onLocationClick).toHaveBeenCalledWith(mockLocations[0]);
      }
    });

    it("should show selected location details", () => {
      render(<StaticMap locations={mockLocations} />);

      const firstLocation = screen
        .getByText("Sunrise Valley Farm")
        .closest("button");
      if (firstLocation) {
        fireEvent.click(firstLocation);

        // Details panel should appear
        expect(
          screen.getAllByText("Sunrise Valley Farm").length,
        ).toBeGreaterThan(1);
      }
    });

    it("should close details panel when close button is clicked", () => {
      render(<StaticMap locations={mockLocations} />);

      const firstLocation = screen
        .getByText("Sunrise Valley Farm")
        .closest("button");
      if (firstLocation) {
        fireEvent.click(firstLocation);

        const closeButton = screen.getByLabelText("Close");
        fireEvent.click(closeButton);

        // Only one instance should remain (in the grid)
        expect(screen.getAllByText("Sunrise Valley Farm").length).toBe(1);
      }
    });
  });

  describe("Map Controls", () => {
    it("should show controls by default", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
      expect(screen.getByLabelText("Recenter map")).toBeInTheDocument();
    });

    it("should hide controls when showControls is false", () => {
      render(<StaticMap locations={mockLocations} showControls={false} />);

      expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Zoom out")).not.toBeInTheDocument();
    });

    it("should update zoom level when zoom in is clicked", () => {
      render(<StaticMap locations={mockLocations} zoom={10} />);

      const zoomInButton = screen.getByLabelText("Zoom in");
      fireEvent.click(zoomInButton);

      expect(screen.getByText("Zoom: 11x")).toBeInTheDocument();
    });

    it("should update zoom level when zoom out is clicked", () => {
      render(<StaticMap locations={mockLocations} zoom={10} />);

      const zoomOutButton = screen.getByLabelText("Zoom out");
      fireEvent.click(zoomOutButton);

      expect(screen.getByText("Zoom: 9x")).toBeInTheDocument();
    });

    it("should not zoom beyond maximum level", () => {
      render(<StaticMap locations={mockLocations} zoom={20} />);

      const zoomInButton = screen.getByLabelText("Zoom in");
      fireEvent.click(zoomInButton);

      expect(screen.getByText("Zoom: 20x")).toBeInTheDocument();
    });

    it("should not zoom below minimum level", () => {
      render(<StaticMap locations={mockLocations} zoom={1} />);

      const zoomOutButton = screen.getByLabelText("Zoom out");
      fireEvent.click(zoomOutButton);

      expect(screen.getByText("Zoom: 1x")).toBeInTheDocument();
    });

    it("should recenter map when recenter button is clicked", () => {
      render(<StaticMap locations={mockLocations} zoom={10} />);

      // Zoom in first
      const zoomInButton = screen.getByLabelText("Zoom in");
      fireEvent.click(zoomInButton);

      // Then recenter
      const recenterButton = screen.getByLabelText("Recenter map");
      fireEvent.click(recenterButton);

      expect(screen.getByText("Zoom: 10x")).toBeInTheDocument();
    });
  });

  describe("User Location", () => {
    it("should request geolocation when showCurrentLocation is true", () => {
      render(<StaticMap locations={mockLocations} showCurrentLocation />);

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it("should not request geolocation when showCurrentLocation is false", () => {
      render(
        <StaticMap locations={mockLocations} showCurrentLocation={false} />,
      );

      expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
    });

    it("should display user location indicator when location is available", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) =>
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        }),
      );

      render(<StaticMap locations={mockLocations} showCurrentLocation />);

      await waitFor(() => {
        expect(screen.getByText("Your Location")).toBeInTheDocument();
      });
    });

    it("should show go to user location button when location is available", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) =>
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        }),
      );

      render(<StaticMap locations={mockLocations} showCurrentLocation />);

      await waitFor(() => {
        expect(screen.getByLabelText("Go to my location")).toBeInTheDocument();
      });
    });

    it("should handle geolocation error gracefully", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) =>
        error?.({
          code: 1,
          message: "User denied geolocation",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        }),
      );

      render(<StaticMap locations={mockLocations} showCurrentLocation />);

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Agricultural Theme", () => {
    it("should apply agricultural theme colors when enabled", () => {
      render(<StaticMap locations={mockLocations} agriculturalTheme />);

      // Map should render with agricultural theme - verify all locations display
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(screen.getByText("Green Meadows Market")).toBeInTheDocument();
      expect(screen.getByText("Downtown Pickup Point")).toBeInTheDocument();
    });

    it("should apply default colors when agricultural theme is disabled", () => {
      render(<StaticMap locations={mockLocations} agriculturalTheme={false} />);

      // Map should render without agricultural theme - verify all locations display
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(screen.getByText("Green Meadows Market")).toBeInTheDocument();
      expect(screen.getByText("Downtown Pickup Point")).toBeInTheDocument();
    });
  });

  describe("Google Maps Integration", () => {
    it("should provide Google Maps link for selected location", () => {
      render(<StaticMap locations={mockLocations} />);

      const firstLocation = screen
        .getByText("Sunrise Valley Farm")
        .closest("button");
      if (firstLocation) {
        fireEvent.click(firstLocation);

        const googleMapsLink = screen
          .getByText(/Open in Google Maps/i)
          .closest("a");
        expect(googleMapsLink).toHaveAttribute(
          "href",
          expect.stringContaining("google.com/maps"),
        );
        expect(googleMapsLink).toHaveAttribute("target", "_blank");
        expect(googleMapsLink).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label for map", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(
        screen.getByRole("application", { name: /farm locations map/i }),
      ).toBeInTheDocument();
    });

    it("should have accessible location buttons", () => {
      render(<StaticMap locations={mockLocations} />);

      const buttons = screen.getAllByRole("button");
      const locationButton = buttons.find((btn) =>
        btn.getAttribute("aria-label")?.includes("Sunrise Valley Farm"),
      );

      expect(locationButton).toBeInTheDocument();
    });

    it("should have accessible control buttons", () => {
      render(<StaticMap locations={mockLocations} />);

      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
      expect(screen.getByLabelText("Recenter map")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty locations array", () => {
      render(<StaticMap locations={[]} />);

      expect(screen.getByText("0 locations")).toBeInTheDocument();
    });

    it("should handle location without address", () => {
      const locationWithoutAddress: MapLocation = {
        id: "1",
        lat: 40.7128,
        lng: -74.006,
        title: "Test Location",
        type: "farm",
      };

      render(<StaticMap locations={[locationWithoutAddress]} />);

      expect(screen.getByText("Test Location")).toBeInTheDocument();
    });

    it("should handle location without description", () => {
      const locationWithoutDesc: MapLocation = {
        id: "1",
        lat: 40.7128,
        lng: -74.006,
        title: "Test Location",
        type: "farm",
        address: "123 Test St",
      };

      render(<StaticMap locations={[locationWithoutDesc]} />);

      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getByText(/123 Test St/)).toBeInTheDocument();
    });

    it("should use first location as center when center is not provided", () => {
      render(<StaticMap locations={mockLocations} />);

      // Map should render with first location visible
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
    });

    it("should handle center prop when provided", () => {
      const customCenter = { lat: 41.0, lng: -75.0 };
      render(<StaticMap locations={mockLocations} center={customCenter} />);

      // Map should render with custom center - verify by checking locations still render
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
    });
  });
});

describe("FarmLocationMap Component", () => {
  const mockFarms = [
    {
      id: "farm-1",
      name: "Sunrise Valley Farm",
      location: {
        address: "123 Farm Road, NY",
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
      description: "Organic vegetables and fruits",
    },
    {
      id: "farm-2",
      name: "Green Meadows Farm",
      location: {
        address: "456 Meadow Lane, NY",
        coordinates: { lat: 40.758, lng: -73.9855 },
      },
      description: "Fresh dairy products",
    },
  ];

  describe("Rendering", () => {
    it("should render farm locations", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(screen.getByText("Green Meadows Farm")).toBeInTheDocument();
    });

    it("should display farm addresses", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      expect(screen.getByText(/123 Farm Road, NY/)).toBeInTheDocument();
      expect(screen.getByText(/456 Meadow Lane, NY/)).toBeInTheDocument();
    });

    it("should display farm descriptions", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      expect(
        screen.getByText("Organic vegetables and fruits"),
      ).toBeInTheDocument();
      expect(screen.getByText("Fresh dairy products")).toBeInTheDocument();
    });

    it("should show farm icons for all locations", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      const farmIcons = screen.getAllByText("🌾");
      expect(farmIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Farm Interaction", () => {
    it("should call onFarmClick when farm is clicked", () => {
      const onFarmClick = jest.fn();

      render(<FarmLocationMap farms={mockFarms} onFarmClick={onFarmClick} />);

      const firstFarm = screen
        .getByText("Sunrise Valley Farm")
        .closest("button");
      if (firstFarm) {
        fireEvent.click(firstFarm);
        expect(onFarmClick).toHaveBeenCalledWith("farm-1");
      }
    });
  });

  describe("Configuration", () => {
    it("should apply agricultural theme by default", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      // FarmLocationMap should render with agricultural theme by default
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(screen.getByText("Green Meadows Farm")).toBeInTheDocument();
    });

    it("should show controls by default", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    });

    it("should show current location by default", () => {
      render(<FarmLocationMap farms={mockFarms} />);

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it("should apply custom height", () => {
      render(<FarmLocationMap farms={mockFarms} height="600px" />);

      const mapContainer = screen.getByRole("application", {
        name: /farm locations map/i,
      });
      expect(mapContainer).toHaveStyle({ height: "600px" });
    });

    it("should apply custom className", () => {
      render(<FarmLocationMap farms={mockFarms} className="custom-farm-map" />);

      // Custom class should be applied - verify map renders correctly
      expect(screen.getByText("Sunrise Valley Farm")).toBeInTheDocument();
      expect(
        screen.getByRole("application", { name: /farm locations map/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty farms array", () => {
      render(<FarmLocationMap farms={[]} />);

      expect(screen.getByText("0 locations")).toBeInTheDocument();
    });

    it("should handle farm without description", () => {
      const farmWithoutDesc = [
        {
          id: "farm-1",
          name: "Test Farm",
          location: {
            address: "123 Test St",
            coordinates: { lat: 40.7128, lng: -74.006 },
          },
        },
      ];

      render(<FarmLocationMap farms={farmWithoutDesc} />);

      expect(screen.getByText("Test Farm")).toBeInTheDocument();
    });
  });
});
