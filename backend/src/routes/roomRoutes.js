import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

router.get('/', async (req, res) => {
  const rooms = await prisma.room.findMany();
  res.json({ rooms });
});

router.get('/:id', async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

export default router;