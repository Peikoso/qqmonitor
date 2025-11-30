import pkg from 'pg';
import { config } from './index.js';

const { Pool, types } = pkg;

const DATABASE_URL = config.DATABASE_URL;

// bigint (int8)
types.setTypeParser(20, (val) => parseInt(val, 10));
// numeric / decimal
types.setTypeParser(1700, (val) => parseFloat(val));


if(!DATABASE_URL){
    console.error('ERRO: DATABASE_URL not defined');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export { pool };