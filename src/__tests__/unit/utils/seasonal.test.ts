/**
 * @jest-environment node
 * @module __tests__/unit/utils/seasonal.test
 *
 * Comprehensive Test Suite for Seasonal Utilities
 *
 * Coverage Areas:
 * - Current season detection
 * - Season navigation (next, previous, adjacent)
 * - Product seasonality checks
 * - Season metadata (names, emojis, descriptions)
 * - Season timing calculations (progress, transitions)
 * - Edge cases and boundary conditions
 *
 * Test Pattern: AAA (Arrange-Act-Assert)
 *
 * @version 1.0.0
 * @since 2025-01-16
 */

import {
  daysUntilNextSeason,
  getAdjacentSeasons,
  getAllSeasons,
  getCurrentSeason,
  getNextSeason,
  getPreviousSeason,
  getSeasonDescription,
  getSeasonEmoji,
  getSeasonMonths,
  getSeasonName,
  getSeasonProgress,
  isInSeason,
  isSeasonEnd,
  isSeasonStart,
  type Season,
} from "@/lib/utils/seasonal";
import { describe, expect, it } from "@jest/globals";

describe("Seasonal Utilities", () => {
  describe("getCurrentSeason", () => {
    describe("spring detection (March, April, May)", () => {
      it("should return SPRING for March", () => {
        // Arrange
        const marchDate = new Date(2024, 2, 15); // March 15

        // Act
        const result = getCurrentSeason(marchDate);

        // Assert
        expect(result).toBe("SPRING");
      });

      it("should return SPRING for April", () => {
        // Arrange
        const aprilDate = new Date(2024, 3, 15); // April 15

        // Act
        const result = getCurrentSeason(aprilDate);

        // Assert
        expect(result).toBe("SPRING");
      });

      it("should return SPRING for May", () => {
        // Arrange
        const mayDate = new Date(2024, 4, 15); // May 15

        // Act
        const result = getCurrentSeason(mayDate);

        // Assert
        expect(result).toBe("SPRING");
      });

      it("should return SPRING on first day of March", () => {
        // Arrange
        const marchFirst = new Date(2024, 2, 1);

        // Act
        const result = getCurrentSeason(marchFirst);

        // Assert
        expect(result).toBe("SPRING");
      });

      it("should return SPRING on last day of May", () => {
        // Arrange
        const mayLast = new Date(2024, 4, 31);

        // Act
        const result = getCurrentSeason(mayLast);

        // Assert
        expect(result).toBe("SPRING");
      });
    });

    describe("summer detection (June, July, August)", () => {
      it("should return SUMMER for June", () => {
        // Arrange
        const juneDate = new Date(2024, 5, 15); // June 15

        // Act
        const result = getCurrentSeason(juneDate);

        // Assert
        expect(result).toBe("SUMMER");
      });

      it("should return SUMMER for July", () => {
        // Arrange
        const julyDate = new Date(2024, 6, 15); // July 15

        // Act
        const result = getCurrentSeason(julyDate);

        // Assert
        expect(result).toBe("SUMMER");
      });

      it("should return SUMMER for August", () => {
        // Arrange
        const augustDate = new Date(2024, 7, 15); // August 15

        // Act
        const result = getCurrentSeason(augustDate);

        // Assert
        expect(result).toBe("SUMMER");
      });
    });

    describe("fall detection (September, October, November)", () => {
      it("should return FALL for September", () => {
        // Arrange
        const septDate = new Date(2024, 8, 15); // September 15

        // Act
        const result = getCurrentSeason(septDate);

        // Assert
        expect(result).toBe("FALL");
      });

      it("should return FALL for October", () => {
        // Arrange
        const octDate = new Date(2024, 9, 15); // October 15

        // Act
        const result = getCurrentSeason(octDate);

        // Assert
        expect(result).toBe("FALL");
      });

      it("should return FALL for November", () => {
        // Arrange
        const novDate = new Date(2024, 10, 15); // November 15

        // Act
        const result = getCurrentSeason(novDate);

        // Assert
        expect(result).toBe("FALL");
      });
    });

    describe("winter detection (December, January, February)", () => {
      it("should return WINTER for December", () => {
        // Arrange
        const decDate = new Date(2024, 11, 15); // December 15

        // Act
        const result = getCurrentSeason(decDate);

        // Assert
        expect(result).toBe("WINTER");
      });

      it("should return WINTER for January", () => {
        // Arrange
        const janDate = new Date(2024, 0, 15); // January 15

        // Act
        const result = getCurrentSeason(janDate);

        // Assert
        expect(result).toBe("WINTER");
      });

      it("should return WINTER for February", () => {
        // Arrange
        const febDate = new Date(2024, 1, 15); // February 15

        // Act
        const result = getCurrentSeason(febDate);

        // Assert
        expect(result).toBe("WINTER");
      });
    });

    describe("boundary conditions", () => {
      it("should handle leap year February 29", () => {
        // Arrange
        const leapDay = new Date(2024, 1, 29);

        // Act
        const result = getCurrentSeason(leapDay);

        // Assert
        expect(result).toBe("WINTER");
      });

      it("should handle transition from February to March", () => {
        // Arrange
        const lastFeb = new Date(2024, 1, 28);
        const firstMarch = new Date(2024, 2, 1);

        // Act
        const febResult = getCurrentSeason(lastFeb);
        const marchResult = getCurrentSeason(firstMarch);

        // Assert
        expect(febResult).toBe("WINTER");
        expect(marchResult).toBe("SPRING");
      });

      it("should use current date when no date provided", () => {
        // Act
        const result = getCurrentSeason();

        // Assert
        expect(["SPRING", "SUMMER", "FALL", "WINTER"]).toContain(result);
      });
    });
  });

  describe("getAllSeasons", () => {
    it("should return all four seasons", () => {
      // Act
      const seasons = getAllSeasons();

      // Assert
      expect(seasons).toHaveLength(4);
      expect(seasons).toEqual(["SPRING", "SUMMER", "FALL", "WINTER"]);
    });

    it("should return seasons in correct order", () => {
      // Act
      const seasons = getAllSeasons();

      // Assert
      expect(seasons[0]).toBe("SPRING");
      expect(seasons[1]).toBe("SUMMER");
      expect(seasons[2]).toBe("FALL");
      expect(seasons[3]).toBe("WINTER");
    });
  });

  describe("getNextSeason", () => {
    it("should return SUMMER after SPRING", () => {
      // Act
      const result = getNextSeason("SPRING");

      // Assert
      expect(result).toBe("SUMMER");
    });

    it("should return FALL after SUMMER", () => {
      // Act
      const result = getNextSeason("SUMMER");

      // Assert
      expect(result).toBe("FALL");
    });

    it("should return WINTER after FALL", () => {
      // Act
      const result = getNextSeason("FALL");

      // Assert
      expect(result).toBe("WINTER");
    });

    it("should return SPRING after WINTER (wrap around)", () => {
      // Act
      const result = getNextSeason("WINTER");

      // Assert
      expect(result).toBe("SPRING");
    });

    it("should cycle through all seasons", () => {
      // Arrange
      let season: Season = "SPRING";

      // Act & Assert
      season = getNextSeason(season);
      expect(season).toBe("SUMMER");

      season = getNextSeason(season);
      expect(season).toBe("FALL");

      season = getNextSeason(season);
      expect(season).toBe("WINTER");

      season = getNextSeason(season);
      expect(season).toBe("SPRING");
    });
  });

  describe("getPreviousSeason", () => {
    it("should return WINTER before SPRING", () => {
      // Act
      const result = getPreviousSeason("SPRING");

      // Assert
      expect(result).toBe("WINTER");
    });

    it("should return SPRING before SUMMER", () => {
      // Act
      const result = getPreviousSeason("SUMMER");

      // Assert
      expect(result).toBe("SPRING");
    });

    it("should return SUMMER before FALL", () => {
      // Act
      const result = getPreviousSeason("FALL");

      // Assert
      expect(result).toBe("SUMMER");
    });

    it("should return FALL before WINTER", () => {
      // Act
      const result = getPreviousSeason("WINTER");

      // Assert
      expect(result).toBe("FALL");
    });

    it("should cycle backward through all seasons", () => {
      // Arrange
      let season: Season = "SPRING";

      // Act & Assert
      season = getPreviousSeason(season);
      expect(season).toBe("WINTER");

      season = getPreviousSeason(season);
      expect(season).toBe("FALL");

      season = getPreviousSeason(season);
      expect(season).toBe("SUMMER");

      season = getPreviousSeason(season);
      expect(season).toBe("SPRING");
    });
  });

  describe("getAdjacentSeasons", () => {
    it("should return WINTER and SUMMER for SPRING", () => {
      // Act
      const result = getAdjacentSeasons("SPRING");

      // Assert
      expect(result).toEqual(["WINTER", "SUMMER"]);
    });

    it("should return SPRING and FALL for SUMMER", () => {
      // Act
      const result = getAdjacentSeasons("SUMMER");

      // Assert
      expect(result).toEqual(["SPRING", "FALL"]);
    });

    it("should return SUMMER and WINTER for FALL", () => {
      // Act
      const result = getAdjacentSeasons("FALL");

      // Assert
      expect(result).toEqual(["SUMMER", "WINTER"]);
    });

    it("should return FALL and SPRING for WINTER", () => {
      // Act
      const result = getAdjacentSeasons("WINTER");

      // Assert
      expect(result).toEqual(["FALL", "SPRING"]);
    });

    it("should return array of length 2", () => {
      // Act
      const result = getAdjacentSeasons("SPRING");

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe("isInSeason", () => {
    it("should return true when product is in season", () => {
      // Arrange
      const productSeasons: Season[] = ["SPRING", "SUMMER"];

      // Act
      const result = isInSeason(productSeasons, "SPRING");

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when product is not in season", () => {
      // Arrange
      const productSeasons: Season[] = ["SPRING", "SUMMER"];

      // Act
      const result = isInSeason(productSeasons, "WINTER");

      // Assert
      expect(result).toBe(false);
    });

    it("should handle single season products", () => {
      // Arrange
      const productSeasons: Season[] = ["SUMMER"];

      // Act & Assert
      expect(isInSeason(productSeasons, "SUMMER")).toBe(true);
      expect(isInSeason(productSeasons, "SPRING")).toBe(false);
    });

    it("should handle year-round products", () => {
      // Arrange
      const productSeasons: Season[] = ["SPRING", "SUMMER", "FALL", "WINTER"];

      // Act & Assert
      expect(isInSeason(productSeasons, "SPRING")).toBe(true);
      expect(isInSeason(productSeasons, "SUMMER")).toBe(true);
      expect(isInSeason(productSeasons, "FALL")).toBe(true);
      expect(isInSeason(productSeasons, "WINTER")).toBe(true);
    });

    it("should handle empty season array", () => {
      // Arrange
      const productSeasons: Season[] = [];

      // Act
      const result = isInSeason(productSeasons, "SPRING");

      // Assert
      expect(result).toBe(false);
    });

    it("should use current season when season not provided", () => {
      // Arrange
      const currentSeason = getCurrentSeason();
      const productSeasons: Season[] = [currentSeason];

      // Act
      const result = isInSeason(productSeasons);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("getSeasonName", () => {
    it("should return 'Spring' for SPRING", () => {
      // Act
      const result = getSeasonName("SPRING");

      // Assert
      expect(result).toBe("Spring");
    });

    it("should return 'Summer' for SUMMER", () => {
      // Act
      const result = getSeasonName("SUMMER");

      // Assert
      expect(result).toBe("Summer");
    });

    it("should return 'Fall' for FALL", () => {
      // Act
      const result = getSeasonName("FALL");

      // Assert
      expect(result).toBe("Fall");
    });

    it("should return 'Winter' for WINTER", () => {
      // Act
      const result = getSeasonName("WINTER");

      // Assert
      expect(result).toBe("Winter");
    });

    it("should return proper case names", () => {
      // Act
      const names = getAllSeasons().map(getSeasonName);

      // Assert
      names.forEach((name) => {
        expect(name[0]).toBe(name[0].toUpperCase());
        expect(name.slice(1)).toBe(name.slice(1).toLowerCase());
      });
    });
  });

  describe("getSeasonEmoji", () => {
    it("should return seedling emoji for SPRING", () => {
      // Act
      const result = getSeasonEmoji("SPRING");

      // Assert
      expect(result).toBe("🌱");
    });

    it("should return sun emoji for SUMMER", () => {
      // Act
      const result = getSeasonEmoji("SUMMER");

      // Assert
      expect(result).toBe("☀️");
    });

    it("should return fallen leaf emoji for FALL", () => {
      // Act
      const result = getSeasonEmoji("FALL");

      // Assert
      expect(result).toBe("🍂");
    });

    it("should return snowflake emoji for WINTER", () => {
      // Act
      const result = getSeasonEmoji("WINTER");

      // Assert
      expect(result).toBe("❄️");
    });

    it("should return emojis for all seasons", () => {
      // Act
      const emojis = getAllSeasons().map(getSeasonEmoji);

      // Assert
      expect(emojis).toHaveLength(4);
      emojis.forEach((emoji) => {
        expect(emoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getSeasonDescription", () => {
    it("should return description for SPRING", () => {
      // Act
      const result = getSeasonDescription("SPRING");

      // Assert
      expect(result).toContain("spring");
      expect(result.length).toBeGreaterThan(10);
    });

    it("should return description for SUMMER", () => {
      // Act
      const result = getSeasonDescription("SUMMER");

      // Assert
      expect(result).toContain("harvest");
      expect(result.length).toBeGreaterThan(10);
    });

    it("should return description for FALL", () => {
      // Act
      const result = getSeasonDescription("FALL");

      // Assert
      expect(result).toContain("autumn");
      expect(result.length).toBeGreaterThan(10);
    });

    it("should return description for WINTER", () => {
      // Act
      const result = getSeasonDescription("WINTER");

      // Assert
      expect(result).toContain("Cold");
      expect(result.length).toBeGreaterThan(10);
    });

    it("should return descriptions for all seasons", () => {
      // Act
      const descriptions = getAllSeasons().map(getSeasonDescription);

      // Assert
      descriptions.forEach((desc) => {
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(20);
      });
    });
  });

  describe("getSeasonMonths", () => {
    it("should return March, April, May for SPRING", () => {
      // Act
      const result = getSeasonMonths("SPRING");

      // Assert
      expect(result).toEqual([2, 3, 4]);
    });

    it("should return June, July, August for SUMMER", () => {
      // Act
      const result = getSeasonMonths("SUMMER");

      // Assert
      expect(result).toEqual([5, 6, 7]);
    });

    it("should return September, October, November for FALL", () => {
      // Act
      const result = getSeasonMonths("FALL");

      // Assert
      expect(result).toEqual([8, 9, 10]);
    });

    it("should return December, January, February for WINTER", () => {
      // Act
      const result = getSeasonMonths("WINTER");

      // Assert
      expect(result).toEqual([11, 0, 1]);
    });

    it("should return 3 months for each season", () => {
      // Act
      const allMonths = getAllSeasons().map(getSeasonMonths);

      // Assert
      allMonths.forEach((months) => {
        expect(months).toHaveLength(3);
      });
    });
  });

  describe("daysUntilNextSeason", () => {
    it("should calculate days from late February to March", () => {
      // Arrange
      const lateFeb = new Date(2024, 1, 25); // Feb 25

      // Act
      const result = daysUntilNextSeason(lateFeb);

      // Assert
      expect(result).toBeLessThanOrEqual(6);
      expect(result).toBeGreaterThan(0);
    });

    it("should calculate days from late May to June", () => {
      // Arrange
      const lateMay = new Date(2024, 4, 25); // May 25

      // Act
      const result = daysUntilNextSeason(lateMay);

      // Assert
      expect(result).toBeLessThanOrEqual(8);
      expect(result).toBeGreaterThan(0);
    });

    it("should return larger number at start of season", () => {
      // Arrange
      const earlyMarch = new Date(2024, 2, 5); // March 5

      // Act
      const result = daysUntilNextSeason(earlyMarch);

      // Assert
      expect(result).toBeGreaterThan(80);
    });

    it("should use current date when no date provided", () => {
      // Act
      const result = daysUntilNextSeason();

      // Assert
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(92);
    });

    it("should handle year boundary (December to March)", () => {
      // Arrange
      const lateDec = new Date(2024, 11, 28); // Dec 28

      // Act
      const result = daysUntilNextSeason(lateDec);

      // Assert
      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThan(70);
    });
  });

  describe("getSeasonProgress", () => {
    it("should return 0 at start of season", () => {
      // Arrange
      const marchFirst = new Date(2024, 2, 1);

      // Act
      const result = getSeasonProgress(marchFirst);

      // Assert
      expect(result).toBeCloseTo(0, 1);
    });

    it("should return ~0.5 in middle of season", () => {
      // Arrange
      const midApril = new Date(2024, 3, 15);

      // Act
      const result = getSeasonProgress(midApril);

      // Assert
      expect(result).toBeGreaterThan(0.3);
      expect(result).toBeLessThan(0.7);
    });

    it("should return close to 1 at end of season", () => {
      // Arrange
      const lateMay = new Date(2024, 4, 30);

      // Act
      const result = getSeasonProgress(lateMay);

      // Assert
      expect(result).toBeGreaterThan(0.9);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("should never exceed 1", () => {
      // Arrange
      const dates = [
        new Date(2024, 2, 31),
        new Date(2024, 4, 31),
        new Date(2024, 7, 31),
        new Date(2024, 10, 30),
      ];

      // Act & Assert
      dates.forEach((date) => {
        const progress = getSeasonProgress(date);
        expect(progress).toBeLessThanOrEqual(1);
      });
    });

    it("should never be negative", () => {
      // Arrange
      const dates = [
        new Date(2024, 2, 1),
        new Date(2024, 5, 1),
        new Date(2024, 8, 1),
        new Date(2024, 11, 1),
      ];

      // Act & Assert
      dates.forEach((date) => {
        const progress = getSeasonProgress(date);
        expect(progress).toBeGreaterThanOrEqual(0);
      });
    });

    it("should increase through the season", () => {
      // Arrange
      const earlySpring = new Date(2024, 2, 10);
      const midSpring = new Date(2024, 3, 15);
      const lateSpring = new Date(2024, 4, 20);

      // Act
      const early = getSeasonProgress(earlySpring);
      const mid = getSeasonProgress(midSpring);
      const late = getSeasonProgress(lateSpring);

      // Assert
      expect(early).toBeLessThan(mid);
      expect(mid).toBeLessThan(late);
    });
  });

  describe("isSeasonStart", () => {
    it("should return true at very beginning of season", () => {
      // Arrange
      const marchFirst = new Date(2024, 2, 1);

      // Act
      const result = isSeasonStart(marchFirst);

      // Assert
      expect(result).toBe(true);
    });

    it("should return true in first week of season", () => {
      // Arrange
      const marchFifth = new Date(2024, 2, 5);

      // Act
      const result = isSeasonStart(marchFifth);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false in middle of season", () => {
      // Arrange
      const midApril = new Date(2024, 3, 15);

      // Act
      const result = isSeasonStart(midApril);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false at end of season", () => {
      // Arrange
      const lateMay = new Date(2024, 4, 30);

      // Act
      const result = isSeasonStart(lateMay);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isSeasonEnd", () => {
    it("should return false at start of season", () => {
      // Arrange
      const marchFirst = new Date(2024, 2, 1);

      // Act
      const result = isSeasonEnd(marchFirst);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false in middle of season", () => {
      // Arrange
      const midApril = new Date(2024, 3, 15);

      // Act
      const result = isSeasonEnd(midApril);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true at very end of season", () => {
      // Arrange
      const lateMay = new Date(2024, 4, 30);

      // Act
      const result = isSeasonEnd(lateMay);

      // Assert
      expect(result).toBe(true);
    });

    it("should return true in last week of season", () => {
      // Arrange
      const lateMay = new Date(2024, 4, 28);

      // Act
      const result = isSeasonEnd(lateMay);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should maintain season cycle consistency", () => {
      // Arrange
      let season: Season = "SPRING";

      // Act & Assert - full cycle
      for (let i = 0; i < 4; i++) {
        const next = getNextSeason(season);
        const prev = getPreviousSeason(next);
        expect(prev).toBe(season);
        season = next;
      }
    });

    it("should work with product seasonality workflow", () => {
      // Arrange
      const tomatoSeasons: Season[] = ["SUMMER", "FALL"];
      const currentDate = new Date(2024, 6, 15); // July 15 (Summer)

      // Act
      const currentSeason = getCurrentSeason(currentDate);
      const inSeason = isInSeason(tomatoSeasons, currentSeason);
      const seasonName = getSeasonName(currentSeason);
      const emoji = getSeasonEmoji(currentSeason);

      // Assert
      expect(currentSeason).toBe("SUMMER");
      expect(inSeason).toBe(true);
      expect(seasonName).toBe("Summer");
      expect(emoji).toBe("☀️");
    });

    it("should calculate season metadata correctly", () => {
      // Arrange
      const season: Season = "SPRING";

      // Act
      const name = getSeasonName(season);
      const emoji = getSeasonEmoji(season);
      const description = getSeasonDescription(season);
      const months = getSeasonMonths(season);

      // Assert
      expect(name).toBeTruthy();
      expect(emoji).toBeTruthy();
      expect(description).toBeTruthy();
      expect(months).toHaveLength(3);
    });

    it("should handle full year cycle", () => {
      // Arrange
      const dates = [
        new Date(2024, 0, 15), // January
        new Date(2024, 1, 15), // February
        new Date(2024, 2, 15), // March
        new Date(2024, 3, 15), // April
        new Date(2024, 4, 15), // May
        new Date(2024, 5, 15), // June
        new Date(2024, 6, 15), // July
        new Date(2024, 7, 15), // August
        new Date(2024, 8, 15), // September
        new Date(2024, 9, 15), // October
        new Date(2024, 10, 15), // November
        new Date(2024, 11, 15), // December
      ];

      const expectedSeasons: Season[] = [
        "WINTER",
        "WINTER",
        "SPRING",
        "SPRING",
        "SPRING",
        "SUMMER",
        "SUMMER",
        "SUMMER",
        "FALL",
        "FALL",
        "FALL",
        "WINTER",
      ];

      // Act & Assert
      dates.forEach((date, index) => {
        const season = getCurrentSeason(date);
        expect(season).toBe(expectedSeasons[index]);
      });
    });

    it("should provide consistent adjacent season data", () => {
      // Arrange
      const allSeasons = getAllSeasons();

      // Act & Assert
      allSeasons.forEach((season) => {
        const adjacent = getAdjacentSeasons(season);
        const prev = getPreviousSeason(season);
        const next = getNextSeason(season);

        expect(adjacent[0]).toBe(prev);
        expect(adjacent[1]).toBe(next);
      });
    });
  });
});
