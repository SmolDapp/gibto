import React, {useState} from 'react';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {useMountEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import ModalIdentitySource from '../modals/ModalIdentitySource';
import Cover from './Cover';
import SectionGoal from './SectionGoal';
import SectionProfile from './SectionProfile';
import SectionSocials from './SectionSocials';

import type {ReactElement} from 'react';
import type {TGoal, TReceiverProps} from 'utils/types/types';


function SectionHero(props: TReceiverProps & {
	goal: TGoal,
	isLoadingGoal: boolean,
	mutateGoal: VoidFunction
}): ReactElement {
	const [isClient, set_isClient] = useState<boolean>(false);
	const [isOpenIdentity, set_isOpenIdentity] = useState(false);
	const {address} = useWeb3();

	useMountEffect((): void => set_isClient(true));

	function renderEditButton(): ReactElement | null {
		if (isClient && toAddress(address) === toAddress(props.address)) {
			return (
				<motion.div
					className={'absolute top-4 flex w-full items-center justify-center'}
					initial={'initial'}
					animate={'enter'}
					variants={{
						initial: {opacity: 0, y: -100},
						enter: {
							opacity: 1,
							y: 0,
							transition: {delay: 1, duration: 0.4, ease: 'easeInOut'}
						}
					}}>
					<Link href={`/${props.ensHandle || props.address}/settings`}>
						<Button
							variant={'reverted'}
							className={'h-8 border-neutral-200 text-xs !font-bold shadow-md'}>
							{`Edit my ${props.identitySource === 'on-chain' ? 'ENS ': ''}profile`}
						</Button>
					</Link>
				</motion.div>
			);
		}
		return null;
	}

	function renderIdentitySourceButton(): ReactElement {
		if (props.identitySource === 'on-chain') {
			return (
				<div
					onClick={(): void => props.isOwner ? set_isOpenIdentity(true) : undefined}
					className={`absolute right-4 top-2 flex flex-row items-center space-x-1 ${props.isOwner ? 'group cursor-pointer' : ''}`}>
					<div className={'h-2 w-2 rounded-full bg-[#16a34a] opacity-60'} />
					<p className={`text-xxs text-neutral-400 ${props.isOwner ? 'group-hover:underline' : ''}`}>{'OnChain'}</p>
				</div>
			);
		}
		return (
			<div
				onClick={(): void => props.isOwner ? set_isOpenIdentity(true) : undefined}
				className={`absolute right-4 top-2 flex flex-row items-center space-x-1 ${props.isOwner ? 'group cursor-pointer' : ''}`}>
				<div className={'h-2 w-2 rounded-full bg-neutral-300 opacity-60'} />
				<p className={`text-xxs text-neutral-400 ${props.isOwner ? 'group-hover:underline' : ''}`}>{'OffChain'}</p>
			</div>
		);
	}

	return (
		<div className={'relative mb-10 w-full py-16'}>
			<Cover src={props.cover} />
			{renderEditButton()}
			<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
				<div className={'flex flex-col justify-center'}>
					<div className={'box-0 relative grid grid-cols-1 gap-10 p-6 shadow md:grid-cols-12'}>
						<SectionProfile {...props} />
						<SectionGoal {...props} />
						<div className={'col-span-7 mt-auto flex w-full justify-between pt-2 md:hidden'}>
							<SectionSocials {...props} />
						</div>
						{renderIdentitySourceButton()}
					</div>
				</div>
			</section>
			<ModalIdentitySource
				identity={props}
				isOpen={isOpenIdentity}
				set_isOpen={set_isOpenIdentity} />
		</div>
	);
}

export default SectionHero;
