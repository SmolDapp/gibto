import Image from 'next/image';

import type {ReactElement} from 'react';

function Cover({src}: {src: string}): ReactElement {
	const	URL = '/hero.jpg';
	const	videoExtTypes = ['mp4', 'webm', 'ogg'];

	return (
		<div className={'absolute inset-0 z-0'}>
			{videoExtTypes.includes((src || URL).split('.').pop() || '') ? (
				<video
					className={'absolute inset-0 h-full w-full object-cover'}
					autoPlay
					loop
					muted
					playsInline
					src={(src || URL)}
				/>
			) : (
				<Image
					src={(src || URL)}
					alt={''}
					className={'absolute inset-0 h-full w-full object-cover'}
					width={1920}
					height={1080}
					unoptimized />
			)}
		</div>
	);
}


export default Cover;
