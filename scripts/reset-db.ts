import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

async function resetDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'posts_db',
  });

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM posts');
    try {
      await connection.query('TRUNCATE TABLE users');
    } catch {
      // users table may not exist yet during first migration
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database reset: orphaned posts cleared.');
  } finally {
    await connection.end();
  }
}

resetDb().catch((error) => {
  console.error('Failed to reset database:', error.message);
  process.exit(1);
});
