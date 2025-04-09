import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllApiKeys = async (req: Request, res: Response) => {
  const keys = await prisma.apiKey.findMany();
  res.json(keys);
};

export const getApiKeyById = async (req: Request, res: Response) => {
  const key = await prisma.apiKey.findUnique({
    where: { id: req.params.id },
  });
  if (!key) return res.status(404).json({ error: 'Not found' });
  res.json(key);
};

export const createApiKey = async (req: Request, res: Response) => {
  const key = await prisma.apiKey.create({
    data: req.body,
  });
  res.status(201).json(key);
};

export const updateApiKey = async (req: Request, res: Response) => {
  const key = await prisma.apiKey.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(key);
};

export const deleteApiKey = async (req: Request, res: Response) => {
  await prisma.apiKey.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
