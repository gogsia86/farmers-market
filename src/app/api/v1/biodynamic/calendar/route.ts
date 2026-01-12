/**
 * 🌙 Biodynamic Calendar API
 *
 * Provides biodynamic calendar information, lunar phases, seasonal data,
 * and optimal planting windows for crops.
 *
 * @route GET /api/v1/biodynamic/calendar
 */

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
    biodynamicCalendar,
    CropType,
    type Season
} from '@/lib/services/biodynamic-calendar.service';
import type {
    PlantingCalendarResponse
} from '@/types/biodynamic.types';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/biodynamic/calendar
 * Get biodynamic calendar information
 */
export async function GET(request: NextRequest) {
  try {
    // Optional authentication - public endpoint but can provide personalized data
    const session = await auth();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'current';
    const cropType = searchParams.get('cropType') as CropType | null;
    const daysAhead = parseInt(searchParams.get('daysAhead') || '14');
    const dateParam = searchParams.get('date');

    const targetDate = dateParam ? new Date(dateParam) : new Date();

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid date format'
          }
        },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'current': {
        // Get current biodynamic context
        const context = biodynamicCalendar.getBiodynamicContext(targetDate);

        return NextResponse.json({
          success: true,
          data: {
            date: targetDate.toISOString(),
            season: context.season,
            seasonEmoji: biodynamicCalendar.getSeasonEmoji(context.season),
            lunarPhase: context.lunarPhase,
            lunarPhaseEmoji: biodynamicCalendar.getLunarPhaseEmoji(context.lunarPhase),
            lunarAge: context.lunarAge,
            isOptimalPlanting: context.isOptimalPlanting,
            optimalOperations: context.optimalOperations,
            seasonalGuidance: getSeasonalGuidance(context.season)
          }
        });
      }

      case 'planting-windows': {
        // Get optimal planting windows
        if (!cropType) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'cropType is required for planting-windows action'
              }
            },
            { status: 400 }
          );
        }

        const windows = biodynamicCalendar.getOptimalPlantingDays(
          cropType,
          daysAhead,
          targetDate
        );

        return NextResponse.json({
          success: true,
          data: {
            cropType,
            startDate: targetDate.toISOString(),
            daysAhead,
            windows: windows.map(w => ({
              start: w.start.toISOString(),
              end: w.end.toISOString(),
              lunarPhase: w.lunarPhase,
              lunarPhaseEmoji: biodynamicCalendar.getLunarPhaseEmoji(w.lunarPhase),
              score: w.score,
              reason: w.reason
            })),
            currentContext: biodynamicCalendar.getBiodynamicContext(targetDate)
          }
        });
      }

      case 'all-crop-windows': {
        // Get planting windows for all crop types
        const allWindows: PlantingCalendarResponse['optimalWindows'] = [];

        for (const type of Object.values(CropType)) {
          const windows = biodynamicCalendar.getOptimalPlantingDays(
            type as CropType,
            daysAhead,
            targetDate
          );

          allWindows.push({
            cropType: type as CropType,
            windows: windows.map(w => ({
              start: w.start,
              end: w.end,
              lunarPhase: w.lunarPhase,
              score: w.score,
              reason: w.reason
            }))
          });
        }

        const response: PlantingCalendarResponse = {
          success: true,
          optimalWindows: allWindows,
          currentContext: {
            date: targetDate,
            season: biodynamicCalendar.getCurrentSeason(targetDate),
            lunarPhase: biodynamicCalendar.getCurrentLunarPhase(targetDate)
          }
        };

        return NextResponse.json(response);
      }

      case 'check-optimal': {
        // Check if specific date is optimal for a crop type
        if (!cropType) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'cropType is required for check-optimal action'
              }
            },
            { status: 400 }
          );
        }

        const isOptimal = biodynamicCalendar.isOptimalPlantingDate(
          cropType,
          targetDate
        );

        const nextOptimal = biodynamicCalendar.getNextOptimalPlantingDate(
          cropType,
          targetDate
        );

        return NextResponse.json({
          success: true,
          data: {
            date: targetDate.toISOString(),
            cropType,
            isOptimal,
            lunarPhase: biodynamicCalendar.getCurrentLunarPhase(targetDate),
            nextOptimalDate: nextOptimal?.toISOString() || null,
            guidance: isOptimal
              ? `Excellent time to plant ${cropType.toLowerCase()} crops!`
              : nextOptimal
              ? `Consider waiting until ${nextOptimal.toLocaleDateString()} for optimal conditions.`
              : 'No optimal window found in the next 30 days.'
          }
        });
      }

      case 'seasonal-operations': {
        // Get recommended operations for current season
        const operations = biodynamicCalendar.getSeasonalOperations(targetDate);
        const season = biodynamicCalendar.getCurrentSeason(targetDate);

        return NextResponse.json({
          success: true,
          data: {
            date: targetDate.toISOString(),
            season,
            seasonEmoji: biodynamicCalendar.getSeasonEmoji(season),
            operations,
            guidance: getSeasonalOperationGuidance(season, operations)
          }
        });
      }

      case 'lunar-calendar': {
        // Get lunar calendar for the next period
        const days = Math.min(daysAhead, 60); // Max 60 days
        const lunarCalendar = [];

        for (let i = 0; i < days; i++) {
          const date = new Date(targetDate);
          date.setDate(date.getDate() + i);

          const lunarPhase = biodynamicCalendar.getCurrentLunarPhase(date);
          const lunarAge = biodynamicCalendar.calculateLunarAge(date);
          const context = biodynamicCalendar.getBiodynamicContext(date);

          lunarCalendar.push({
            date: date.toISOString(),
            dateDisplay: date.toLocaleDateString(),
            lunarPhase,
            lunarPhaseEmoji: biodynamicCalendar.getLunarPhaseEmoji(lunarPhase),
            lunarAge: Math.round(lunarAge * 10) / 10,
            season: context.season,
            isOptimalPlanting: context.isOptimalPlanting,
            recommendedActivities: context.optimalOperations
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            startDate: targetDate.toISOString(),
            endDate: lunarCalendar[lunarCalendar.length - 1]?.date,
            days: lunarCalendar
          }
        });
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Unknown action: ${action}. Valid actions: current, planting-windows, all-crop-windows, check-optimal, seasonal-operations, lunar-calendar`
            }
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    logger.error('Failed to get biodynamic calendar data', { error });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve calendar data. Please try again.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Get seasonal guidance text
 */
function getSeasonalGuidance(season: Season): string {
  const guidance: Record<Season, string> = {
    SPRING: 'Spring is the season of renewal and growth. Focus on planting new crops, preparing soil, and establishing your growing plan for the year.',
    SUMMER: 'Summer brings peak growth and activity. Maintain consistent watering, monitor for pests, and begin harvesting early crops.',
    FALL: 'Fall is harvest time and preparation for winter. Collect and preserve your harvest, compost plant matter, and prepare fields for the cold season.',
    WINTER: 'Winter is a time of rest and planning. Review your growing season, plan crop rotations, maintain equipment, and prepare for spring.'
  };

  return guidance[season];
}

/**
 * Get guidance for seasonal operations
 */
function getSeasonalOperationGuidance(
  season: Season,
  operations: string[]
): string {
  const operationDescriptions: Record<string, string> = {
    PLANT: 'Sow seeds and transplant seedlings during optimal lunar phases',
    PREPARE_SOIL: 'Build soil health with compost and biodynamic preparations',
    FERTILIZE: 'Apply organic fertilizers and amendments',
    PRUNE: 'Shape plants and remove dead/diseased growth',
    WATER: 'Maintain consistent moisture, especially during dry periods',
    WEED: 'Keep fields clear to reduce competition for nutrients',
    MONITOR: 'Check regularly for pests, diseases, and nutrient deficiencies',
    HARVEST_EARLY: 'Begin harvesting quick-maturing crops',
    HARVEST: 'Collect mature crops at peak quality',
    PRESERVE: 'Can, freeze, or dry produce for storage',
    COMPOST: 'Turn finished compost and build new piles',
    PREPARE_WINTER: 'Mulch beds, protect perennials, clean up garden',
    REST: 'Allow fields to rest and regenerate',
    PLAN: 'Design crop rotations and plan next season',
    REPAIR: 'Maintain and repair equipment and infrastructure',
    INDOOR_GROWING: 'Start seedlings indoors and tend indoor gardens'
  };

  const descriptions = operations
    .map(op => `• ${op}: ${operationDescriptions[op] || 'Important seasonal task'}`)
    .join('\n');

  return `Recommended ${season.toLowerCase()} activities:\n${descriptions}`;
}

/**
 * OPTIONS /api/v1/biodynamic/calendar
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
