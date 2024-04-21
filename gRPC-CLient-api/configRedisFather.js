require('dotenv').config();
const { createClient } = require("redis");

const connect = async () => {
    const client = createClient({
        host: `${process.env.REDIS_IP_FATHER}`,
        port: process.env.REDIS_PORT_FATHER
    });

    client.on("error", err => console.log("error redis: ", err))

    await client.config("SET", "maxmemory", "10485760"); // 10 * 1024 * 1024 bytes

    // Cambiar la política de eliminación a LFU
    //await client.config("SET", "maxmemory-policy", "lfu");

    await client.connect();

    console.log("Redis conectado.");

    return client;
}

module.exports = connect;
