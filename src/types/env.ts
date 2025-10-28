// Typage strict des variables d'environnement
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      CORS_ORIGIN: string;

      // Database
      DATABASE_URL: string;

      // JWT
      JWT_SECRET: string;
      JWT_EXPIRES_IN?: string;

      // Redis
      REDIS_URL: string;
      REDIS_PASSWORD?: string;

      // AWS S3
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      S3_BUCKET_NAME: string;
      CDN_URL: string;

      // Stripe
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      STRIPE_PUBLISHABLE_KEY?: string;

      // Frontend
      FRONTEND_URL: string;

      // Email (optionnel)
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASSWORD?: string;
      EMAIL_FROM?: string;

      // Monitoring (optionnel)
      SENTRY_DSN?: string;
      LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;

      // WebSocket
      WS_PORT?: string;
      WS_PATH?: string;

      // File Upload
      MAX_FILE_SIZE?: string;
      ALLOWED_FILE_TYPES?: string;

      // Session
      SESSION_SECRET?: string;
      SESSION_TIMEOUT?: string;
    }
  }
}

// Fonction utilitaire pour obtenir les variables d'environnement avec validation
export const getEnvVar = (key: keyof NodeJS.ProcessEnv, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

// Fonction pour obtenir un nombre depuis env
export const getEnvNumber = (key: keyof NodeJS.ProcessEnv, defaultValue?: number): number => {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  return parsed;
};

// Fonction pour obtenir un booléen depuis env
export const getEnvBoolean = (key: keyof NodeJS.ProcessEnv, defaultValue = false): boolean => {
  const value = process.env[key];

  if (!value) return defaultValue;

  return value.toLowerCase() === 'true' || value === '1';
};

// Validation des variables d'environnement au démarrage
export const validateEnv = (): void => {
  const requiredVars: Array<keyof NodeJS.ProcessEnv> = [
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
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file.'
    );
  }

  console.log('✅ Environment variables validated successfully');
};

// Configuration typée de l'application
export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: getEnvNumber('PORT', 3000),
  corsOrigin: getEnvVar('CORS_ORIGIN', '*'),

  // Database
  databaseUrl: getEnvVar('DATABASE_URL'),

  // JWT
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  },

  // Redis
  redis: {
    url: getEnvVar('REDIS_URL'),
    password: process.env.REDIS_PASSWORD,
  },

  // AWS
  aws: {
    accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
    region: getEnvVar('AWS_REGION', 'us-east-1'),
    s3BucketName: getEnvVar('S3_BUCKET_NAME'),
    cdnUrl: getEnvVar('CDN_URL'),
  },

  // Stripe
  stripe: {
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  // Frontend
  frontendUrl: getEnvVar('FRONTEND_URL'),

  // Rate Limiting
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  // File Upload
  upload: {
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
    ],
  },

  // Logging
  logLevel: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',

  // WebSocket
  websocket: {
    port: getEnvNumber('WS_PORT', 3001),
    path: getEnvVar('WS_PATH', '/ws'),
  },
} as const;

export type Config = typeof config;

// Exporter pour faire de ce fichier un module
export {};
