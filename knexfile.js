// Update with your config settings.

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require("./env_constants");

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
