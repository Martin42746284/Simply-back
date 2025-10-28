import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Send message
router.post('/messages', async (req: AuthRequest, res, next) => {
  try {
    const { conversationId, recipientId, content, mediaIds } = req.body;
    const senderId = req.user!.userId;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        recipientId,
        content,
        mediaIds: mediaIds || [],
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// Get conversations
router.get('/conversations', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ creatorId: userId }, { subscriberId: userId }],
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
});

// Get messages
router.get('/conversations/:id/messages', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.put('/conversations/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await prisma.message.updateMany({
      where: {
        conversationId: id,
        recipientId: userId,
        status: { not: 'READ' },
      },
      data: { status: 'READ' },
    });

    await prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
