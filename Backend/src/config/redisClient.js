import { createClient } from 'redis';
import appconfig from './appConfig.js';

const redisClient = createClient({
    username: 'default',
    password: appconfig.REDIS_PASSWORD,  
    socket: {
        host: appconfig.REDIS_HOST,
        port: appconfig.REDIS_PORT
    }
});

redisClient.on('error', err => console.log('Redis Client Error:', err));

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis Connection Failed:', error);
    }
};

export { redisClient, connectRedis };
