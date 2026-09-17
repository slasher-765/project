require('dotenv').config();

const port = Number(process.env.PORT || 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

module.exports = {
  port,
  databaseUrl: process.env.DATABASE_URL,
  pgSsl: process.env.PGSSL === 'true',
  clientOrigin: process.env.CLIENT_ORIGIN || '*'
};
