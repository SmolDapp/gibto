import {useMemo} from 'react';
import Image from 'next/image';

import type {ReactElement} from 'react';

function Cover({src}: {src: string}): ReactElement {
	const	URL = '/hero.jpg';
	const	videoExtTypes = ['mp4', 'webm', 'ogg'];

	const	sanitizedSrc = useMemo((): string => {
		if (src.startsWith('https://gateway.pinata.cloud/ipfs')) {
			return src.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs');
		}
		if (src.startsWith('ipfs://')) {
			return src.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		if (src == '') {
			return URL;
		}
		return src;
	}, [src]);

	return (
		<div className={'absolute inset-0 z-0'}>
			{videoExtTypes.includes(sanitizedSrc.split('.').pop() || '') ? (
				<video
					className={'absolute inset-0 h-full w-full object-cover'}
					autoPlay
					loop
					muted
					playsInline
					src={sanitizedSrc}
				/>
			) : (
				<Image
					src={sanitizedSrc}
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
