/* eslint-disable @next/next/no-img-element */
import {ImageResponse} from '@vercel/og';

import type {NextRequest} from 'next/server';

export const config = {
	runtime: 'edge'
};

function OGGenerator(request: NextRequest): any {
	const {searchParams} = request.nextUrl;
	const name = searchParams.get('name');

	return new ImageResponse((
		<div
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#fff',
				fontSize: 48,
				fontWeight: 700,
				position: 'relative'
			}}
		>
			<img
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%'
				}}
				width={1920}
				height={1080}
				src={`https://api.gib.to/cover/${name}`}
				// src={`http://localhost:8080/cover/${name}`}
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
					marginTop: 16,
					borderRadius: 32,
					backgroundColor: '#FFFFFFEE',
					padding: '36px',
					border: 'solid 1px #EBEBEB',
					marginBottom: 64
				}}>
				<img
					width={360}
					height={360}
					style={{borderRadius: '100%'}}
					src={`https://api.gib.to/avatar/${name}`}
					// src={`http://localhost:8080/avatar/${name}`}
				/>
				{`Gib to ${name}`}
			</div>
		</div>
	),
	{
		width: 1920,
		height: 900,
		status: 200,
		headers: {
			'cache-control': 'public, s-maxage=3600, stale-while-revalidate=600'
		}
	}
	);
}

export default OGGenerator;
