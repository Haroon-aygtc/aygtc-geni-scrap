import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllKnowledgeBaseEntries = async (req: Request, res: Response) => {
  const entries = await prisma.knowledgeBaseEntry.findMany();
  res.json(entries);
};

export const getKnowledgeBaseEntryById = async (req: Request, res: Response) => {
  const entry = await prisma.knowledgeBaseEntry.findUnique({
    where: { id: req.params.id },
  });
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
};

export const createKnowledgeBaseEntry = async (req: Request, res: Response) => {
  const entry = await prisma.knowledgeBaseEntry.create({
    data: req.body,
  });
  res.status(201).json(entry);
};

export const updateKnowledgeBaseEntry = async (req: Request, res: Response) => {
  const entry = await prisma.knowledgeBaseEntry.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(entry);
};

export const deleteKnowledgeBaseEntry = async (req: Request, res: Response) => {
  await prisma.knowledgeBaseEntry.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
