import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import IconMenuAddresses from 'components/icons/IconMenuAddresses';
import IconMenuGoals from 'components/icons/IconMenuGoals';
import IconMenuProfile from 'components/icons/IconMenuProfile';
import IconMenuSocials from 'components/icons/IconMenuSocials';
import Avatar from 'components/profile/Avatar';
import {thumbnailVariants} from 'utils';
import {AnimatePresence, motion} from 'framer-motion';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import ViewSettingsAddresses from './ViewSettingsAddresses';
import ViewSettingsGoal from './ViewSettingsGoal';
import ViewSettingsImages from './ViewSettingsImages';
import ViewSettingsProfile from './ViewSettingsProfile';
import ViewSettingsSocials from './ViewSettingsSocials';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	Settings(props: TReceiverProps): ReactElement {
	console.log(props);
	const router = useRouter();
	const [page, set_page] = useState<'profile' | 'media' | 'goal' | 'socials' | 'addresses'>('profile');

	useEffect((): void => {
		if (router.query.tab) {
			set_page(router.query.tab as 'profile' | 'media' | 'goal' | 'socials' | 'addresses');
		}
	}, [router]);

	return (
		<div className={'h-full min-h-screen bg-neutral-50 pt-10'}>
			<div className={'mx-auto mb-24 grid w-full max-w-5xl grid-cols-12 gap-6'}>
				<aside className={'col-span-3'}>
					<div className={'box-0 sticky top-20 p-6'}>
						<div className={'mb-5 flex flex-row items-center space-x-3 border-b border-neutral-200 pb-5'}>
							<Avatar
								address={toAddress(props.address)}
								src={props.avatar} />
							<span>
								<h1 className={'flex flex-row items-center text-base tracking-tight text-neutral-900'}>
									{props.name}
								</h1>
								<p className={'font-number text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
									<span>{truncateHex(props.address, 6)}</span>
								</p>
							</span>
						</div>
						<menu className={'flex flex-col space-y-4'}>
							<button
								onClick={(): void => set_page('profile')}
								className={`${page === 'profile' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
								<IconMenuProfile className={'mr-3 h-3.5 w-3.5'} />
								{'Profile'}
							</button>
							<button
								onClick={(): void => set_page('addresses')}
								className={`${page === 'addresses' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
								<IconMenuAddresses className={'mr-3 h-3.5 w-3.5'} />
								{'Addresses'}
							</button>
							<button
								onClick={(): void => set_page('socials')}
								className={`${page === 'socials' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
								<IconMenuSocials className={'mr-3 h-3.5 w-3.5'} />
								{'Socials'}
							</button>
							<button
								onClick={(): void => set_page('goal')}
								className={`${page === 'goal' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
								<IconMenuGoals className={'mr-3 h-3.5 w-3.5'} />
								{'Goals'}
							</button>
						</menu>
					</div>
				</aside>
				<div className={'relative col-span-9 w-full'}>
					<AnimatePresence mode={'wait'}>
						<motion.div
							key={page}
							initial={'initial'}
							animate={'enter'}
							exit={'exit'}
							variants={thumbnailVariants}>

							{page === 'profile' && (
								<div className={'box-0 w-full p-6'}>
									<ViewSettingsProfile {...props} />
								</div>
							)}
							{page === 'media' && (
								<div className={'box-0 w-full p-6'}>
									<ViewSettingsImages {...props} />
								</div>
							)}
							{page === 'goal' && (
								<div className={'box-0 w-full p-6'}>
									<ViewSettingsGoal {...props} />
								</div>
							)}
							{page === 'socials' && (
								<div className={'box-0 w-full p-6'}>
									<ViewSettingsSocials {...props} />
								</div>
							)}
							{page === 'addresses' && (
								<div className={'box-0 w-full p-6'}>
									<ViewSettingsAddresses {...props} />
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

export default Settings;
