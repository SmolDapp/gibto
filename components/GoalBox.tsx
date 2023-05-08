import React from 'react';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

function GoalPreview(): ReactElement {
	return (
		<div className={'font-number col-span-7 flex w-full flex-col overflow-hidden border-l-0 border-neutral-200 pl-0 text-xs md:col-span-5 md:border-l md:pl-10 md:text-sm'}>
			<div className={'relative flex h-full w-full flex-col items-center justify-center space-y-4'}>
				<svg
					xmlns={'http://www.w3.org/2000/svg'}
					viewBox={'0 0 512 512'}
					className={'h-14 w-14 text-neutral-400'}>
					<path d={'M326.3 9.8C304 3.4 280.4 0 256 0C114.6 0 0 114.6 0 256S114.6 512 256 512s256-114.6 256-256c0-24.4-3.4-48-9.8-70.3l-22.8 25.4c-1.1 1.2-2.1 2.3-3.3 3.4c2.5 13.5 3.8 27.3 3.8 41.5c0 123.7-100.3 224-224 224S32 379.7 32 256S132.3 32 256 32c14.2 0 28.1 1.3 41.5 3.8c1.1-1.1 2.2-2.2 3.4-3.3L326.3 9.8zM274.6 97.1c-6.1-.7-12.3-1.1-18.6-1.1C167.6 96 96 167.6 96 256s71.6 160 160 160s160-71.6 160-160c0-6.3-.4-12.5-1.1-18.6c-2.7-.2-5.4-.5-8.1-.9l-25-4.2c1.4 7.7 2.2 15.6 2.2 23.7c0 70.7-57.3 128-128 128s-128-57.3-128-128s57.3-128 128-128c8.1 0 16 .8 23.7 2.2l-4.2-25c-.5-2.7-.8-5.4-.9-8.1zm66.9 96.1l70.4 11.7c16.3 2.7 32.8-3.1 43.8-15.5L499.6 140c11.7-13.1 5.8-33.9-11-38.9L428.9 83.2 410.9 23.4c-5-16.8-25.8-22.7-38.9-11L322.6 56.3c-12.3 11-18.2 27.5-15.5 43.8l11.7 70.4-74.2 74.2c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l74.2-74.2zm27.8-27.8l51.3-51.3 46.8 14-35.6 40c-3.7 4.1-9.2 6.1-14.6 5.2l-47.9-8zm28.6-73.9l-51.3 51.3-8-47.9c-.9-5.4 1-10.9 5.2-14.6l40-35.6 14 46.8z'} fill={'currentcolor'} />
				</svg>
				<b>{'This user has not set a goal yet.'}</b>
			</div>
			<div className={'mt-auto pt-4'}>
				<a href={'#donate'}>
					<Button className={'!h-9 w-full'}>
						{'GIB'}
					</Button>
				</a>
			</div>
		</div>
	);
}

function GoalPreviewMin({received, value}: {received: number, value: number}): ReactElement {
	return (
		<div className={'font-number flex w-3/4 flex-col overflow-hidden pl-0 text-xs md:text-sm'}>
			<div className={'relative flex h-full w-full flex-col items-center justify-center space-y-4'}>
				<p
					className={'h-auto w-full overflow-x-scroll border-none bg-transparent p-0 text-center text-4xl font-bold tabular-nums outline-none scrollbar-none'}>
					{`$${formatAmount(received || 0, 0, 2)}`}
				</p>
				<p className={'font-number mb-4 mt-0 text-center text-xs text-neutral-600'} suppressHydrationWarning>
					{`out of goal of $${formatAmount(value || 0, 0, 2)}`}
				</p>
				<div className={'relative h-2 w-full overflow-hidden rounded bg-neutral-200'}>
					<div
						style={{width: `${(received || 0) / (value || 1) * 100}%`}}
						className={'absolute inset-y-0 left-0 bg-[#f472b6]'} />
				</div>
			</div>
		</div>
	);
}

export {GoalPreviewMin};
export default GoalPreview;
