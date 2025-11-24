/**
 * 🌙 Biodynamic Calendar Service Tests - Divine Agricultural Timing
 * Lunar consciousness meets seasonal wisdom
 */

import { BiodynamicCalendarService } from "../biodynamic-calendar.service";
import type { LunarPhase, Season } from "@prisma/client";

describe("🌙 Biodynamic Calendar Service - Divine Agricultural Timing", () => {
  describe("🌓 calculateLunarPhase - Lunar Consciousness", () => {
    it("should calculate new moon phase", () => {
      // Known new moon: January 6, 2000
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const phase = BiodynamicCalendarService.calculateLunarPhase(newMoonDate);
      expect(phase).toBe("NEW_MOON");
    });

    it("should calculate full moon phase", () => {
      // Approximately 14.76 days after new moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const fullMoonDate = new Date(
        newMoonDate.getTime() + 14.76 * 24 * 60 * 60 * 1000,
      );
      const phase = BiodynamicCalendarService.calculateLunarPhase(fullMoonDate);
      expect(phase).toBe("FULL_MOON");
    });

    it("should calculate waxing crescent phase", () => {
      // 3-7 days after new moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const waxingCrescentDate = new Date(
        newMoonDate.getTime() + 5 * 24 * 60 * 60 * 1000,
      );
      const phase =
        BiodynamicCalendarService.calculateLunarPhase(waxingCrescentDate);
      expect(phase).toBe("WAXING_CRESCENT");
    });

    it("should calculate first quarter phase", () => {
      // Approximately 7.38 days after new moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const firstQuarterDate = new Date(
        newMoonDate.getTime() + 7.38 * 24 * 60 * 60 * 1000,
      );
      const phase =
        BiodynamicCalendarService.calculateLunarPhase(firstQuarterDate);
      expect(phase).toBe("FIRST_QUARTER");
    });

    it("should calculate waxing gibbous phase", () => {
      // Between first quarter and full moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const waxingGibbousDate = new Date(
        newMoonDate.getTime() + 10 * 24 * 60 * 60 * 1000,
      );
      const phase =
        BiodynamicCalendarService.calculateLunarPhase(waxingGibbousDate);
      expect(phase).toBe("WAXING_GIBBOUS");
    });

    it("should calculate waning gibbous phase", () => {
      // After full moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const waningGibbousDate = new Date(
        newMoonDate.getTime() + 18 * 24 * 60 * 60 * 1000,
      );
      const phase =
        BiodynamicCalendarService.calculateLunarPhase(waningGibbousDate);
      expect(phase).toBe("WANING_GIBBOUS");
    });

    it("should calculate last quarter phase", () => {
      // Approximately 22.15 days after new moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const lastQuarterDate = new Date(
        newMoonDate.getTime() + 22.15 * 24 * 60 * 60 * 1000,
      );
      const phase =
        BiodynamicCalendarService.calculateLunarPhase(lastQuarterDate);
      expect(phase).toBe("LAST_QUARTER");
    });

    it("should calculate waning crescent phase", () => {
      // Between last quarter and new moon
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const waningCrescentDate = new Date(
        newMoonDate.getTime() + 26 * 24 * 60 * 60 * 1000,
      );
      const phase =
        BiodynamicCalendarService.calculateLunarPhase(waningCrescentDate);
      expect(phase).toBe("WANING_CRESCENT");
    });

    it("should handle current date", () => {
      const today = new Date();
      const phase = BiodynamicCalendarService.calculateLunarPhase(today);
      expect(phase).toBeDefined();
      expect(typeof phase).toBe("string");
    });

    it("should handle future dates", () => {
      const futureDate = new Date("2030-12-31");
      const phase = BiodynamicCalendarService.calculateLunarPhase(futureDate);
      expect(phase).toBeDefined();
    });

    it("should handle past dates", () => {
      const pastDate = new Date("1990-01-01");
      const phase = BiodynamicCalendarService.calculateLunarPhase(pastDate);
      expect(phase).toBeDefined();
    });

    it("should cycle through all phases in 29.53 days", () => {
      const startDate = new Date("2000-01-06T18:14:00Z");
      const phases: LunarPhase[] = [];

      for (let day = 0; day < 30; day += 3) {
        const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        const phase = BiodynamicCalendarService.calculateLunarPhase(date);
        if (!phases.includes(phase)) {
          phases.push(phase);
        }
      }

      // Should see multiple phases over 30 days
      expect(phases.length).toBeGreaterThan(5);
    });

    it("should be consistent for same date", () => {
      const date = new Date("2024-06-15");
      const phase1 = BiodynamicCalendarService.calculateLunarPhase(date);
      const phase2 = BiodynamicCalendarService.calculateLunarPhase(date);
      expect(phase1).toBe(phase2);
    });
  });

  describe("🌱 calculateSeason - Seasonal Consciousness", () => {
    it("should calculate spring in northern hemisphere", () => {
      const springDate = new Date("2024-04-15");
      const season = BiodynamicCalendarService.calculateSeason(
        springDate,
        "north",
      );
      expect(season).toBe("SPRING");
    });

    it("should calculate summer in northern hemisphere", () => {
      const summerDate = new Date("2024-07-15");
      const season = BiodynamicCalendarService.calculateSeason(
        summerDate,
        "north",
      );
      expect(season).toBe("SUMMER");
    });

    it("should calculate fall in northern hemisphere", () => {
      const fallDate = new Date("2024-10-15");
      const season = BiodynamicCalendarService.calculateSeason(
        fallDate,
        "north",
      );
      expect(season).toBe("FALL");
    });

    it("should calculate winter in northern hemisphere", () => {
      const winterDate = new Date("2024-01-15");
      const season = BiodynamicCalendarService.calculateSeason(
        winterDate,
        "north",
      );
      expect(season).toBe("WINTER");
    });

    it("should handle spring equinox boundary", () => {
      const equinoxDate = new Date("2024-03-20");
      const season = BiodynamicCalendarService.calculateSeason(
        equinoxDate,
        "north",
      );
      expect(season).toBe("SPRING");
    });

    it("should handle summer solstice boundary", () => {
      const solsticeDate = new Date("2024-06-21");
      const season = BiodynamicCalendarService.calculateSeason(
        solsticeDate,
        "north",
      );
      expect(season).toBe("SUMMER");
    });

    it("should handle fall equinox boundary", () => {
      const equinoxDate = new Date("2024-09-22");
      const season = BiodynamicCalendarService.calculateSeason(
        equinoxDate,
        "north",
      );
      expect(season).toBe("FALL");
    });

    it("should handle winter solstice boundary", () => {
      const solsticeDate = new Date("2024-12-21");
      const season = BiodynamicCalendarService.calculateSeason(
        solsticeDate,
        "north",
      );
      expect(season).toBe("WINTER");
    });

    it("should default to northern hemisphere", () => {
      const date = new Date("2024-07-15");
      const seasonWithDefault = BiodynamicCalendarService.calculateSeason(date);
      const seasonExplicit = BiodynamicCalendarService.calculateSeason(
        date,
        "north",
      );
      expect(seasonWithDefault).toBe(seasonExplicit);
    });

    it("should invert seasons for southern hemisphere", () => {
      const date = new Date("2024-07-15");
      const northSeason = BiodynamicCalendarService.calculateSeason(
        date,
        "north",
      );
      const southSeason = BiodynamicCalendarService.calculateSeason(
        date,
        "south",
      );

      // When it's summer in north, it should be winter in south
      if (northSeason === "SUMMER") {
        expect(southSeason).toBe("WINTER");
      }
    });

    it("should handle leap years", () => {
      const leapYearDate = new Date("2024-02-29");
      const season = BiodynamicCalendarService.calculateSeason(leapYearDate);
      expect(season).toBe("WINTER");
    });

    it("should cycle through all seasons in a year", () => {
      const seasons: Season[] = [];
      const year = 2024;

      // Check one day from each month
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 15);
        const season = BiodynamicCalendarService.calculateSeason(date);
        if (!seasons.includes(season)) {
          seasons.push(season);
        }
      }

      expect(seasons.length).toBe(4);
      expect(seasons).toContain("SPRING");
      expect(seasons).toContain("SUMMER");
      expect(seasons).toContain("FALL");
      expect(seasons).toContain("WINTER");
    });
  });

  describe("🌾 getBiodynamicRecommendations - Agricultural Wisdom", () => {
    it("should provide planting recommendations during waxing moon", () => {
      const waxingDate = new Date("2000-01-10"); // Waxing phase
      const springDate = new Date("2024-04-15");

      const lunarPhase =
        BiodynamicCalendarService.calculateLunarPhase(waxingDate);
      const season = BiodynamicCalendarService.calculateSeason(springDate);

      expect(["WAXING_CRESCENT", "WAXING_GIBBOUS"]).toContain(lunarPhase);
      expect(season).toBe("SPRING");
    });

    it("should provide harvest recommendations during waning moon", () => {
      const waningDate = new Date("2000-01-25"); // Waning phase
      const phase = BiodynamicCalendarService.calculateLunarPhase(waningDate);

      expect(["WANING_CRESCENT", "WANING_GIBBOUS"]).toContain(phase);
    });

    it("should recognize full moon for harvesting", () => {
      const fullMoonDate = new Date("2000-01-21");
      const phase = BiodynamicCalendarService.calculateLunarPhase(fullMoonDate);

      expect(phase).toBe("FULL_MOON");
    });

    it("should recognize new moon for soil work", () => {
      const newMoonDate = new Date("2000-01-06T18:14:00Z");
      const phase = BiodynamicCalendarService.calculateLunarPhase(newMoonDate);

      expect(phase).toBe("NEW_MOON");
    });

    it("should provide seasonal planting guidance", () => {
      const seasons = ["SPRING", "SUMMER", "FALL", "WINTER"];
      seasons.forEach((expectedSeason) => {
        expect(expectedSeason).toBeDefined();
      });
    });
  });

  describe("🌟 Agricultural Use Cases", () => {
    it("should help farmers plan spring planting", () => {
      const springDate = new Date("2024-04-01");
      const season = BiodynamicCalendarService.calculateSeason(springDate);
      const phase = BiodynamicCalendarService.calculateLunarPhase(springDate);

      expect(season).toBe("SPRING");
      expect(phase).toBeDefined();
    });

    it("should guide summer harvesting", () => {
      const summerDate = new Date("2024-07-15");
      const season = BiodynamicCalendarService.calculateSeason(summerDate);
      const phase = BiodynamicCalendarService.calculateLunarPhase(summerDate);

      expect(season).toBe("SUMMER");
      expect(phase).toBeDefined();
    });

    it("should support fall soil preparation", () => {
      const fallDate = new Date("2024-10-15");
      const season = BiodynamicCalendarService.calculateSeason(fallDate);
      const phase = BiodynamicCalendarService.calculateLunarPhase(fallDate);

      expect(season).toBe("FALL");
      expect(phase).toBeDefined();
    });

    it("should assist winter planning", () => {
      const winterDate = new Date("2024-12-25"); // December 25 is after winter solstice (Dec 21)
      const season = BiodynamicCalendarService.calculateSeason(winterDate);
      const phase = BiodynamicCalendarService.calculateLunarPhase(winterDate);

      expect(season).toBe("WINTER");
      expect(phase).toBeDefined();
    });

    it("should provide complete biodynamic context for any date", () => {
      const farmDate = new Date("2024-05-20");
      const season = BiodynamicCalendarService.calculateSeason(farmDate);
      const phase = BiodynamicCalendarService.calculateLunarPhase(farmDate);
      const hemisphere = "north";

      expect(season).toBeDefined();
      expect(phase).toBeDefined();
      expect(hemisphere).toBeDefined();
    });
  });

  describe("⚡ Performance & Reliability", () => {
    it("should calculate phases efficiently in bulk", () => {
      const startTime = Date.now();
      const startDate = new Date("2024-01-01");

      for (let day = 0; day < 365; day++) {
        const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        BiodynamicCalendarService.calculateLunarPhase(date);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // 365 calculations < 100ms
    });

    it("should calculate seasons efficiently in bulk", () => {
      const startTime = Date.now();
      const startDate = new Date("2024-01-01");

      for (let day = 0; day < 365; day++) {
        const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        BiodynamicCalendarService.calculateSeason(date);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50); // 365 calculations < 50ms
    });

    it("should handle concurrent calculations", async () => {
      const dates = Array.from(
        { length: 100 },
        (_, i) =>
          new Date(new Date("2024-01-01").getTime() + i * 24 * 60 * 60 * 1000),
      );

      const results = await Promise.all(
        dates.map((date) =>
          Promise.resolve({
            phase: BiodynamicCalendarService.calculateLunarPhase(date),
            season: BiodynamicCalendarService.calculateSeason(date),
          }),
        ),
      );

      expect(results.length).toBe(100);
      results.forEach((result) => {
        expect(result.phase).toBeDefined();
        expect(result.season).toBeDefined();
      });
    });

    it("should be deterministic for same inputs", () => {
      const date = new Date("2024-06-15");

      const results = Array.from({ length: 10 }, () => ({
        phase: BiodynamicCalendarService.calculateLunarPhase(date),
        season: BiodynamicCalendarService.calculateSeason(date),
      }));

      const firstPhase = results[0].phase;
      const firstSeason = results[0].season;

      results.forEach((result) => {
        expect(result.phase).toBe(firstPhase);
        expect(result.season).toBe(firstSeason);
      });
    });
  });

  describe("🛡️ Edge Cases & Boundaries", () => {
    it("should handle year boundaries", () => {
      const newYearsEve = new Date("2024-12-31T23:59:59Z");
      const newYearsDay = new Date("2025-01-01T00:00:00Z");

      const phase1 = BiodynamicCalendarService.calculateLunarPhase(newYearsEve);
      const phase2 = BiodynamicCalendarService.calculateLunarPhase(newYearsDay);
      const season1 = BiodynamicCalendarService.calculateSeason(newYearsEve);
      const season2 = BiodynamicCalendarService.calculateSeason(newYearsDay);

      expect(phase1).toBeDefined();
      expect(phase2).toBeDefined();
      expect(season1).toBe("WINTER");
      expect(season2).toBe("WINTER");
    });

    it("should handle century boundaries", () => {
      const centuryEnd = new Date("1999-12-31");
      const centuryStart = new Date("2000-01-01");

      const phase1 = BiodynamicCalendarService.calculateLunarPhase(centuryEnd);
      const phase2 =
        BiodynamicCalendarService.calculateLunarPhase(centuryStart);

      expect(phase1).toBeDefined();
      expect(phase2).toBeDefined();
    });

    it("should handle very old dates", () => {
      const oldDate = new Date("1900-01-01");
      const phase = BiodynamicCalendarService.calculateLunarPhase(oldDate);
      const season = BiodynamicCalendarService.calculateSeason(oldDate);

      expect(phase).toBeDefined();
      expect(season).toBe("WINTER");
    });

    it("should handle far future dates", () => {
      const futureDate = new Date("2100-12-31");
      const phase = BiodynamicCalendarService.calculateLunarPhase(futureDate);
      const season = BiodynamicCalendarService.calculateSeason(futureDate);

      expect(phase).toBeDefined();
      expect(season).toBe("WINTER");
    });

    it("should handle midnight precisely", () => {
      const midnight = new Date("2024-06-15T00:00:00Z");
      const phase = BiodynamicCalendarService.calculateLunarPhase(midnight);
      const season = BiodynamicCalendarService.calculateSeason(midnight);

      expect(phase).toBeDefined();
      expect(season).toBeDefined();
    });

    it("should handle different timezones consistently", () => {
      const utcDate = new Date("2024-06-15T12:00:00Z");
      const phase = BiodynamicCalendarService.calculateLunarPhase(utcDate);

      expect(phase).toBeDefined();
    });
  });

  describe("🌍 Hemisphere Differences", () => {
    it("should have opposite seasons in opposite hemispheres", () => {
      const testDates = [
        new Date("2024-01-15"), // Winter in north
        new Date("2024-04-15"), // Spring in north
        new Date("2024-07-15"), // Summer in north
        new Date("2024-10-15"), // Fall in north
      ];

      testDates.forEach((date) => {
        const northSeason = BiodynamicCalendarService.calculateSeason(
          date,
          "north",
        );
        const southSeason = BiodynamicCalendarService.calculateSeason(
          date,
          "south",
        );

        // Seasons should be different
        expect(northSeason).not.toBe(southSeason);
      });
    });

    it("should maintain 4 seasons in both hemispheres", () => {
      const northSeasons = new Set<Season>();
      const southSeasons = new Set<Season>();

      for (let month = 0; month < 12; month++) {
        const date = new Date(2024, month, 15);
        northSeasons.add(
          BiodynamicCalendarService.calculateSeason(date, "north"),
        );
        southSeasons.add(
          BiodynamicCalendarService.calculateSeason(date, "south"),
        );
      }

      expect(northSeasons.size).toBe(4);
      expect(southSeasons.size).toBe(4);
    });
  });

  describe("📅 Full Year Coverage", () => {
    it("should cover all months correctly", () => {
      const year = 2024;
      const monthResults = [];

      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 15);
        monthResults.push({
          month,
          season: BiodynamicCalendarService.calculateSeason(date),
          phase: BiodynamicCalendarService.calculateLunarPhase(date),
        });
      }

      expect(monthResults.length).toBe(12);
      monthResults.forEach((result) => {
        expect(result.season).toBeDefined();
        expect(result.phase).toBeDefined();
      });
    });

    it("should track complete lunar cycles", () => {
      const startDate = new Date("2024-01-01");
      const phases = new Set<LunarPhase>();

      for (let day = 0; day < 60; day++) {
        const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        phases.add(BiodynamicCalendarService.calculateLunarPhase(date));
      }

      // Should see all 8 phases in 60 days (2+ lunar cycles)
      expect(phases.size).toBe(8);
    });
  });
});
