import React from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from 'components/common/Select';
import useWallet from 'contexts/useWallet';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import {ImageWithFallback} from '../ImageWithFallback';

import type {ReactElement} from 'react';
import type {TToken} from 'utils/types/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export function PlaceholderOption(): ReactElement {
	return (
		<div className={'flex flex-row items-center gap-3'}>
			<div className={'h-7 w-7 min-w-[28px]'}>
				<ImageWithFallback
					alt={''}
					src={'https://assets.smold.app/not-found.png'}
					width={28}
					height={28}
				/>
			</div>
			<div className={'text-neutral-900'}>
				<span className={'inline-flex items-center'}>
					<p className={'text-base text-neutral-600/60'}>{'Select a token'}</p>
				</span>
			</div>
		</div>
	);
}

export function SelectTokenOption({token}: {token: TToken}): ReactElement {
	const {getBalance} = useWallet();

	return (
		<div className={'flex flex-row items-center gap-3'}>
			<div className={'h-7 w-7 min-w-[28px]'}>
				<ImageWithFallback
					alt={token.name || ''}
					unoptimized={!token.logoURI?.includes('assets.smold.app') || true}
					src={
						token.logoURI?.includes('assets.smold.app')
							? `${process.env.SMOL_ASSETS_URL}/token/${token.chainID}/${token.address}/logo-32.png`
							: token.logoURI || ''
					}
					width={28}
					height={28}
				/>
			</div>
			<div className={'text-neutral-900'}>
				<span className={'inline-flex items-center'}>
					<p className={'text-base'}>{token.symbol}</p>
					<small className={'text-xxs text-neutral-600'}>
						&nbsp;
						{` - ${formatAmount(getBalance(toAddress(token.address))?.normalized, 6, 6)} ${token.symbol}`}
					</small>
				</span>

				<div className={'-mt-1.5'}>
					<small className={'font-number text-xxs text-neutral-600/60'}>{token.address}</small>
				</div>
			</div>
		</div>
	);
}

export function UniqueTokenSelector({token}: {token: TToken | undefined}): ReactElement {
	return (
		<div
			className={cl(
				'flex h-[48px] w-full items-center justify-start rounded-md',
				'bg-neutral-0 border border-neutral-200 px-2'
			)}>
			{token ? <SelectTokenOption token={token} /> : <PlaceholderOption />}
		</div>
	);
}

type TMultipleTokenSelector = {
	token: TToken | undefined;
	tokens: TToken[];
	onChangeToken?: (token: TToken, tokenBalance: TNormalizedBN | undefined) => void;
};
export function MultipleTokenSelector({token, tokens, onChangeToken}: TMultipleTokenSelector): ReactElement {
	return (
		<Select
			onValueChange={e => {
				const newToken = (tokens || []).find((item): boolean => item.address === e);
				if (newToken && onChangeToken) {
					onChangeToken(newToken, undefined);
				}
			}}>
			<SelectTrigger
				className={cl(
					'flex min-h-[48px] h-[48px] w-full items-center justify-start rounded-md',
					'bg-neutral-0 border border-neutral-200 transition-colors',
					'data-[state=open]:border-primary-500'
				)}>
				<SelectValue placeholder={<PlaceholderOption />}>
					{token ? <SelectTokenOption token={token} /> : <PlaceholderOption />}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{(tokens || []).map(
					(item): ReactElement => (
						<SelectItem
							key={item.address}
							value={item.address}>
							<SelectTokenOption token={item} />
						</SelectItem>
					)
				)}
			</SelectContent>
		</Select>
	);
}
