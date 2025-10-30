"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const requireScope_1 = require("../auth/requireScope");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
router.get('/users', (0, requireScope_1.requireScope)('admin'), async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
});
router.delete('/users/:id', (0, requireScope_1.requireScope)('admin'), async (req, res, next) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
