import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { dbConn } }) => {
	const res = await dbConn.query('SELECT * FROM instances');
	const instances = res.rows;
	return { instances: instances ?? [] };
};
