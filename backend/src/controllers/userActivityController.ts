import prisma from '../config/prisma.js';
import { Request, Response } from 'express';

export async function getUserActivities(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string || req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userActivity.count({ where: { userId } }),
    ]);

    res.json({
      data: activities,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
}

export async function createUserActivity(req: Request, res: Response) {
  try {
    const { action, metadata } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const activity = await prisma.userActivity.create({
      data: {
        userId: req.user.id,
        action,
        ipAddress: ipAddress as string,
        userAgent,
        metadata,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user activity' });
  }
}
