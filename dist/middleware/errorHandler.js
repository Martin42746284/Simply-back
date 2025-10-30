"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Prisma-like errors: check code property instead of instanceof check to avoid type issues
    if (err && typeof err.code === 'string') {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Duplicate entry' });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Record not found' });
        }
    }
    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
