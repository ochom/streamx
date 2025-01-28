import pkg from 'pg';
const { Pool } = pkg;

import {
	POSTGRES_DB,
	POSTGRES_USERNAME,
	POSTGRES_HOST,
	POSTGRES_PORT,
	POSTGRES_PASSWORD
} from '$env/static/private';

/**
 * Create a new connection pool to the database.
 */
const pool = new Pool({
	database: POSTGRES_DB,
	user: POSTGRES_USERNAME,
	host: POSTGRES_HOST,
	port: Number(POSTGRES_PORT),
	password: POSTGRES_PASSWORD
});

/**
 * Connect to the PostgreSQL database.
 */
export const connectToDB = async () => await pool.connect();
