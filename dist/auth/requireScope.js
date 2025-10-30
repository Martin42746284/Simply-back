"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireScope = void 0;
const rbac_1 = require("./rbac");
const requireScope = (permission) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !(0, rbac_1.hasPermission)(user.role, permission)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireScope = requireScope;
