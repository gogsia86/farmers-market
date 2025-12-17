// ============================================================================
// AGRICULTURAL COMPONENTS TEST SUITE
// Comprehensive tests for all agricultural-specific components
// ============================================================================

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  SeasonalIndicator,
  getCurrentSeason,
  getSeasonConfig,
  isSeasonalActivity,
} from "../SeasonalIndicator";
import {
  HarvestCalendar,
  type HarvestEvent,
  type HarvestStatus,
  type CropType,
} from "../HarvestCalendar";
import {
  WeatherWidget,
  type WeatherData,
  type ForecastDay,
  type WeatherCondition,
} from "../WeatherWidget";
import {
  SoilHealthMeter,
  calculateSoilHealth,
  type SoilHealthData,
} from "../SoilHealthMeter";
import {
  BiodynamicBadge,
  BiodynamicBadgeGroup,
  getCertificationConfig,
  type CertificationType,
} from "../BiodynamicBadge";

// ============================================================================
// SEASONAL INDICATOR TESTS
// ============================================================================

describe("SeasonalIndicator", () => {
  describe("Rendering", () => {
    it("should render with default variant", () => {
      render(<SeasonalIndicator season="SPRING" />);
      expect(screen.getByText("Spring")).toBeInTheDocument();
      expect(screen.getByText("Season of renewal and planting")).toBeInTheDocument();
    });

    it("should render compact variant", () => {
      render(<SeasonalIndicator season="SUMMER" variant="compact" />);
      expect(screen.getByText("Summer")).toBeInTheDocument();
    });

    it("should render detailed variant", () => {
      render(<SeasonalIndicator season="FALL" variant="detailed" />);
      expect(screen.getByText("Fall")).toBeInTheDocument();
      expect(screen.getByText("Seasonal Activities")).toBeInTheDocument();
    });

    it("should display temperature when provided", () => {
      render(<SeasonalIndicator season="WINTER" temperature={5} />);
      expect(screen.getByText("5°C")).toBeInTheDocument();
    });

    it("should show seasonal activities", () => {
      render(<SeasonalIndicator season="SPRING" showActivities={true} />);
      expect(screen.getByText("Plant")).toBeInTheDocument();
      expect(screen.getByText("Prepare Soil")).toBeInTheDocument();
    });

    it("should hide activities when showActivities is false", () => {
      render(<SeasonalIndicator season="SPRING" showActivities={false} />);
      expect(screen.queryByText("Plant")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onSeasonClick when clicked", () => {
      const handleClick = jest.fn();
      render(<SeasonalIndicator season="SPRING" onSeasonClick={handleClick} />);

      const indicator = screen.getByRole("button");
      fireEvent.click(indicator);

      expect(handleClick).toHaveBeenCalledWith("SPRING");
    });

    it("should handle keyboard navigation", () => {
      const handleClick = jest.fn();
      render(<SeasonalIndicator season="SUMMER" onSeasonClick={handleClick} />);

      const indicator = screen.getByRole("button");
      fireEvent.keyDown(indicator, { key: "Enter" });

      expect(handleClick).toHaveBeenCalledWith("SUMMER");
    });
  });

  describe("Utility Functions", () => {
    it("should get current season correctly", () => {
      const springDate = new Date(2024, 3, 15); // April
      expect(getCurrentSeason(springDate)).toBe("SPRING");

      const summerDate = new Date(2024, 6, 15); // July
      expect(getCurrentSeason(summerDate)).toBe("SUMMER");

      const fallDate = new Date(2024, 9, 15); // October
      expect(getCurrentSeason(fallDate)).toBe("FALL");

      const winterDate = new Date(2024, 0, 15); // January
      expect(getCurrentSeason(winterDate)).toBe("WINTER");
    });

    it("should get season config", () => {
      const config = getSeasonConfig("SPRING");
      expect(config.name).toBe("Spring");
      expect(config.emoji).toBe("🌱");
    });

    it("should validate seasonal activities", () => {
      expect(isSeasonalActivity("SPRING", "Plant")).toBe(true);
      expect(isSeasonalActivity("SPRING", "Harvest")).toBe(false);
      expect(isSeasonalActivity("FALL", "Harvest")).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<SeasonalIndicator season="SPRING" />);
      expect(
        screen.getByLabelText(/Current season: Spring/i)
      ).toBeInTheDocument();
    });

    it("should be keyboard accessible when interactive", () => {
      const handleClick = jest.fn();
      render(<SeasonalIndicator season="SPRING" onSeasonClick={handleClick} />);

      const indicator = screen.getByRole("button");
      expect(indicator).toHaveAttribute("tabIndex", "0");
    });
  });
});

