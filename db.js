const {Client} = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'pscs_mock',
    password: 'Password123',
    port: 5432,
});

client.connect();

module.exports = client;