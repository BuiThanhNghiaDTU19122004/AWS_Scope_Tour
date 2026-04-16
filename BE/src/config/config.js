const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from the first existing file in these common locations.
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env')
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const toBool = (value) => {
  if (typeof value !== 'string') return false;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const buildConfig = ({ databaseEnv, nodeEnv }) => {
  const isProduction = nodeEnv === 'production';
  const sslEnabled = toBool(process.env.DB_SSL) || isProduction;

  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env[databaseEnv],
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 10000,
      ssl: sslEnabled
        ? {
            require: true,
            rejectUnauthorized: false
          }
        : undefined
    }
  };
};

module.exports = {
  development: buildConfig({
    databaseEnv: 'DB_NAME',
    nodeEnv: 'development'
  }),
  test: buildConfig({
    databaseEnv: 'DB_NAME_TEST',
    nodeEnv: 'test'
  }),
  production: buildConfig({
    databaseEnv: 'DB_NAME',
    nodeEnv: 'production'
  })
};
