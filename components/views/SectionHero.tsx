import React, {Fragment, useState} from 'react';
import Avatar from 'components/Avatar';
import Cover from 'components/Cover';
import IconSocialReddit from 'components/icons/IconSocialReddit';
import IconSocialTelegram from 'components/icons/IconSocialTelegram';
import IconSocialWebsite from 'components/icons/IconSocialWebsite';
import SocialMediaCard from 'components/SocialMediaCard';
import {motion} from 'framer-motion';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import IconSocialDiscord from '@yearn-finance/web-lib/icons/IconSocialDiscord';
import IconSocialGithub from '@yearn-finance/web-lib/icons/IconSocialGithub';
import IconSocialTwitter from '@yearn-finance/web-lib/icons/IconSocialTwitter';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import ModalEditProfile from './ModalEditProfile';
import ModalIdentitySource from './ModalIdentitySource';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function GoalSection(): ReactElement {
	return (
		<div className={'font-number col-span-5 flex w-full flex-col overflow-hidden border-l border-neutral-200 pl-10 text-xs md:text-sm'}>
			<div className={'relative flex h-full w-full flex-col items-center justify-center space-y-4'}>
				<svg
					xmlns={'http://www.w3.org/2000/svg'}
					viewBox={'0 0 512 512'}
					className={'h-14 w-14 text-neutral-400'}>
					<path d={'M326.3 9.8C304 3.4 280.4 0 256 0C114.6 0 0 114.6 0 256S114.6 512 256 512s256-114.6 256-256c0-24.4-3.4-48-9.8-70.3l-22.8 25.4c-1.1 1.2-2.1 2.3-3.3 3.4c2.5 13.5 3.8 27.3 3.8 41.5c0 123.7-100.3 224-224 224S32 379.7 32 256S132.3 32 256 32c14.2 0 28.1 1.3 41.5 3.8c1.1-1.1 2.2-2.2 3.4-3.3L326.3 9.8zM274.6 97.1c-6.1-.7-12.3-1.1-18.6-1.1C167.6 96 96 167.6 96 256s71.6 160 160 160s160-71.6 160-160c0-6.3-.4-12.5-1.1-18.6c-2.7-.2-5.4-.5-8.1-.9l-25-4.2c1.4 7.7 2.2 15.6 2.2 23.7c0 70.7-57.3 128-128 128s-128-57.3-128-128s57.3-128 128-128c8.1 0 16 .8 23.7 2.2l-4.2-25c-.5-2.7-.8-5.4-.9-8.1zm66.9 96.1l70.4 11.7c16.3 2.7 32.8-3.1 43.8-15.5L499.6 140c11.7-13.1 5.8-33.9-11-38.9L428.9 83.2 410.9 23.4c-5-16.8-25.8-22.7-38.9-11L322.6 56.3c-12.3 11-18.2 27.5-15.5 43.8l11.7 70.4-74.2 74.2c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l74.2-74.2zm27.8-27.8l51.3-51.3 46.8 14-35.6 40c-3.7 4.1-9.2 6.1-14.6 5.2l-47.9-8zm28.6-73.9l-51.3 51.3-8-47.9c-.9-5.4 1-10.9 5.2-14.6l40-35.6 14 46.8z'} fill={'currentcolor'} />
				</svg>
				<b>{'This user has not set a goal yet.'}</b>
			</div>
		</div>
	);
	return (
		<div className={'font-number col-span-5 flex w-full flex-col overflow-hidden border-l border-neutral-200 pl-10 pt-6 text-xs md:text-sm'}>
			<div className={'relative flex h-full w-full flex-col justify-center text-ellipsis p-4 pb-0'}>
				<p
					className={'h-auto w-full overflow-x-scroll border-none bg-transparent p-0 text-center text-4xl font-bold tabular-nums outline-none scrollbar-none'}>
					{'$2500'}
				</p>
				<p className={'font-number mb-4 mt-0 text-center text-xs text-neutral-600'} suppressHydrationWarning>
					{'out of goal of $5000'}
				</p>
				<div className={'relative h-2 w-full overflow-hidden rounded bg-neutral-200'}>
					<div className={'absolute inset-y-0 left-0 w-1/2 bg-[#3b82f6]'} />
				</div>
				<div className={'mt-auto pt-4'}>
					<a href={'#donate'}>
						<Button className={'w-full'}>
							{'GIB'}
						</Button>
					</a>
				</div>
			</div>
		</div>
	);
}

