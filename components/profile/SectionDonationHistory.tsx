import React from 'react';
import Link from 'next/link';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconSpinner from 'components/icons/IconSpinner';
import {useWeb3} from 'contexts/useWeb3';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {formatDuration} from '@yearn-finance/web-lib/utils/format.time';

import type {ReactElement} from 'react';
import type {TDonationsProps} from 'utils/types';

function	SectionDonationHistory({donateHistory, isLoading, name}: {
	name: string,
	donateHistory: TDonationsProps[],
	isLoading: boolean,
}): ReactElement {
	const chains = useChain();
	const {address} = useWeb3();

	if (isLoading && donateHistory.length === 0) {
		return (
			<section className={'box-100 mb-2 flex h-40 w-full items-center justify-center space-x-2 pt-6 text-sm text-neutral-400'}>
				<IconSpinner />
				<p>{'Loading history...'}</p>
			</section>
		);
	} if (!isLoading && donateHistory.length === 0) {
		return (
			<section className={'box-100 mb-2 flex h-52 w-full flex-col items-center justify-center space-y-6 pt-6 text-sm text-neutral-400'}>
				<div className={'flex items-center justify-center space-x-2'}>
					<IconCircleCross className={'h-4 w-4 text-neutral-400'} />
					<p>{`No gib for ${name}`}</p>
				</div>
				<a href={'#donate'}>
					<Button
						className={'!h-9 min-w-[160px]'}
						variant={'filled'}>
						{'Gib now'}
					</Button>
				</a>
			</section>
		);
	}
	return (
		<section>
			{donateHistory?.map((donation): ReactElement => (
				<details
					key={donation.UUID}
					className={'mb-2 w-full rounded border border-neutral-200'}>
					<summary className={'relative grid px-4 py-2 md:grid-cols-9 md:px-6'}>
						<div className={'yearn--table-token-section'}>
							<div className={'yearn--table-token-section-item'}>
								<div className={'yearn--table-token-section-item-image'}>
									<ImageWithFallback
										key={`${donation.UUID}_${donation.token}`}
										alt={''}
										width={40}
										height={40}
										quality={90}
										src={`https://assets.smold.app/api/token/${donation.chainID === 1337 ? 1 : donation.chainID}/${donation.token}/logo-128.png`}
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
							<div className={'yearn--table-data-section-item md:col-span-6'}>
								<p className={'text-start text-xs leading-5 text-neutral-400'}>{'From'}</p>
								<b className={'yearn--table-data-section-item-value font-number'}>
									<Link
										href={`/${donation.from}`}
										className={'hover:underline'}>
										{toAddress(donation.from) === toAddress(address) ? 'You' : (donation.fromENS || donation.from)}
									</Link>
								</b>
							</div>

							<div className={'yearn--table-data-section-item absolute right-4 top-2 md:relative md:col-span-3'}>
								<div className={'font-number mt-2 flex h-full flex-row items-center justify-end md:-mt-2'}>
									<p className={'text-xs text-neutral-400'}>
										{formatDuration((donation.time * 1000) - new Date().valueOf(), true)}
									</p>
									<a
										href={`${chains.get(donation.chainID)?.block_explorer || 'https://etherscan.io'}/tx/${donation.txHash}`}
										target={'_blank'}
										rel={'noreferrer'}
										className={'mx-2 text-neutral-400 transition-colors hover:text-neutral-900 md:mx-0'}>
										<IconLinkOut className={'h-4 w-4 md:ml-4'} />
									</a>
									<IconChevronBoth
										className={`-mr-2 h-4 w-4 text-neutral-400 transition-colors hover:text-neutral-900 md:ml-4 ${donation.message ? '' : 'pointer-events-none hidden opacity-0 md:flex'}`} />
								</div>
							</div>
						</div>
					</summary>
					{donation.message && (
						<div className={'border-t border-neutral-200 p-4'}>
							<div className={'border-l-2 border-neutral-300'}>
								<div className={'bg-neutral-0 p-4'}>
									<p className={'text-sm text-neutral-700'}>{donation.message}</p>
								</div>
							</div>
						</div>
					)}
				</details>
			))}

		</section>
	);
}

export default SectionDonationHistory;
