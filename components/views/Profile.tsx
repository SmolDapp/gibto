import React, {useCallback, useState} from 'react';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import useWallet from 'contexts/useWallet';
import useSWR from 'swr';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {formatDuration} from '@yearn-finance/web-lib/utils/format.time';

import AboutSection from './AboutSection';
import DonationSection from './DonationSection';
import HeroSection from './HeroSection';

import type {TUseBalancesTokens} from 'hooks/useBalances';
import type {ReactElement} from 'react';
import type {TDonationsProps, TReceiverProps} from 'utils/types';

function	DonationHistory({donateHistory}: {donateHistory: TDonationsProps[]}): ReactElement {
	const chains = useChain();

	return (
		<section>
			{donateHistory?.map((donation): ReactElement => (
				<div key={donation.UUID} className={'yearn--table-wrapper mb-2'}>
					<div className={'yearn--table-token-section'}>
						<div className={'yearn--table-token-section-item'}>
							<div className={'yearn--table-token-section-item-image'}>
								<ImageWithFallback
									key={`${donation.UUID}_${donation.token}`}
									alt={''}
									width={40}
									height={40}
									quality={90}
									src={`https://assets.smold.app/api/token/${donation.chainID}/${donation.token}/logo-128.png`}
									loading={'eager'} />
							</div>
							<div className={'flex flex-col'}>
								<p>
									{formatAmount(donation.amount, 0, 4)}
									<span className={'text-sm text-neutral-400'}>{` ${donation.tokenName}`}</span>
								</p>
								<small className={'font-number text-xs text-neutral-400'}>
									{`$${formatAmount(donation.value, 0, 2)}`}
								</small>
							</div>
						</div>
					</div>

					<div className={'yearn--table-data-section md:grid-cols-9'}>
						<div className={'yearn--table-data-section-item md:col-span-7'}>
							<p className={'text-start text-xs leading-5 text-neutral-400'}>{'From'}</p>
							<a
								href={`${chains.get(donation.chainID)?.block_explorer || 'https://etherscan.io'}/address/${donation.txHash}`}
								target={'_blank'}
								rel={'noreferrer'}
								className={'hover:underline'}>
								<b className={'yearn--table-data-section-item-value font-number'}>
									{donation.from}
								</b>
							</a>
						</div>

						<div className={'yearn--table-data-section-item md:col-span-2'}>
							<p className={'yearn--table-data-section-item-label'}>{'Hash'}</p>
							<div
								className={'font-number flex h-full flex-row items-center justify-end pt-2'}>
								<p className={'text-xs text-neutral-400'}>
									{formatDuration((donation.time * 1000) - new Date().valueOf(), true)}
								</p>
								<a
									href={`${chains.get(donation.chainID)?.block_explorer || 'https://etherscan.io'}/tx/${donation.txHash}`}
									target={'_blank'}
									rel={'noreferrer'}
									className={'text-neutral-400 transition-colors hover:text-neutral-900'}>
									<IconLinkOut className={'h-4 w-4 md:ml-4'} />
								</a>
							</div>
						</div>

					</div>
				</div>
			))}

		</section>
	);
}

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
			<HeroSection {...props} />
			<div className={'mx-auto mb-20 grid w-full max-w-5xl'}>
				<AboutSection {...props} />
				<div className={'mb-20'}>
					<h2 id={'donate'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
						{'Donate'}
					</h2>
					<DonationSection
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
					<DonationHistory donateHistory={donateHistory || []} />
				</div>
			</div>
		</>
	);
}

export default Profile;
