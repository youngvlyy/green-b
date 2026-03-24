import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.PG_URI) {
  console.error('PG_URI 환경변수가 없습니다');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.PG_URI });

pool.on('error', (err) => {
  console.error('PostgreSQL 연결 오류:', err);
});

export default pool;
