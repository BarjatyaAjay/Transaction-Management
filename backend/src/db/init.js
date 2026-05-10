import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    };
  }

  // For production, use connection string directly with IPv4 forcing
  return {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    // Force IPv4 resolution
    host: new URL(databaseUrl).hostname,
    family: 4,
  };
}

async function initDatabase() {
  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  const pool = new Pool(dbConfig);

  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log('📋 Tables created: users, categories, transactions');
    console.log('📌 Categories loaded: 10 predefined categories');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
initDatabase();
