import {useEffect, useMemo, useRef} from 'react';
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

	const	sanitizedSrc = useMemo((): string => {
		if (src.startsWith('https://gateway.pinata.cloud/ipfs')) {
			return src.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs');
		}
		if (src.startsWith('ipfs://')) {
			return src.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		return src;
	}, [src]);

	return (
		<div className={'h-12 max-h-[48px] min-h-[48px] w-12 min-w-[48px] max-w-[48px] rounded-2xl bg-neutral-200'}>
			{src === '' ? (
				<div
					ref={avatarRef}
					className={'avatarJazz !h-12 !w-12 rounded-2xl object-cover'}>
					<div />
				</div>
			) : videoExtTypes.includes(sanitizedSrc.split('.').pop() || '') ? (
				<video
					src={sanitizedSrc}
					className={'!h-12 !w-12 rounded-2xl object-cover'}
					autoPlay
					loop
					muted
					playsInline />
			) : (
				<Image
					src={sanitizedSrc}
					alt={''}
					className={'!h-12 !w-12 rounded-2xl object-cover outline outline-neutral-100'}
					width={400}
					height={400}
					unoptimized />
			)}
		</div>
	);
}


export default Avatar;
