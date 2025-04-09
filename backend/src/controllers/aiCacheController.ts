import prisma from '../config/prisma.js';
import { Request, Response } from 'express';

export async function getAllAICache(req: Request, res: Response) {
  try {
    const cacheEntries = await prisma.aICache.findMany();
    res.json(cacheEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI cache entries' });
  }
}

export async function getAICacheById(req: Request, res: Response) {
  try {
    const entry = await prisma.aICache.findUnique({
      where: { id: req.params.id },
    });
    if (!entry) {
      return res.status(404).json({ error: 'AI cache entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI cache entry' });
  }
}

export async function createAICache(req: Request, res: Response) {
  try {
    const { promptHash, prompt, response, modelUsed, metadata, expiresAt } = req.body;
    const newEntry = await prisma.aICache.create({
      data: {
        promptHash,
        prompt,
        response,
        modelUsed,
        metadata,
        expiresAt: new Date(expiresAt),
      },
    });
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create AI cache entry' });
  }
}

export async function updateAICache(req: Request, res: Response) {
  try {
    const { promptHash, prompt, response, modelUsed, metadata, expiresAt } = req.body;
    const updatedEntry = await prisma.aICache.update({
      where: { id: req.params.id },
      data: {
        promptHash,
        prompt,
        response,
        modelUsed,
        metadata,
        expiresAt: new Date(expiresAt),
      },
    });
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update AI cache entry' });
  }
}

export async function deleteAICache(req: Request, res: Response) {
  try {
    await prisma.aICache.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete AI cache entry' });
  }
}
