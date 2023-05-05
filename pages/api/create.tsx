import {db} from '@vercel/postgres';

import type {NextApiRequest, NextApiResponse} from 'next';

async function handler(req: NextApiRequest, resp: NextApiResponse): Promise<void> {
	const client = await db.connect();
	const {owner, description} = req.body;
	try {
		await client.sql`CREATE TABLE IF NOT EXISTS Creators ( Address varchar(255) PRIMARY KEY, Description varchar(255), About text );`;
		const {rows} = await client.sql`INSERT INTO Creators (Address, Description) VALUES (${owner}, ${description}) RETURNING *`;
		return resp.status(200).json({rows});
	} catch (error) {
		console.log(error);
		return resp.status(500).json({error});
	}
}

export default handler;
