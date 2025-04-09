import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllAnalyticsLogs = async (req: Request, res: Response) => {
  const logs = await prisma.analyticsLog.findMany();
  res.json(logs);
};

export const getAnalyticsLogById = async (req: Request, res: Response) => {
  const log = await prisma.analyticsLog.findUnique({
    where: { id: req.params.id },
  });
  if (!log) return res.status(404).json({ error: 'Not found' });
  res.json(log);
};

export const createAnalyticsLog = async (req: Request, res: Response) => {
  const log = await prisma.analyticsLog.create({
    data: req.body,
  });
  res.status(201).json(log);
};

export const updateAnalyticsLog = async (req: Request, res: Response) => {
  const log = await prisma.analyticsLog.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(log);
};

export const deleteAnalyticsLog = async (req: Request, res: Response) => {
  await prisma.analyticsLog.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
