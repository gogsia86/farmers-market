/**
 * EMAIL CAMPAIGNS API
 * Divine email marketing consciousness
 * 
 * Endpoints:
 * - POST /api/marketing/campaigns - Create campaign
 * - GET /api/marketing/campaigns - List campaigns
 * - GET /api/marketing/campaigns/:id - Get campaign details
 * - PUT /api/marketing/campaigns/:id - Update campaign
 * - POST /api/marketing/campaigns/:id/send - Send campaign
 * - DELETE /api/marketing/campaigns/:id - Delete campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type {
  EmailCampaign,
  CampaignStatus,
  CampaignSegment,
  CreateCampaignInput,
} from '@/types/marketing.types';

// Validation schema
const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  preheader: z.string().max(150).optional(),
  templateId: z.string(),
  segment: z.enum([
    'ALL_USERS',
    'FARMERS_ONLY',
    'CONSUMERS_ONLY',
    'NEW_USERS',
    'INACTIVE_USERS',
    'VIP_CUSTOMERS',
    'LOCATION_BASED',
    'CUSTOM',
  ]),
  segmentFilters: z.object({
    userType: z.enum(['FARMER', 'CONSUMER']).optional(),
    location: z.object({
      state: z.string().optional(),
      city: z.string().optional(),
      radius: z.number().optional(),
    }).optional(),
    registeredAfter: z.string().optional(),
    registeredBefore: z.string().optional(),
    lastActiveAfter: z.string().optional(),
    lastActiveBefore: z.string().optional(),
    hasOrdered: z.boolean().optional(),
    orderCount: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    totalSpent: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }).optional(),
  scheduledFor: z.string().optional(),
});

// Mock database (replace with Prisma in production)
const campaigns: EmailCampaign[] = [];

/**
 * POST - Create new email campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateCampaignSchema.parse(body);

    // Create campaign
    const campaign: EmailCampaign = {
      id: `campaign_${Date.now()}`,
      name: validated.name,
      subject: validated.subject,
      preheader: validated.preheader,
      template: {
        id: validated.templateId,
        name: 'Template Name',
        type: 'PROMOTIONAL',
        html: '<h1>{{subject}}</h1>',
        variables: ['subject', 'userName', 'farmName'],
      },
      segment: validated.segment,
      segmentFilters: validated.segmentFilters,
      status: validated.scheduledFor ? 'SCHEDULED' : 'DRAFT',
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : undefined,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        complained: 0,
        converted: 0,
        revenue: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        revenuePerEmail: 0,
      },
      createdBy: 'admin', // TODO: Get from auth session
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    campaigns.push(campaign);

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Campaign creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create campaign',
    }, { status: 500 });
  }
}

/**
 * GET - List all campaigns with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as CampaignStatus | null;
    const segment = searchParams.get('segment') as CampaignSegment | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Filter campaigns
    let filtered = campaigns;

    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }

    if (segment) {
      filtered = filtered.filter((c) => c.segment === segment);
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return NextResponse.json({
      success: true,
      campaigns: paginated,
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error('Campaign list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch campaigns',
    }, { status: 500 });
  }
}
