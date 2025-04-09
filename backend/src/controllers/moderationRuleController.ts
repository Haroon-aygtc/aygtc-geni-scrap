import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllModerationRules = async (req: Request, res: Response) => {
  const rules = await prisma.moderationRule.findMany();
  res.json(rules);
};

export const getModerationRuleById = async (req: Request, res: Response) => {
  const rule = await prisma.moderationRule.findUnique({
    where: { id: req.params.id },
  });
  if (!rule) return res.status(404).json({ error: 'Not found' });
  res.json(rule);
};

export const createModerationRule = async (req: Request, res: Response) => {
  const rule = await prisma.moderationRule.create({
    data: req.body,
  });
  res.status(201).json(rule);
};

export const updateModerationRule = async (req: Request, res: Response) => {
  const rule = await prisma.moderationRule.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(rule);
};

export const deleteModerationRule = async (req: Request, res: Response) => {
  await prisma.moderationRule.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
