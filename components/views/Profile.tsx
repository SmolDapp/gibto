import React, {useCallback, useState} from 'react';
import {useWallet} from 'contexts/useWallet';
import useSWR from 'swr';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import SectionAbout from './SectionAbout';
import SectionDonate from './SectionDonate';
import SectionDonationHistory from './SectionDonationHistory';
import SectionHero from './SectionHero';

import type {TUseBalancesTokens} from 'hooks/useBalances';
import type {ReactElement} from 'react';
import type {TDonationsProps, TReceiverProps} from 'utils/types';

function	Profile(props: TReceiverProps): ReactElement {
	const {balances, refresh} = useWallet();
	const limit = 25;
	const [currentPage, set_currentPage] = useState<number>(1);
	const {data: donateHistory, mutate} = useSWR<TDonationsProps[]>(
		`${process.env.BASE_API_URI}/gives/${toAddress(props.address)}?page=${currentPage}`,
		baseFetcher, {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 0
		}
	);

	const onDonateCallback = useCallback(async (toRefresh?: TUseBalancesTokens): Promise<void> => {
		const refreshArr = [];
		refreshArr.push({
			token: ETH_TOKEN_ADDRESS,
			decimals: balances[ETH_TOKEN_ADDRESS].decimals,
			symbol: balances[ETH_TOKEN_ADDRESS].symbol,
			name: balances[ETH_TOKEN_ADDRESS].name
		});
		if (toRefresh) {
			refreshArr.push({
				token: toAddress(toRefresh.token),
				decimals: toRefresh.decimals,
				symbol: toRefresh.symbol,
				name: toRefresh.name
			});
		}
		await Promise.all([
			mutate(),
			refresh(refreshArr)
		]);
	}, [balances, mutate, refresh]);

	return (
		<>
			<SectionHero {...props} />
			<div className={'mx-auto mb-20 grid w-full max-w-5xl'}>
				<SectionAbout {...props} />
				<div className={'mb-20'}>
					<h2 id={'donate'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
						{'Donate'}
					</h2>
					<SectionDonate
						onDonateCallback={onDonateCallback}
						{...props} />
				</div>
				<div className={'mb-72'}>
					<div className={'flex flex-row items-center justify-between'}>
						<h2 id={'history'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
							{'History'}
						</h2>
						<div className={'flex flex-row rounded border border-neutral-200'}>
							<button
								disabled={currentPage === 1}
								onClick={(): void => {
									if (currentPage > 1) {
										set_currentPage(currentPage - 1);
									}
								}}
								className={'cursor-pointer rounded-l border-r border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-40 hover:disabled:bg-neutral-0'}>
								{'Prev'}
							</button>
							<button
								disabled={(donateHistory?.length || 0) < limit}
								onClick={(): void => {
									if (donateHistory && donateHistory.length === limit) {
										set_currentPage(currentPage + 1);
									}
								}}
								className={'cursor-pointer rounded-r border-r border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-40 hover:disabled:bg-neutral-0'}>
								{'Next'}
							</button>
						</div>
					</div>
					<SectionDonationHistory donateHistory={donateHistory || []} />
				</div>
			</div>
		</>
	);
}

export default Profile;
