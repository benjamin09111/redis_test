const { Client } = require('pg');
const fs = require('fs');

// Lee el archivo JSON
const data = fs.readFileSync('./10kdata.json');
const records = JSON.parse(data);

const client = new Client({
    connectionString: 'postgres://xbpluecr:ocHjlBqYdHOKjQrjgiQ2SnPlROTXDqbA@otto.db.elephantsql.com/xbpluecr',
    ssl: {
      rejectUnauthorized: false // Solo es necesario si tu base de datos requiere SSL
    }
});

client.connect()
    .then(() => console.log('Conexión exitosa a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos', err));

async function insertRecords() {
    for (const record of records) {
        const query = `INSERT INTO people (id, name, age, city) VALUES ($1, $2, $3, $4);`;
        const values = [record.id, record.name, record.age, record.city];

        try {
            const result = await client.query(query, values);
            console.log('Registro insertado en la base de datos:', record);
        } catch (error) {
            console.error('Error al ejecutar la consulta', error);
        }
    }

    // Cierra la conexión después de insertar todos los registros
    client.end();
}

insertRecords();
