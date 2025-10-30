"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.validateEnv = exports.getEnvBoolean = exports.getEnvNumber = exports.getEnvVar = void 0;
// Fonction utilitaire pour obtenir les variables d'environnement avec validation
const getEnvVar = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
exports.getEnvVar = getEnvVar;
// Fonction pour obtenir un nombre depuis env
const getEnvNumber = (key, defaultValue) => {
    const value = process.env[key];
    if (!value) {
        if (defaultValue !== undefined)
            return defaultValue;
        throw new Error(`Missing required environment variable: ${key}`);
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a valid number`);
    }
    return parsed;
};
exports.getEnvNumber = getEnvNumber;
// Fonction pour obtenir un booléen depuis env
const getEnvBoolean = (key, defaultValue = false) => {
    const value = process.env[key];
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
};
exports.getEnvBoolean = getEnvBoolean;
// Validation des variables d'environnement au démarrage
const validateEnv = () => {
    const requiredVars = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'JWT_SECRET',
        'REDIS_URL',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'S3_BUCKET_NAME',
        'STRIPE_SECRET_KEY',
        'FRONTEND_URL',
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please check your .env file.');
    }
    console.log('✅ Environment variables validated successfully');
};
exports.validateEnv = validateEnv;
// Configuration typée de l'application
exports.config = {
    // Server
    env: process.env.NODE_ENV || 'development',
    port: (0, exports.getEnvNumber)('PORT', 3000),
    corsOrigin: (0, exports.getEnvVar)('CORS_ORIGIN', '*'),
    // Database
    databaseUrl: (0, exports.getEnvVar)('DATABASE_URL'),
    // JWT
    jwt: {
        secret: (0, exports.getEnvVar)('JWT_SECRET'),
        expiresIn: (0, exports.getEnvVar)('JWT_EXPIRES_IN', '7d'),
    },
    // Redis
    redis: {
        url: (0, exports.getEnvVar)('REDIS_URL'),
        password: process.env.REDIS_PASSWORD,
    },
    // AWS
    aws: {
        accessKeyId: (0, exports.getEnvVar)('AWS_ACCESS_KEY_ID'),
        secretAccessKey: (0, exports.getEnvVar)('AWS_SECRET_ACCESS_KEY'),
        region: (0, exports.getEnvVar)('AWS_REGION', 'us-east-1'),
        s3BucketName: (0, exports.getEnvVar)('S3_BUCKET_NAME'),
        cdnUrl: (0, exports.getEnvVar)('CDN_URL'),
    },
    // Stripe
    stripe: {
        secretKey: (0, exports.getEnvVar)('STRIPE_SECRET_KEY'),
        webhookSecret: (0, exports.getEnvVar)('STRIPE_WEBHOOK_SECRET'),
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
    // Frontend
    frontendUrl: (0, exports.getEnvVar)('FRONTEND_URL'),
    // Rate Limiting
    rateLimit: {
        windowMs: (0, exports.getEnvNumber)('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
        maxRequests: (0, exports.getEnvNumber)('RATE_LIMIT_MAX_REQUESTS', 100),
    },
    // File Upload
    upload: {
        maxFileSize: (0, exports.getEnvNumber)('MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB
        allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
        ],
    },
    // Logging
    logLevel: (process.env.LOG_LEVEL || 'info'),
    // WebSocket
    websocket: {
        port: (0, exports.getEnvNumber)('WS_PORT', 3001),
        path: (0, exports.getEnvVar)('WS_PATH', '/ws'),
    },
};
