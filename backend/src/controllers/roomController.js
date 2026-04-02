//import { Request, Response } from 'express';
import { prisma } from '../index.ts';
import pkg from 'express';
const { Request, Response } = pkg;

export const getPublicRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
