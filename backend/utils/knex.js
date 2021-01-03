module.exports = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port: 5432,
      user : 'jakemorales',
      password : 'database_dev',
      database : 'shareq2'
    }
  });