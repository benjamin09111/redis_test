const redis = require("redis");

const redisLRUClient = redis.createClient({
  // Establecer el tamaño máximo de la caché en bytes (por ejemplo, 10MB)
  maxmemory: '10MB',
  // Indicar a Redis que utilice la política LRU para eliminar claves cuando se alcance el límite de tamaño
  maxmemoryPolicy: 'allkeys-lru'
});

redisLRUClient.on("error", (err) => {
  console.error("Error connecting to Redis LRU: ", err);
});

module.exports = redisLRUClient;
