"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
});
router.use(auth_1.authenticate);
router.post('/media', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const userId = req.user.userId;
        const fileId = (0, uuid_1.v4)();
        const key = `uploads/${userId}/${fileId}.jpg`;
        // Compress image
        const compressed = await (0, sharp_1.default)(req.file.buffer)
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        await s3
            .upload({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: compressed,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
        })
            .promise();
        const url = `${process.env.CDN_URL}/${key}`;
        const media = await prisma.media.create({
            data: {
                id: fileId,
                userId,
                filename: key,
                originalName: req.file.originalname,
                mimeType: 'image/jpeg',
                size: BigInt(compressed.length),
                url,
            },
        });
        res.status(201).json({ success: true, data: media });
    }
    catch (error) {
        next(error);
    }
});
router.get('/media', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;
        const media = await prisma.media.findMany({
            where: {
                userId,
                ...(status && { status: status }),
            },
            orderBy: { uploadedAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: media });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
