const redis = require("redis");

const redisLFUClient = redis.createClient({
  // Establecer el tamaño máximo de la caché en bytes (por ejemplo, 10MB)
  maxmemory: '10MB',
  // Indicar a Redis que utilice la política LFU para eliminar claves cuando se alcance el límite de tamaño
  maxmemoryPolicy: 'allkeys-lfu'
});

redisLFUClient.on("error", (err) => {
  console.error("Error connecting to Redis LFU: ", err);
});

module.exports = redisLFUClient;
