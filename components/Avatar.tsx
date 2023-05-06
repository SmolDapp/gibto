import Image from 'next/image';

import type {ReactElement} from 'react';

function Avatar({src}: {src: string}): ReactElement {
	const	URL = 'https://images.unsplash.com/photo-1550165946-6c770414edb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80';
	const	videoExtTypes = ['mp4', 'webm', 'ogg'];

	return (
		<div className={'mr-4 h-12 w-12 rounded-2xl bg-neutral-200'}>
			{videoExtTypes.includes((src || URL).split('.').pop() || '') ? (
				<video
					src={(src || URL)}
					className={'!h-12 !w-12 rounded-2xl object-cover'}
					autoPlay
					loop
					muted
					playsInline />
			) : (
				<Image
					src={(src || URL)}
					alt={''}
					className={'!h-12 !w-12 rounded-2xl object-cover'}
					width={400}
					height={400}
					unoptimized />
			)}
		</div>
	);
}


export default Avatar;
