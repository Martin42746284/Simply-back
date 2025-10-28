import { Role } from '@prisma/client';

// Étendre les types Express pour ajouter des propriétés personnalisées
declare global {
  namespace Express {
    // Ajouter des propriétés à l'objet Request
    export interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
        creatorId?: string;
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
      language?: string;
      ipAddress?: string;
      sessionId?: string;
    }

    // Ajouter des propriétés à l'objet Response
    export interface Response {
      locals: {
        startTime?: number;
        requestId?: string;
        allowedRoles?: string[];
        cache?: boolean;
      };
    }

    // Définir un type User personnalisé si nécessaire
    export interface User {
      userId: string;
      email: string;
      role: Role;
      creatorId?: string;
    }
  }
}

// Exporter pour faire de ce fichier un module
export {};
