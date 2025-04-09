import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// ScrapingJob CRUD
export const getAllScrapingJobs = async (req: Request, res: Response) => {
  const jobs = await prisma.scrapingJob.findMany();
  res.json(jobs);
};

export const getScrapingJobById = async (req: Request, res: Response) => {
  const job = await prisma.scrapingJob.findUnique({
    where: { id: req.params.id },
  });
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
};

export const createScrapingJob = async (req: Request, res: Response) => {
  const job = await prisma.scrapingJob.create({
    data: req.body,
  });
  res.status(201).json(job);
};

export const updateScrapingJob = async (req: Request, res: Response) => {
  const job = await prisma.scrapingJob.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(job);
};

export const deleteScrapingJob = async (req: Request, res: Response) => {
  await prisma.scrapingJob.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};

// ScrapingSelector CRUD
export const getAllScrapingSelectors = async (req: Request, res: Response) => {
  const selectors = await prisma.scrapingSelector.findMany();
  res.json(selectors);
};

export const getScrapingSelectorById = async (req: Request, res: Response) => {
  const selector = await prisma.scrapingSelector.findUnique({
    where: { id: req.params.id },
  });
  if (!selector) return res.status(404).json({ error: 'Not found' });
  res.json(selector);
};

export const createScrapingSelector = async (req: Request, res: Response) => {
  const selector = await prisma.scrapingSelector.create({
    data: req.body,
  });
  res.status(201).json(selector);
};

export const updateScrapingSelector = async (req: Request, res: Response) => {
  const selector = await prisma.scrapingSelector.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(selector);
};

export const deleteScrapingSelector = async (req: Request, res: Response) => {
  await prisma.scrapingSelector.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};

// ScrapingData CRUD
export const getAllScrapingData = async (req: Request, res: Response) => {
  const data = await prisma.scrapingData.findMany();
  res.json(data);
};

export const getScrapingDataById = async (req: Request, res: Response) => {
  const data = await prisma.scrapingData.findUnique({
    where: { id: req.params.id },
  });
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

export const createScrapingData = async (req: Request, res: Response) => {
  const data = await prisma.scrapingData.create({
    data: req.body,
  });
  res.status(201).json(data);
};

export const updateScrapingData = async (req: Request, res: Response) => {
  const data = await prisma.scrapingData.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(data);
};

export const deleteScrapingData = async (req: Request, res: Response) => {
  await prisma.scrapingData.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
};
