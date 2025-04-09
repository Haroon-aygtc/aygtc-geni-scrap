import prisma from '../config/prisma.js';
import { Request, Response } from 'express';

export async function getAllPromptTemplates(req: Request, res: Response) {
  try {
    const templates = await prisma.promptTemplate.findMany();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompt templates' });
  }
}

export async function getPromptTemplateById(req: Request, res: Response) {
  try {
    const template = await prisma.promptTemplate.findUnique({
      where: { id: req.params.id },
    });
    if (!template) {
      return res.status(404).json({ error: 'Prompt template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompt template' });
  }
}

export async function createPromptTemplate(req: Request, res: Response) {
  try {
    const { name, description, templateText, variables, category, isActive } = req.body;
    const newTemplate = await prisma.promptTemplate.create({
      data: {
        name,
        description,
        templateText,
        variables,
        category,
        isActive,
      },
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prompt template' });
  }
}

export async function updatePromptTemplate(req: Request, res: Response) {
  try {
    const { name, description, templateText, variables, category, isActive } = req.body;
    const updatedTemplate = await prisma.promptTemplate.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        templateText,
        variables,
        category,
        isActive,
      },
    });
    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prompt template' });
  }
}

export async function deletePromptTemplate(req: Request, res: Response) {
  try {
    await prisma.promptTemplate.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prompt template' });
  }
}
