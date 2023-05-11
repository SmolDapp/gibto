import React, {Fragment} from 'react';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import Avatar from './Avatar';
import SectionSocials from './SectionSocials';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function urlEncoded(str: string): string {
	return encodeURIComponent(str).replace(/[!'()*]/g, (c): string => `%${c.charCodeAt(0).toString(16)}`);
}

function SectionProfile(props: TReceiverProps): ReactElement {
	function	renderCheck(): ReactElement {
		if (props.isVerified) {
			return (
				<svg
					xmlns={'http://www.w3.org/2000/svg'}
					viewBox={'0 0 512 512'}
					className={'mb-2 ml-2 h-4 w-4 text-[#f472b6]'}>
					<path d={'M256 0c36.8 0 68.8 20.7 84.9 51.1C373.8 41 411 49 437 75s34 63.3 23.9 96.1C491.3 187.2 512 219.2 512 256s-20.7 68.8-51.1 84.9C471 373.8 463 411 437 437s-63.3 34-96.1 23.9C324.8 491.3 292.8 512 256 512s-68.8-20.7-84.9-51.1C138.2 471 101 463 75 437s-34-63.3-23.9-96.1C20.7 324.8 0 292.8 0 256s20.7-68.8 51.1-84.9C41 138.2 49 101 75 75s63.3-34 96.1-23.9C187.2 20.7 219.2 0 256 0zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z'} fill={'currentColor'} />
				</svg>
			);
		}
		return <Fragment />;
	}

	return (
		<div className={'relative col-span-7 flex flex-col'}>
			<div className={'ml-0 mt-2 flex flex-row items-center space-x-2 md:-ml-2 md:mt-0 md:space-x-4'}>
				<Avatar
					address={toAddress(props.address)}
					src={props.avatar} />
				<span>
					<h1 className={'flex flex-row items-center text-xl tracking-tight text-neutral-900 md:text-3xl'}>
						{`Gib to ${props.name}`}
						{renderCheck()}
					</h1>
					<p className={'font-number text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
						<span className={'hidden md:inline'}>{props.address}</span>
						<span className={'inline pl-1 md:hidden'}>{truncateHex(props.address, 8)}</span>
					</p>
				</span>
			</div>
			<p className={'mt-2 min-h-[30px] text-sm text-neutral-500 md:mt-4 md:min-h-[60px] md:text-base'}>
				{props?.description || `${props.name} hasn’t written anything yet. must be shy...`}
			</p>
			<div className={'mt-auto items-center justify-between pt-6 md:flex'}>
				<div className={' hidden flex-row space-x-4 md:flex'}>
					<SectionSocials {...props} />
				</div>
			</div>
			<div className={'absolute -right-2 top-2 md:-right-6'}>
				<a
					target={'_blank'}
					rel={'noopener noreferrer'}
					href={`https://twitter.com/intent/tweet?text=${urlEncoded(props.isOwner ? `Check out my project on gib 👉👈\nhttps://gib.to/${props.ensHandle || props.address}` : `Check out ${props.ensHandle.replace('.eth', '') || truncateHex(props.address, 4)}'s project on gib\nhttps://gib.to/${props.ensHandle || props.address}`)}`}>
					<button className={'flex items-center justify-center space-x-1 text-xs text-neutral-400 transition-colors hover:text-neutral-900'}>
						<p>{'Share'}</p>
						<IconLinkOut className={'h-3 w-3'} />
					</button>
				</a>
			</div>
		</div>
	);
}

export default SectionProfile;