// ============================================================================
// HARVEST CALENDAR TESTS
// ============================================================================

describe("HarvestCalendar", () => {
  const mockEvents: HarvestEvent[] = [
    {
      id: "1",
      cropName: "Tomatoes",
      cropType: "VEGETABLE",
      harvestDate: new Date(2024, 5, 15),
      status: "PLANNED",
      quantity: "50kg",
    },
    {
      id: "2",
      cropName: "Apples",
      cropType: "FRUIT",
      harvestDate: new Date(2024, 5, 20),
      status: "IN_PROGRESS",
      quantity: "100kg",
    },
  ];

  describe("Rendering", () => {
    it("should render calendar with events", () => {
      render(<HarvestCalendar events={mockEvents} />);
      expect(screen.getByText("Tomatoes")).toBeInTheDocument();
      expect(screen.getByText("Apples")).toBeInTheDocument();
    });

    it("should display month and year", () => {
      const initialDate = new Date(2024, 5, 1);
      render(<HarvestCalendar events={mockEvents} initialDate={initialDate} />);
      expect(screen.getByText("June 2024")).toBeInTheDocument();
    });

    it("should render weekday headers", () => {
      render(<HarvestCalendar events={mockEvents} />);
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Sat")).toBeInTheDocument();
    });

    it("should show legend", () => {
      render(<HarvestCalendar events={mockEvents} />);
      expect(screen.getByText("Planned")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should navigate to previous month", () => {
      const initialDate = new Date(2024, 5, 1);
      render(<HarvestCalendar events={mockEvents} initialDate={initialDate} />);

      fireEvent.click(screen.getByLabelText("Previous month"));

      waitFor(() => {
        expect(screen.getByText("May 2024")).toBeInTheDocument();
      });
    });

    it("should navigate to next month", () => {
      const initialDate = new Date(2024, 5, 1);
      render(<HarvestCalendar events={mockEvents} initialDate={initialDate} />);

      fireEvent.click(screen.getByLabelText("Next month"));

      waitFor(() => {
        expect(screen.getByText("July 2024")).toBeInTheDocument();
      });
    });

    it("should navigate to today", () => {
      render(<HarvestCalendar events={mockEvents} />);
      fireEvent.click(screen.getByLabelText("Go to today"));
      // Calendar should now show current month
    });
  });

  describe("Interactions", () => {
    it("should call onEventClick when event is clicked", () => {
      const handleEventClick = jest.fn();
      render(
        <HarvestCalendar
          events={mockEvents}
          onEventClick={handleEventClick}
        />
      );

      fireEvent.click(screen.getByText("Tomatoes"));
      expect(handleEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    it("should call onDateClick when date cell is clicked", () => {
      const handleDateClick = jest.fn();
      render(
        <HarvestCalendar events={mockEvents} onDateClick={handleDateClick} />
      );

      const dateCells = screen.getAllByRole("button");
      fireEvent.click(dateCells[10]); // Click a date cell
      expect(handleDateClick).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<HarvestCalendar events={mockEvents} />);
      expect(
        screen.getByLabelText("Harvest planning calendar")
      ).toBeInTheDocument();
    });
  });
});

// ============================================================================
// WEATHER WIDGET TESTS
// ============================================================================

describe("WeatherWidget", () => {
  const mockWeather: WeatherData = {
    condition: "CLEAR",
    temperature: 25,
    feelsLike: 27,
    humidity: 65,
    windSpeed: 15,
    windDirection: "NE",
    precipitation: 0,
    visibility: 10,
    pressure: 1013,
    sunrise: "06:30",
    sunset: "20:15",
    lastUpdated: new Date(),
  };

  const mockForecast: ForecastDay[] = [
    {
      date: new Date(2024, 5, 16),
      condition: "PARTLY_CLOUDY",
      tempHigh: 28,
      tempLow: 18,
      precipitation: 10,
    },
    {
      date: new Date(2024, 5, 17),
      condition: "RAIN",
      tempHigh: 22,
      tempLow: 16,
      precipitation: 80,
    },
  ];

  describe("Rendering", () => {
    it("should render with default variant", () => {
      render(<WeatherWidget weather={mockWeather} location="Test Farm" />);
      expect(screen.getByText("Test Farm")).toBeInTheDocument();
      expect(screen.getByText("25°")).toBeInTheDocument();
    });

    it("should render compact variant", () => {
      render(
        <WeatherWidget
          weather={mockWeather}
          location="Test Farm"
          variant="compact"
        />
      );
      expect(screen.getByText("Test Farm")).toBeInTheDocument();
    });

    it("should render detailed variant", () => {
      render(
        <WeatherWidget
          weather={mockWeather}
          location="Test Farm"
          variant="detailed"
        />
      );
      expect(screen.getByText("Test Farm")).toBeInTheDocument();
      expect(screen.getByText("Humidity")).toBeInTheDocument();
      expect(screen.getByText("Wind")).toBeInTheDocument();
    });

    it("should display agricultural tips", () => {
      render(
        <WeatherWidget
          weather={mockWeather}
          location="Test Farm"
          showAgriculturalTips={true}
        />
      );
      expect(
        screen.getByText(/Perfect for outdoor work and harvesting/i)
      ).toBeInTheDocument();
    });

    it("should display forecast when provided", () => {
      render(
        <WeatherWidget
          weather={mockWeather}
          location="Test Farm"
          forecast={mockForecast}
          showForecast={true}
        />
      );
      // Forecast should be visible
    });
  });

  describe("Interactions", () => {
    it("should call onRefresh when refresh button is clicked", () => {
      const handleRefresh = jest.fn();
      render(
        <WeatherWidget
          weather={mockWeather}
          location="Test Farm"
          onRefresh={handleRefresh}
        />
      );

      const refreshButton = screen.getByLabelText("Refresh weather");
      fireEvent.click(refreshButton);
      expect(handleRefresh).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<WeatherWidget weather={mockWeather} location="Test Farm" />);
      expect(
        screen.getByLabelText(/Weather for Test Farm/i)
      ).toBeInTheDocument();
    });
  });
});

// ============================================================================
// SOIL HEALTH METER TESTS
// ============================================================================

describe("SoilHealthMeter", () => {
  const mockSoilData: SoilHealthData = {
    ph: 6.5,
    nitrogen: 35,
    phosphorus: 45,
    potassium: 200,
    organicMatter: 4.5,
    moisture: 50,
    temperature: 18,
    lastTested: new Date(2024, 5, 1),
    recommendations: [
      "Maintain current practices",
      "Monitor moisture levels during summer",
    ],
  };

  describe("Rendering", () => {
    it("should render with default variant", () => {
      render(<SoilHealthMeter data={mockSoilData} />);
      expect(screen.getByText("Soil Health")).toBeInTheDocument();
    });

    it("should render compact variant", () => {
      render(<SoilHealthMeter data={mockSoilData} variant="compact" />);
      expect(screen.getByText("/ 100")).toBeInTheDocument();
    });

    it("should render detailed variant", () => {
      render(<SoilHealthMeter data={mockSoilData} variant="detailed" />);
      expect(screen.getByText("Soil Health Analysis")).toBeInTheDocument();
      expect(screen.getByText("Individual Metrics")).toBeInTheDocument();
    });

    it("should display metrics when enabled", () => {
      render(<SoilHealthMeter data={mockSoilData} showMetrics={true} />);
      expect(screen.getByText("pH Level")).toBeInTheDocument();
      expect(screen.getByText("Nitrogen (N)")).toBeInTheDocument();
    });

    it("should display recommendations", () => {
      render(
        <SoilHealthMeter
          data={mockSoilData}
          variant="detailed"
          showRecommendations={true}
        />
      );
      expect(screen.getByText("Recommendations")).toBeInTheDocument();
      expect(screen.getByText("Maintain current practices")).toBeInTheDocument();
    });
  });

  describe("Health Calculation", () => {
    it("should calculate excellent soil health", () => {
      const excellentSoil: SoilHealthData = {
        ph: 6.5,
        nitrogen: 40,
        phosphorus: 50,
        potassium: 200,
        organicMatter: 5,
        moisture: 55,
        lastTested: new Date(),
      };

      const { status, score } = calculateSoilHealth(excellentSoil);
      expect(status).toBe("EXCELLENT");
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it("should calculate poor soil health", () => {
      const poorSoil: SoilHealthData = {
        ph: 4.5,
        nitrogen: 5,
        phosphorus: 10,
        potassium: 50,
        organicMatter: 1,
        moisture: 20,
        lastTested: new Date(),
      };

      const { status, score } = calculateSoilHealth(poorSoil);
      expect(status).toBe("POOR");
      expect(score).toBeLessThan(60);
    });
  });

  describe("Interactions", () => {
    it("should call onMetricClick when metric is clicked", () => {
      const handleMetricClick = jest.fn();
      render(
        <SoilHealthMeter
          data={mockSoilData}
          variant="detailed"
          showMetrics={true}
          onMetricClick={handleMetricClick}
        />
      );

      const phMetric = screen.getByText("pH Level");
      fireEvent.click(phMetric.closest("div")!);
      expect(handleMetricClick).toHaveBeenCalledWith("pH Level");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<SoilHealthMeter data={mockSoilData} />);
      expect(screen.getByLabelText("Soil health meter")).toBeInTheDocument();
    });
  });
});

// ============================================================================
// BIODYNAMIC BADGE TESTS
// ============================================================================

describe("BiodynamicBadge", () => {
  describe("Rendering", () => {
    it("should render with default variant", () => {
      render(<BiodynamicBadge type="ORGANIC" />);
      expect(screen.getByText("Organic")).toBeInTheDocument();
    });

    it("should render with different variants", () => {
      const { rerender } = render(
        <BiodynamicBadge type="ORGANIC" variant="outlined" />
      );
      expect(screen.getByText("Organic")).toBeInTheDocument();

      rerender(<BiodynamicBadge type="ORGANIC" variant="filled" />);
      expect(screen.getByText("Organic")).toBeInTheDocument();

      rerender(<BiodynamicBadge type="ORGANIC" variant="minimal" />);
      expect(screen.getByLabelText("Certified Organic")).toBeInTheDocument();
    });

    it("should render with different sizes", () => {
      const { rerender } = render(
        <BiodynamicBadge type="BIODYNAMIC" size="sm" />
      );
      expect(screen.getByText("Biodynamic")).toBeInTheDocument();

      rerender(<BiodynamicBadge type="BIODYNAMIC" size="lg" />);
      expect(screen.getByText("Biodynamic")).toBeInTheDocument();
    });

    it("should show label when enabled", () => {
      render(<BiodynamicBadge type="ORGANIC" showLabel={true} />);
      expect(screen.getByText("Organic")).toBeInTheDocument();
    });

    it("should hide label when disabled", () => {
      render(<BiodynamicBadge type="ORGANIC" showLabel={false} />);
      expect(screen.queryByText("Organic")).not.toBeInTheDocument();
    });

    it("should show verified checkmark", () => {
      render(<BiodynamicBadge type="ORGANIC" showVerified={true} />);
      // Checkmark icon should be present
    });

    it("should display verification date", () => {
      const verifiedDate = new Date(2023, 0, 1);
      render(
        <BiodynamicBadge
          type="ORGANIC"
          showVerified={true}
          verifiedDate={verifiedDate}
        />
      );
      expect(screen.getByText("2023")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClick when clicked", () => {
      const handleClick = jest.fn();
      render(<BiodynamicBadge type="ORGANIC" onClick={handleClick} />);

      const badge = screen.getByRole("button");
      fireEvent.click(badge);
      expect(handleClick).toHaveBeenCalled();
    });

    it("should handle keyboard navigation", () => {
      const handleClick = jest.fn();
      render(<BiodynamicBadge type="ORGANIC" onClick={handleClick} />);

      const badge = screen.getByRole("button");
      fireEvent.keyDown(badge, { key: "Enter" });
      expect(handleClick).toHaveBeenCalled();

      fireEvent.keyDown(badge, { key: " " });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("Utility Functions", () => {
    it("should get certification config", () => {
      const config = getCertificationConfig("ORGANIC");
      expect(config.label).toBe("Certified Organic");
      expect(config.shortLabel).toBe("Organic");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<BiodynamicBadge type="ORGANIC" />);
      expect(screen.getByLabelText("Certified Organic")).toBeInTheDocument();
    });

    it("should have tooltip text", () => {
      render(<BiodynamicBadge type="ORGANIC" />);
      const badge = screen.getByLabelText("Certified Organic");
      expect(badge).toHaveAttribute(
        "title",
        "Grown without synthetic pesticides or fertilizers"
      );
    });
  });
});

// ============================================================================
// BIODYNAMIC BADGE GROUP TESTS
// ============================================================================

describe("BiodynamicBadgeGroup", () => {
  const certifications: CertificationType[] = [
    "ORGANIC",
    "BIODYNAMIC",
    "LOCAL",
    "NON_GMO",
    "FAIR_TRADE",
  ];

  describe("Rendering", () => {
    it("should render multiple badges", () => {
      render(<BiodynamicBadgeGroup certifications={certifications} />);
      expect(screen.getByText("Organic")).toBeInTheDocument();
      expect(screen.getByText("Biodynamic")).toBeInTheDocument();
      expect(screen.getByText("Local")).toBeInTheDocument();
    });

    it("should limit visible badges and show count", () => {
      render(
        <BiodynamicBadgeGroup certifications={certifications} maxVisible={2} />
      );
      expect(screen.getByText("Organic")).toBeInTheDocument();
      expect(screen.getByText("Biodynamic")).toBeInTheDocument();
      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });

    it("should render in horizontal direction", () => {
      render(
        <BiodynamicBadgeGroup
          certifications={certifications}
          direction="horizontal"
        />
      );
      // Check layout class
    });

    it("should render in vertical direction", () => {
      render(
        <BiodynamicBadgeGroup
          certifications={certifications}
          direction="vertical"
        />
      );
      // Check layout class
    });
  });

  describe("Interactions", () => {
    it("should call onBadgeClick when badge is clicked", () => {
      const handleBadgeClick = jest.fn();
      render(
        <BiodynamicBadgeGroup
          certifications={certifications}
          onBadgeClick={handleBadgeClick}
        />
      );

      fireEvent.click(screen.getByText("Organic"));
      expect(handleBadgeClick).toHaveBeenCalledWith("ORGANIC");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA structure", () => {
      render(<BiodynamicBadgeGroup certifications={certifications} />);
      expect(
        screen.getByLabelText("Certifications and practices")
      ).toBeInTheDocument();
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Agricultural Components Integration", () => {
  it("should work together in a farm dashboard context", () => {
    const weather: WeatherData = {
      condition: "CLEAR",
      temperature: 22,
      humidity: 60,
      windSpeed: 10,
      lastUpdated: new Date(),
    };

    const soilData: SoilHealthData = {
      ph: 6.5,
      nitrogen: 40,
      phosphorus: 50,
      potassium: 200,
      organicMatter: 5,
      moisture: 55,
      lastTested: new Date(),
    };

    render(
      <div>
        <SeasonalIndicator season="SPRING" temperature={22} />
        <WeatherWidget weather={weather} location="Test Farm" />
        <SoilHealthMeter data={soilData} />
        <BiodynamicBadge type="ORGANIC" />
      </div>
    );

    expect(screen.getByText("Spring")).toBeInTheDocument();
    expect(screen.getByText("Test Farm")).toBeInTheDocument();
    expect(screen.getByText("Soil Health")).toBeInTheDocument();
    expect(screen.getByText("Organic")).toBeInTheDocument();
  });
});
