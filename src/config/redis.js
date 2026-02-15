const { createClient } =require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-16513.c301.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 16513
        // tls: true
    }
});


module.exports=redisClient;