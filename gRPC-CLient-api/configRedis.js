require('dotenv').config();
const { createClient } = require("redis");

const connect = async () => {
    const client = createClient({
        host: `${process.env.REDIS_IP}`,
        port: process.env.REDIS_PORT,
        maxmemory: '1024',
        maxmemoryPolicy: 'lfu'
    });

    client.on("error", err => console.log("error redis: ", err))

    await client.connect();

    console.log("Redis conectado.");

    return client;
}

module.exports = connect;
