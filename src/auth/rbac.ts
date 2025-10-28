import { Role } from '@prisma/client';

type Permission = 'read' | 'write' | 'delete' | 'admin';

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ['read', 'write', 'delete', 'admin'],
  CREATOR: ['read', 'write'],
  MANAGER: ['read', 'write'],
  ASSISTANT: ['read', 'write'],
  MODERATOR: ['read', 'write', 'delete'],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};
