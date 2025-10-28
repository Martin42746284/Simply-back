import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

router.post('/payments/session', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { amount, subscriberId } = req.body;
    const creatorId = req.user!.userId;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: { name: 'Creator Subscription' },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { creatorId, subscriberId },
    });

    await prisma.transaction.create({
      data: {
        creatorId,
        subscriberId,
        amount,
        currency: 'USD',
        type: 'SUBSCRIPTION',
        status: 'PENDING',
      },
    });

    res.json({ success: true, sessionUrl: session.url });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const creatorId = req.user!.userId;

    const transactions = await prisma.transaction.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
});

export default router;
