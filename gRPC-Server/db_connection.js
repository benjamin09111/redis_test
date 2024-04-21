const { Client } = require('pg');

// Configura la conexión a tu base de datos de ElephantSQL
const client = new Client({
  connectionString: 'postgres://xbpluecr:ocHjlBqYdHOKjQrjgiQ2SnPlROTXDqbA@otto.db.elephantsql.com/xbpluecr',
  ssl: {
    rejectUnauthorized: false // Solo es necesario si tu base de datos requiere SSL
  }
});

client.connect()
  .then(() => console.log('Conexión exitosa a la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos', err));

module.exports = client;