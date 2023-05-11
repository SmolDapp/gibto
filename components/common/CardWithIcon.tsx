
import {cloneElement, useEffect, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';

import type {ReactElement} from 'react';

export type TCardWithIcon = {
	isSelected: boolean,
	onClick?: () => void;
	label: string;
	icon: ReactElement;
}
export default function CardWithIcon({isSelected, onClick, label, icon}: TCardWithIcon): ReactElement {
	const	[isClientSideSelected, set_isClientSideSelected] = useState<boolean>(false);

	useEffect((): void => {
		set_isClientSideSelected(isSelected);
	}, [isSelected]);

	return (
		<button
			className={`hover group relative flex w-full items-center justify-center px-6 py-2 ${isClientSideSelected ? 'box-100' : 'box-0'}`}
			onClick={onClick}>
			<div className={'relative flex w-full flex-col items-center justify-start md:flex-row'}>
				<div
					suppressHydrationWarning
					className={`mb-2 mr-0 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition-colors group-hover:bg-neutral-0 md:mb-0 md:mr-6 md:h-12 md:w-12 ${isClientSideSelected ? 'bg-neutral-0' : ''}`}>
					{cloneElement(icon, {className: 'h-5 md:h-6 w-5 md:w-6 text-neutral-900'})}
				</div>
				<b suppressHydrationWarning className={'text-xs md:text-base'}>{label}</b>
			</div>
			<IconCheck
				className={`absolute right-4 h-4 w-4 text-[#16a34a] transition-opacity ${isClientSideSelected ? 'opacity-100' : 'opacity-0'}`} />
		</button>
	);
}
