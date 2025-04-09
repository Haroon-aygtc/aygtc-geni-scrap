import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllChatSessions = async (req: Request, res: Response) => {
  const sessions = await prisma.chatSession.findMany({
    include: { messages: true },
  });
  res.json(sessions);
};

export const getChatSessionById = async (req: Request, res: Response) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: req.params.id },
    include: { messages: true },
  });
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json(session);
};

export const createChatSession = async (req: Request, res: Response) => {
  const session = await prisma.chatSession.create({
    data: req.body,
  });
  res.status(201).json(session);
};

export const updateChatSession = async (req: Request, res: Response) => {
  const session = await prisma.chatSession.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(session);
};

export const deleteChatSession = async (req: Request, res: Response) => {
  await prisma.chatSession.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};

// ChatMessage CRUD
export const createChatMessage = async (req: Request, res: Response) => {
  const message = await prisma.chatMessage.create({
    data: req.body,
  });
  res.status(201).json(message);
};

export const updateChatMessage = async (req: Request, res: Response) => {
  const message = await prisma.chatMessage.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(message);
};

export const deleteChatMessage = async (req: Request, res: Response) => {
  await prisma.chatMessage.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
