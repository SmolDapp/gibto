import {useEffect, useRef} from 'react';
import Image from 'next/image';
import jazzicon from '@metamask/jazzicon';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

function Avatar({src, address}: {src: string, address: TAddress}): ReactElement {
	const	avatarRef = useRef<HTMLImageElement>(null);
	const	videoExtTypes = ['mp4', 'webm', 'ogg'];

	useEffect((): void => {
		if (avatarRef.current) {
			const addressAsNumber = parseInt(address.slice(2, 10), 16);
			const el = jazzicon(48, addressAsNumber);
			avatarRef.current.replaceChild(el, avatarRef.current.firstChild as Node);
		}
	}, [src, address]);

	return (
		<div className={'mr-4 h-12 w-12 rounded-2xl bg-neutral-200'}>
			{src === '' ? (
				<div
					ref={avatarRef}
					className={'avatarJazz !h-12 !w-12 rounded-2xl object-cover'}>
					<div />
				</div>
			) : videoExtTypes.includes(src.split('.').pop() || '') ? (
				<video
					src={src}
					className={'!h-12 !w-12 rounded-2xl object-cover'}
					autoPlay
					loop
					muted
					playsInline />
			) : (
				<Image
					src={src}
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
