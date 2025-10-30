import { createClient, RedisClientType } from 'redis';
import { config } from '../types/env';

let client: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
  if (client) return client;

  client = createClient({ url: config.redis.url, password: config.redis.password });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await client.connect();
  console.log('✅ Connected to Redis');

  return client;
};

export const getRedisClient = (): RedisClientType | null => client;

export default { connectRedis, getRedisClient };
