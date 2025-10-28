import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireScope } from '../auth/requireScope';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/users', requireScope('admin'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      take: 50,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requireScope('admin'), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
