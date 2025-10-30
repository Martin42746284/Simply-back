"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
exports.redisClient.on('error', (err) => console.error('Redis Error:', err));
const connectRedis = async () => {
    await exports.redisClient.connect();
    console.log('✅ Redis connected');
};
exports.connectRedis = connectRedis;
