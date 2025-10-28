import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import sharp from 'sharp';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

router.use(authenticate);

router.post('/media', upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user!.userId;
    const fileId = uuidv4();
    const key = `uploads/${userId}/${fileId}.jpg`;

    // Compress image
    const compressed = await sharp(req.file.buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    await s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME!,
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
  } catch (error) {
    next(error);
  }
});

router.get('/media', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const media = await prisma.media.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      orderBy: { uploadedAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
});

export default router;
