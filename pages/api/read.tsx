import {db} from '@vercel/postgres';

import type {TAddress} from '@yearn-finance/web-lib/types';

async function load(action: string, address: TAddress): Promise<any> {
	const client = await db.connect();

	if (action === 'LOAD_CREATOR') {
		try {
			const {rows} = await client.sql`SELECT * FROM Creators WHERE Address = ${address}`;
			return rows[0];
		} catch (error) {
			console.log(error);
			return null;
		}
	}
}

export default load;
