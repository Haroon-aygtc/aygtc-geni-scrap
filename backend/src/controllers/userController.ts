import prisma from '../config/prisma.js';
import { Request, Response } from 'express';

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { email, passwordHash, fullName, role } = req.body;
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { email, passwordHash, fullName, role, isActive, emailVerified } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email,
        passwordHash,
        fullName,
        role,
        isActive,
        emailVerified,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
}
