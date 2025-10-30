"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = void 0;
const rolePermissions = {
    ADMIN: ['read', 'write', 'delete', 'admin'],
    CREATOR: ['read', 'write'],
    MANAGER: ['read', 'write'],
    ASSISTANT: ['read', 'write'],
    MODERATOR: ['read', 'write', 'delete'],
};
const hasPermission = (role, permission) => {
    return rolePermissions[role]?.includes(permission) ?? false;
};
exports.hasPermission = hasPermission;
