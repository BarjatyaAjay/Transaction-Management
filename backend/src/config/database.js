import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Function to parse DATABASE_URL
function parseDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    // Fallback to individual env vars for local development
    return {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'personal_finance_tracker',
      ssl: process.env.PGSSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : false,
      family: 4,
    };
  }

  return {
    connectionString: databaseUrl.trim(),
    ssl: { rejectUnauthorized: false },
    family: 4,
  };
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

const pool = new Pool({
  ...dbConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connection established');
  }
});

export default pool;
