const { Client } = require('pg');
const fs = require('fs');

const data = fs.readFileSync('./20kdata.json');
const records = JSON.parse(data);

const client = new Client({
    connectionString: 'postgres://xbpluecr:ocHjlBqYdHOKjQrjgiQ2SnPlROTXDqbA@otto.db.elephantsql.com/xbpluecr',
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect()
    .then(() => console.log('Conexión exitosa a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos', err));


async function insertRecords() {
    let contador = 0;
    for (const record of records) {
        if (contador == 5000) {
            break;
        } else {
            const query = `INSERT INTO investors (id, name, money_invested, money_earned, city) VALUES ($1, $2, $3, $4, $5);`;
            const values = [record.id, record.name, record.money_invested, record.money_earned, record.city];

            try {
                const result = await client.query(query, values);
                contador++;
                console.log(`Registro insertado en la base de datos (${contador}):`, record);
            } catch (error) {
                console.error('Error al ejecutar la consulta', error);
            }
        }

    }

    client.end();
}

insertRecords();
