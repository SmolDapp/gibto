import {ethers} from 'ethers';
import {db} from '@vercel/postgres';

import type {NextApiRequest, NextApiResponse} from 'next';

async function update(req: NextApiRequest, resp: NextApiResponse): Promise<void> {
	const client = await db.connect();
	const {action, address, description, twitter, github, signature} = req.body;

	if (action === 'CREATE_CREATOR') {
		const signer = ethers.utils.verifyMessage('gib to me pls', signature);
		if (signer !== address) {
			return resp.status(500).json({error: 'Signature does not match address'});
		}
		const fields = [
			'Address varchar(255) PRIMARY KEY',
			'Description varchar(255)',
			'About text',
			'Twitter varchar(255)',
			'Github varchar(255)'
		];
		try {
			const create = `CREATE TABLE IF NOT EXISTS Creators ( ${fields.join(', ')} );`;
			await client.sql(create as unknown as TemplateStringsArray);
			const {rows} = await client.sql`INSERT INTO Creators (Address) VALUES (${address}) RETURNING *`;

			return resp.status(200).json({rows});
		} catch (error) {
			console.log(error);
			return resp.status(500).json({error});
		}
	}
	if (action === 'EDIT_DESCRIPTION') {
		const signer = ethers.utils.verifyMessage(
			`I want to update my description to "${description}"`,
			signature
		);
		if (signer !== address) {
			return resp.status(500).json({error: 'Signature does not match address'});
		}

		try {
			const {rows} = await client.sql`UPDATE Creators SET Description = ${description} WHERE Address = ${address} RETURNING *`;
			return resp.status(200).json(rows[0]);
		} catch (error) {
			console.log(error);
			return resp.status(500).json({error});
		}
	}
	if (action === 'EDIT_TWITTER') {
		const signer = ethers.utils.verifyMessage(
			`I want to update my Twitter/Lenster to "${twitter}"`,
			signature
		);
		if (signer !== address) {
			return resp.status(500).json({error: 'Signature does not match address'});
		}

		try {
			const {rows} = await client.sql`UPDATE Creators SET Twitter = ${twitter} WHERE Address = ${address} RETURNING *`;
			return resp.status(200).json(rows[0]);
		} catch (error) {
			console.log(error);
			return resp.status(500).json({error});
		}
	}
	if (action === 'EDIT_GITHUB') {
		const signer = ethers.utils.verifyMessage(
			`I want to update my Github to "${github}"`,
			signature
		);
		if (signer !== address) {
			return resp.status(500).json({error: 'Signature does not match address'});
		}

		try {
			const {rows} = await client.sql`UPDATE Creators SET Github = ${github} WHERE Address = ${address} RETURNING *`;
			return resp.status(200).json(rows[0]);
		} catch (error) {
			console.log(error);
			return resp.status(500).json({error});
		}
	}

	return resp.status(500).json({error: 'Invalid action'});
}

export default update;
