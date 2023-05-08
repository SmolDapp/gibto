import React, {Fragment, useState} from 'react';
import Image from 'next/image';
import IconCheck from 'components/icons/IconCheck';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import {useWallet} from 'contexts/useWallet';
import {Contract} from 'ethcall';
import {isAddress} from 'ethers/lib/utils';
import {Combobox, Transition} from '@headlessui/react';
import {useAsync, useThrottledState, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import ERC20_ABI from '@yearn-finance/web-lib/utils/abi/erc20.abi';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider, newEthCallProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import {ImageWithFallback} from './common/ImageWithFallback';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {BigNumber, providers} from 'ethers';
import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';

type TComboboxAddressInput = {
	possibleDestinations: TDict<TTokenInfo>;
	value: string;
	onChangeValue: Dispatch<SetStateAction<TTokenInfo>>,
	onAddPossibleDestination: Dispatch<SetStateAction<TDict<TTokenInfo>>>
}

function ComboboxOption({option}: {option: TTokenInfo}): ReactElement {
	const	{balances} = useWallet();

	return (
		<Combobox.Option
			className={({active: isActive}): string => `relative cursor-pointer select-none py-2 px-4 ${isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-900'}`}
			value={toAddress(option.address)}>
			{({selected: isSelected}): ReactElement => (
				<div className={'flex w-full flex-row items-center space-x-4'}>
					<div className={'h-6 w-6'}>
						{(option?.logoURI || '') !== '' ? (
							<Image
								alt={''}
								unoptimized
								src={option?.logoURI}
								width={24}
								height={24} />
						) : <div className={'h-6 w-6 rounded-full bg-neutral-0'} />}
					</div>
					<div className={'flex flex-col font-sans text-neutral-900'}>
						<span>
							{`${option.symbol}`}
							<small className={'text-xs text-neutral-600'}>{` - ${formatAmount(balances?.[toAddress(option.address)]?.normalized || 0, 2, 6)} available`}</small>
						</span>
						<small className={'font-number hidden text-xs text-neutral-500 md:flex'}>
							{toAddress(option.address)}
						</small>
						<small className={'font-number flex text-xs text-neutral-500 md:hidden'}>
							{truncateHex(toAddress(option.address), 6)}
						</small>
					</div>
					{isSelected ? (
						<span
							className={'absolute inset-y-0 right-8 flex items-center'}>
							<IconCheck className={'absolute h-4 w-4 text-neutral-900'} />
						</span>
					) : null}
				</div>
			)}
		</Combobox.Option>
	);
}

function ComboboxAddressInput({possibleDestinations, value, onChangeValue, onAddPossibleDestination}: TComboboxAddressInput): ReactElement {
	const {provider} = useWeb3();
	const {balances} = useWallet();
	const {safeChainID} = useChainID();
	const [query, set_query] = useState('');
	const [isOpen, set_isOpen] = useThrottledState(false, 400);

	const [{result: tokenData}, fetchTokenData] = useAsync(async function fetchToken(
		_provider: providers.JsonRpcProvider,
		_safeChainID: number,
		_query: TAddress
	): Promise<{name: string, symbol: string, decimals: number} | undefined> {
		if (!isAddress(_query)) {
			return (undefined);

		}
		const currentProvider = _safeChainID === 1 ? _provider || getProvider(1) : getProvider(1);
		const ethcallProvider = await newEthCallProvider(currentProvider);
		const erc20Contract = new Contract(_query, ERC20_ABI);

		const calls = [erc20Contract.name(), erc20Contract.symbol(), erc20Contract.decimals()];
		const [name, symbol, decimals] = await ethcallProvider.tryAll(calls) as [string, string, BigNumber];
		return ({name, symbol, decimals: decimals.toNumber()});
	}, undefined);

	useUpdateEffect((): void => {
		fetchTokenData.execute(provider, safeChainID, toAddress(query));
	}, [fetchTokenData, provider, safeChainID, query]);

	const filteredDestinations = query === ''
		? Object.values(possibleDestinations || [])
		: Object.values(possibleDestinations || []).filter((dest): boolean =>
			`${dest.name}_${dest.symbol}`
				.toLowerCase()
				.replace(/\s+/g, '')
				.includes(query.toLowerCase().replace(/\s+/g, ''))
		);

	return (
		<div className={'w-full'}>
			{isOpen ? (
				<div
					className={'fixed inset-0 z-0'}
					onClick={(e): void => {
						e.stopPropagation();
						e.preventDefault();
						set_isOpen(false);
					}} />
			) : null}
			<Combobox<any>
				value={value}
				onChange={(_selected: TAddress): void => {
					onAddPossibleDestination((prev: TDict<TTokenInfo>): TDict<TTokenInfo> => {
						if (prev[_selected]) {
							return (prev);
						}
						return ({
							...prev,
							[toAddress(_selected)]: {
								address: toAddress(_selected),
								name: tokenData?.name || '',
								symbol: tokenData?.symbol || '',
								decimals: tokenData?.decimals || 18,
								chainId: safeChainID,
								logoURI: ''
							}
						});
					});
					performBatchedUpdates((): void => {
						onChangeValue({
							address: toAddress(_selected),
							name: possibleDestinations[toAddress(_selected)]?.name || '',
							symbol: possibleDestinations[toAddress(_selected)]?.symbol || '',
							decimals: possibleDestinations[toAddress(_selected)]?.decimals || 18,
							chainId: possibleDestinations[toAddress(_selected)].chainId || safeChainID,
							logoURI: possibleDestinations[toAddress(_selected)]?.logoURI || ''
						});
						set_isOpen(false);
					});
				}}>
				<div className={'relative'}>
					<Combobox.Button
						onClick={(): void => set_isOpen((o: boolean): boolean => !o)}
						className={'box-0 grow-1 col-span-12 flex h-10 w-full items-center p-2 px-4 md:col-span-9'}>
						<div className={'relative flex w-full flex-row items-center space-x-4'}>
							<div key={value} className={'h-6 w-6'}>
								{(possibleDestinations?.[toAddress(value)]?.logoURI || '') !== '' ? (
									<ImageWithFallback
										alt={''}
										unoptimized
										src={possibleDestinations?.[toAddress(value)]?.logoURI}
										width={24}
										height={24} />
								) : <div className={'h-6 w-6 rounded-full bg-neutral-0'} />}
							</div>
							<p className={'w-full overflow-x-hidden text-ellipsis whitespace-nowrap pr-4 font-normal text-neutral-900 scrollbar-none'}>
								<Combobox.Input
									className={'font-inter w-full cursor-default overflow-x-scroll border-none bg-transparent p-0 outline-none scrollbar-none'}
									displayValue={(dest: TAddress): string => possibleDestinations?.[toAddress(dest)]?.symbol || ''}
									placeholder={'Ethereum'}
									autoComplete={'off'}
									autoCorrect={'off'}
									spellCheck={false}
									onChange={(event): void => {
										performBatchedUpdates((): void => {
											set_isOpen(true);
											set_query(event.target.value);
										});
									}} />
							</p>
						</div>
						<div className={'absolute right-2 md:right-3'}>
							<IconChevronBoth className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'} />
						</div>
					</Combobox.Button>
					<Transition
						as={Fragment}
						show={isOpen}
						enter={'transition duration-100 ease-out'}
						enterFrom={'transform scale-95 opacity-0'}
						enterTo={'transform scale-100 opacity-100'}
						leave={'transition duration-75 ease-out'}
						leaveFrom={'transform scale-100 opacity-100'}
						leaveTo={'transform scale-95 opacity-0'}
						afterLeave={(): void => set_query('')}>
						<Combobox.Options className={'box-0 absolute left-0 z-50 mt-1 flex max-h-60 w-full min-w-fit flex-col overflow-y-auto scrollbar-none'}>
							{filteredDestinations.length === 0 && query !== '' && !tokenData ? (
								<div className={'relative cursor-default select-none px-4 py-2 text-neutral-500'}>
									{'No token found.'}
								</div>
							) : filteredDestinations.length === 0 && query !== '' && tokenData ? (
								<ComboboxOption
									option={{
										address: toAddress(query),
										chainId: safeChainID,
										name: tokenData.name,
										symbol: tokenData.symbol,
										decimals: tokenData.decimals,
										logoURI: ''
									}} />

							) : (
								filteredDestinations.filter((dest): boolean => {
									return (balances?.[toAddress(dest.address)]?.raw?.gt(0) || false);
								}).map((dest): ReactElement => (
									<ComboboxOption key={dest.address} option={dest} />
								))
							)}
						</Combobox.Options>
					</Transition>
				</div>
			</Combobox>
		</div>
	);
}

export default ComboboxAddressInput;
