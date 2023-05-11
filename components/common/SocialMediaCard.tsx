
import {cloneElement} from 'react';

import type {ReactElement} from 'react';

export type TSocialMediaCard = {
	icon: ReactElement;
	href: string;
	className?: string;
}
export default function SocialMediaCard({href, icon, className = ''}: TSocialMediaCard): ReactElement {
	return (
		<a
			href={href}
			target={'_blank'}
			className={className}
			rel={'noopener noreferrer'}>
			<div className={'group relative flex w-full flex-row items-center justify-start'}>
				<div
					suppressHydrationWarning
					className={'flex h-6 w-6 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-0 transition-colors group-hover:bg-neutral-700 md:h-9 md:w-9'}>
					{cloneElement(icon, {className: 'h-5 w-5 text-neutral-700 transition-colors group-hover:text-neutral-0'})}
				</div>
			</div>
		</a>
	);
}