function ProfileSection(props: TReceiverProps): ReactElement {
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
			<div className={'-ml-2 flex flex-row items-center space-x-4'}>
				<Avatar
					address={toAddress(props.address)}
					src={props.avatar} />
				<span>
					<h1 className={'flex flex-row items-center text-3xl tracking-tight text-neutral-900 md:text-3xl'}>
						{`Gib to ${props.name}`}
						{renderCheck()}
					</h1>
					<p className={'font-number text-xs font-normal tracking-normal text-neutral-400'}>{props.address}</p>
				</span>
			</div>
			<p className={'mt-4 min-h-[60px] text-neutral-500'}>
				{props?.description || 'No description'}
			</p>
			<div className={'mt-auto flex flex-row space-x-4 pt-6'}>
				<SocialMediaCard
					href={`https://twitter.com/${props.twitter}`}
					className={props.twitter ? '' : 'pointer-events-none opacity-40'}
					icon={<IconSocialTwitter />} />
				<SocialMediaCard
					href={`https://github.com/${props.github}`}
					className={props.github ? '' : 'pointer-events-none opacity-40'}
					icon={<IconSocialGithub />} />
				<SocialMediaCard
					href={`https://discord.gg/${props.discord}`}
					className={props.discord ? '' : 'pointer-events-none opacity-40'}
					icon={<IconSocialDiscord />} />
				<SocialMediaCard
					href={`https://reddit.com/${props.reddit}`}
					className={props.reddit ? '' : 'pointer-events-none opacity-40'}
					icon={<IconSocialReddit />} />
				<SocialMediaCard
					href={`https://t.me/${props.telegram}`}
					className={props.telegram ? '' : 'pointer-events-none opacity-40'}
					icon={<IconSocialTelegram />} />
				<SocialMediaCard
					href={`https://${props.website}`}
					className={props.website ? '' : 'pointer-events-none opacity-40'}
					icon={<IconSocialWebsite />} />
			</div>
		</div>
	);
}

function SectionHero(props: TReceiverProps): ReactElement {
	const	[isOpen, set_isOpen] = useState(false);
	const	[isOpenIdentity, set_isOpenIdentity] = useState(false);
	const	{address} = useWeb3();

	function renderEditButton(): ReactElement | null {
		if (toAddress(address) === toAddress(props.address)) {
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
					<Button
						onClick={(): void => set_isOpen(true)}
						variant={'reverted'}
						className={'h-8 border-neutral-200 text-xs !font-bold shadow-md'}>
						{`Edit my ${props.identitySource === 'on-chain' ? 'ENS ': ''}profile`}
					</Button>
				</motion.div>
			);
		}
		return null;
	}

	function renderIdentitySourceButton(): ReactElement {
		const canEdit = toAddress(address) == toAddress(props.address);

		if (props.identitySource === 'on-chain') {
			return (
				<div
					onClick={(): void => canEdit ? set_isOpenIdentity(true) : undefined}
					className={`absolute right-4 top-2 flex flex-row items-center space-x-1 ${canEdit ? 'group cursor-pointer' : ''}`}>
					<div className={'h-2 w-2 rounded-full bg-[#16a34a] opacity-60'} />
					<p className={`text-xxs text-neutral-400 ${canEdit ? 'group-hover:underline' : ''}`}>{'OnChain'}</p>
				</div>
			);
		}
		return (
			<div
				onClick={(): void => canEdit ? set_isOpenIdentity(true) : undefined}
				className={`absolute right-4 top-2 flex flex-row items-center space-x-1 ${canEdit ? 'group cursor-pointer' : ''}`}>
				<div className={'h-2 w-2 rounded-full bg-neutral-300 opacity-60'} />
				<p className={`text-xxs text-neutral-400 ${canEdit ? 'group-hover:underline' : ''}`}>{'OffChain'}</p>
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
						<ProfileSection {...props} />
						<GoalSection />
						{renderIdentitySourceButton()}
					</div>
				</div>
			</section>
			<ModalEditProfile
				key={props.identitySource}
				identity={props}
				isOpen={isOpen}
				set_isOpen={set_isOpen} />
			<ModalIdentitySource
				identity={props}
				isOpen={isOpenIdentity}
				set_isOpen={set_isOpenIdentity} />
		</div>
	);
}

export default SectionHero;
