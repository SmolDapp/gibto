import React, {useState} from 'react';
import IconMenuAddresses from 'components/icons/IconMenuAddresses';
import IconMenuGoals from 'components/icons/IconMenuGoals';
import IconMenuProfile from 'components/icons/IconMenuProfile';
import IconMenuSocials from 'components/icons/IconMenuSocials';
import Avatar from 'components/profile/Avatar';
import ViewSettingsAddresses from 'components/settings/ViewSettingsAddresses';
import ViewSettingsGoal from 'components/settings/ViewSettingsGoal';
import ViewSettingsImages from 'components/settings/ViewSettingsImages';
import ViewSettingsProfile from 'components/settings/ViewSettingsProfile';
import ViewSettingsSocials from 'components/settings/ViewSettingsSocials';
import {useWeb3} from 'contexts/useWeb3';
import {thumbnailVariants} from 'utils';
import axios from 'axios';
import useSWR from 'swr';
import {AnimatePresence, motion} from 'framer-motion';
import {useMountEffect} from '@react-hookz/web';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import type {GetServerSideProps, GetServerSidePropsResult} from 'next';
import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';
import type {TGoal, TReceiverProps} from 'utils/types';

function	Receiver(props: TReceiverProps & AppProps): ReactElement {
	const [page, set_page] = useState<'profile' | 'media' | 'goal' | 'socials' | 'addresses'>('profile');
	const {address} = useWeb3();
	const {data, mutate} = useSWR<TReceiverProps>(
		`${process.env.BASE_API_URI}/profile/${toAddress(props.address)}`,
		baseFetcher, {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 0
		}
	);

	const {data: goal, mutate: mutateGoal} = useSWR<TGoal>(
		`${process.env.BASE_API_URI}/goal/${toAddress(props.address)}`,
		baseFetcher, {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 0
		}
	);

	useMountEffect((): void => {
		if (props.router.query.tab) {
			if (props?.router?.query?.tab === 'profile') {
				set_page('profile');
			} else if (props?.router?.query?.tab === 'media') {
				set_page('media');
			} else if (props?.router?.query?.tab === 'goal') {
				set_page('goal');
			} else if (props?.router?.query?.tab === 'socials') {
				set_page('socials');
			} else if (props?.router?.query?.tab === 'addresses') {
				set_page('addresses');
			}
		}
	});

	const	profile = {...(data || props)};
	if (toAddress(address) == toAddress(profile.address)) {
		return (
			<div className={'h-full min-h-screen bg-neutral-50 pt-10'}>
				<div className={'mx-auto mb-24 grid w-full max-w-5xl grid-cols-12 gap-6'}>
					<aside className={'col-span-12 md:col-span-3'}>
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
							<menu className={'grid grid-cols-2 gap-4 md:grid-cols-1'}>
								<button
									onClick={(): void => {
										set_page('profile');
										props.router.push(`/${props.ensHandle || props.address}/settings?tab=profile`, undefined, {shallow: true});
									}}
									className={`${page === 'profile' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
									<IconMenuProfile className={'mr-3 h-3.5 w-3.5'} />
									{'Profile'}
								</button>
								<button
									onClick={(): void => {
										set_page('addresses');
										props.router.push(`/${props.ensHandle || props.address}/settings?tab=addresses`, undefined, {shallow: true});
									}}
									className={`${page === 'addresses' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
									<IconMenuAddresses className={'mr-3 h-3.5 w-3.5'} />
									{'Addresses'}
								</button>
								<button
									onClick={(): void => {
										set_page('socials');
										props.router.push(`/${props.ensHandle || props.address}/settings?tab=socials`, undefined, {shallow: true});
									}}
									className={`${page === 'socials' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
									<IconMenuSocials className={'mr-3 h-3.5 w-3.5'} />
									{'Socials'}
								</button>
								<button
									onClick={(): void => {
										set_page('goal');
										props.router.push(`/${props.ensHandle || props.address}/settings?tab=goal`, undefined, {shallow: true});
									}}
									className={`${page === 'goal' ? 'text-neutral-900' : 'text-neutral-500'} flex flex-row items-center text-left transition-colors hover:text-neutral-600`}>
									<IconMenuGoals className={'mr-3 h-3.5 w-3.5'} />
									{'Goals'}
								</button>
							</menu>
						</div>
					</aside>
					<div className={'relative col-span-12 w-full md:col-span-9'}>
						<AnimatePresence mode={'wait'}>
							<motion.div
								key={page}
								initial={'initial'}
								animate={'enter'}
								exit={'exit'}
								variants={thumbnailVariants}>

								{page === 'profile' && (
									<div className={'box-0 w-full p-6'}>
										<ViewSettingsProfile {...props} mutate={mutate} />
									</div>
								)}
								{page === 'media' && (
									<div className={'box-0 w-full p-6'}>
										<ViewSettingsImages {...props} mutate={mutate} />
									</div>
								)}
								{page === 'goal' && (
									<div className={'box-0 w-full p-6'}>
										<ViewSettingsGoal {...goal as TGoal} mutate={mutateGoal} />
									</div>
								)}
								{page === 'socials' && (
									<div className={'box-0 w-full p-6'}>
										<ViewSettingsSocials {...props} mutate={mutate} />
									</div>
								)}
								{page === 'addresses' && (
									<div className={'box-0 w-full p-6'}>
										<ViewSettingsAddresses {...props} mutate={mutate} />
									</div>
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		);
	}
	return <div />;
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<GetServerSidePropsResult<TReceiverProps>> => {
	const {receiver} = context.query;
	const {data: creator} = await axios.get(`${process.env.BASE_API_URI}/quickprofile/${receiver}`);
	return {props: creator};
};

export default Receiver;

