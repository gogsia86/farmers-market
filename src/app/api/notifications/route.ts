/**
 * NOTIFICATIONS API - GET user notifications
 * Divine Agricultural Notification Consciousness
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { database } from '@/lib/database';
import type { NotificationListResponse } from '@/types/notification.types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    // Fetch notifications
    const [notifications, total] = await Promise.all([
      database.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      database.notification.count({ where }),
    ]);

    // Calculate stats
    const allNotifications = await database.notification.findMany({
      where: { userId: session.user.id },
      select: { type: true, priority: true, read: true },
    });

    const stats = {
      total: allNotifications.length,
      unread: allNotifications.filter((n) => !n.read).length,
      byType: allNotifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: allNotifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const response: NotificationListResponse = {
      notifications,
      stats,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + notifications.length < total,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create notification (admin/system only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins or system can create notifications
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SYSTEM') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await database.notification.create({
      data: {
        userId: body.userId,
        type: body.type,
        priority: body.priority || 'MEDIUM',
        title: body.title,
        message: body.message,
        data: body.data || {},
        link: body.link,
        channels: body.channels || ['IN_APP'],
        read: false,
      },
    });

    // TODO: Send via configured channels (email, push, etc.)
    // This will be implemented with email service integration

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
