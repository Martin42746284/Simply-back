"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
router.post('/payments/session', auth_1.authenticate, async (req, res, next) => {
    try {
        const { amount, subscriberId } = req.body;
        const creatorId = req.user.userId;
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
    }
    catch (error) {
        next(error);
    }
});
router.get('/payments', auth_1.authenticate, async (req, res, next) => {
    try {
        const creatorId = req.user.userId;
        const transactions = await prisma.transaction.findMany({
            where: { creatorId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: transactions });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
