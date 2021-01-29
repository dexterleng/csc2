// Update with your config settings.
const DB_HOST = 'localhost';
const DB_NAME = 'csc';
const DB_USER = 'root';
const DB_PASSWORD = '12345';

const config = {
  client: 'mysql2',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  }
};

module.exports = {
  development: config,
  staging: config,
  production: config
};
