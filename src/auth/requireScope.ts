import { Request, Response, NextFunction } from 'express';
import { hasPermission } from './rbac';

export const requireScope = (permission: 'read' | 'write' | 'delete' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !hasPermission(user.role, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
