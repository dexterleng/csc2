const env = process.env.NODE_ENV || 'development';
const config = require('../knexfile')[env];

delete config.connection.database;

const knex = require('knex')(config);

knex.raw(`
    CREATE DATABASE csc2
`)
.then(() => console.log("created database"))
.catch(console.error);