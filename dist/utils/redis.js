"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const env_1 = require("../types/env");
let client = null;
const connectRedis = async () => {
    if (client)
        return client;
    client = (0, redis_1.createClient)({ url: env_1.config.redis.url, password: env_1.config.redis.password });
    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });
    await client.connect();
    console.log('✅ Connected to Redis');
    return client;
};
exports.connectRedis = connectRedis;
const getRedisClient = () => client;
exports.getRedisClient = getRedisClient;
exports.default = { connectRedis: exports.connectRedis, getRedisClient: exports.getRedisClient };
