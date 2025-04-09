import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllFollowUpConfigs = async (req: Request, res: Response) => {
  const configs = await prisma.followUpConfig.findMany();
  res.json(configs);
};

export const getFollowUpConfigById = async (req: Request, res: Response) => {
  const config = await prisma.followUpConfig.findUnique({
    where: { id: req.params.id },
    include: {
      predefinedQuestionSets: true,
      topicBasedQuestionSets: true,
    },
  });
  if (!config) return res.status(404).json({ error: 'Not found' });
  res.json(config);
};

export const createFollowUpConfig = async (req: Request, res: Response) => {
  const config = await prisma.followUpConfig.create({
    data: req.body,
  });
  res.status(201).json(config);
};

export const updateFollowUpConfig = async (req: Request, res: Response) => {
  const config = await prisma.followUpConfig.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(config);
};

export const deleteFollowUpConfig = async (req: Request, res: Response) => {
  await prisma.followUpConfig.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};

// PredefinedQuestionSet CRUD
export const createPredefinedQuestionSet = async (req: Request, res: Response) => {
  const item = await prisma.predefinedQuestionSet.create({
    data: req.body,
  });
  res.status(201).json(item);
};

export const updatePredefinedQuestionSet = async (req: Request, res: Response) => {
  const item = await prisma.predefinedQuestionSet.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(item);
};

export const deletePredefinedQuestionSet = async (req: Request, res: Response) => {
  await prisma.predefinedQuestionSet.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};

// TopicBasedQuestionSet CRUD
export const createTopicBasedQuestionSet = async (req: Request, res: Response) => {
  const item = await prisma.topicBasedQuestionSet.create({
    data: req.body,
  });
  res.status(201).json(item);
};

export const updateTopicBasedQuestionSet = async (req: Request, res: Response) => {
  const item = await prisma.topicBasedQuestionSet.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(item);
};

export const deleteTopicBasedQuestionSet = async (req: Request, res: Response) => {
  await prisma.topicBasedQuestionSet.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
