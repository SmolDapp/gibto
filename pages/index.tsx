import React, {useCallback, useMemo, useState} from 'react';
import FlipMove from 'react-flip-move';
import Link from 'next/link';
import {useRouter} from 'next/router';
import Avatar from 'components/Avatar';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {isAddress} from 'ethers/lib/utils';
import {checkENSValidity, checkLensValidity} from 'utils';
import lensProtocol from 'utils/lens.tools';
import useSWR from 'swr';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useUI} from '@yearn-finance/web-lib/contexts/useUI';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	SearchFor(): ReactElement {
	const router = useRouter();
	const	{onLoadStart, onLoadDone} = useUI();

	const [value, set_value] = useState<string>('');
	const [isValidValue, set_isValidValue] = useState<boolean | 'undetermined'>('undetermined');
	const [isValidish, set_isValidish] = useState<boolean | 'undetermined'>('undetermined');
	const [isLoadingValidish, set_isLoadingValidish] = useState<boolean>(false);
	const [namedValue, set_namedValue] = useState<string>('');

	const	checkDestinationValidity = useCallback(async (): Promise<void> => {
		set_isValidValue('undetermined');
		if (namedValue && isValidish) {
			set_isValidValue(true);
		} else if (!isZeroAddress(toAddress(value))) {
			set_isValidValue(true);
		} else {
			if (value.endsWith('.eth')) {
				const	resolvedAddress = await getProvider(1).resolveName(value);
				if (resolvedAddress) {
					if (isAddress(resolvedAddress)) {
						performBatchedUpdates((): void => {
							set_namedValue(toAddress(resolvedAddress));
							set_isValidValue(true);
						});
						return;
					}
				}
			}
			if (value.endsWith('.lens')) {
				const	resolvedAddress = await lensProtocol.getAddressFromHandle(value);
				if (resolvedAddress) {
					if (isAddress(resolvedAddress)) {
						performBatchedUpdates((): void => {
							set_namedValue(toAddress(resolvedAddress));
							set_isValidValue(true);
						});
						return;
					}
				}
			}
			set_isValidValue(false);
		}
	}, [namedValue, isValidish, value, set_namedValue]);

	useUpdateEffect((): void => {
		if (namedValue === '' || isZeroAddress(toAddress(namedValue))) {
			set_namedValue(value);
		}
	}, [value]);

	useUpdateEffect((): void => {
		set_isValidValue('undetermined');
		set_isValidish('undetermined');
		if (value.endsWith('.eth')) {
			set_isLoadingValidish(true);
			checkENSValidity(value).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_namedValue(validishDest);
				});
			});
		} else if (value.endsWith('.lens')) {
			set_isLoadingValidish(true);
			checkLensValidity(value).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_namedValue(validishDest);
				});
			});
		} else if (!isZeroAddress(toAddress(value))) {
			set_isValidValue(true);
		} else {
			set_isValidish(false);
		}
	}, [value]);

	return (
		<form
			onSubmit={async (e): Promise<void> => {
				e.preventDefault();
				if (isValidValue || isValidish) {
					onLoadStart();
					await router.push(`/${value}`);
					onLoadDone();
				}
			}}>
			<div className={'relative mt-2'}>
				<input
					id={'search'}
					className={'h-16 w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 pr-10 text-base text-neutral-900 transition-colors placeholder:text-neutral-500 focus:border-neutral-300 focus:outline-none focus:ring-0 focus:ring-transparent'}
					aria-invalid={!isValidValue}
					onFocus={async (): Promise<void> => checkDestinationValidity()}
					onBlur={async (): Promise<void> => checkDestinationValidity()}
					type={'text'}
					spellCheck={false}
					autoComplete={'off'}
					required
					placeholder={'Search by ens handle or address'}
					value={value}
					onChange={(e): void => {
						set_isValidValue('undetermined');
						set_value(e.target.value as never);
					}} />
				<div className={'absolute inset-y-0 right-4 flex h-full items-center justify-center'}>
					<div className={'pointer-events-none relative mr-4 h-4 w-4'}>
						<IconCheck
							className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${isValidValue === true || isValidish === true ? 'opacity-100' : 'opacity-0'}`} />
						<IconCircleCross
							className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${(isValidValue === false && toAddress(value) !== toAddress() && !isLoadingValidish) ? 'opacity-100' : 'opacity-0'}`} />
						<div className={'absolute inset-0 flex items-center justify-center'}>
							<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${isLoadingValidish ? 'opacity-100' : 'opacity-0'}`} />
						</div>
					</div>
					<Button disabled={!(isValidValue === true || isValidish === true )}>
						{'Search'}
					</Button>
				</div>
			</div>
		</form>
	);
}

function	Home(): ReactElement {
	const [selectedIndex, set_selectedIndex] = useState<number>(0);
	const {data} = useSWR<TReceiverProps[]>(
		`${process.env.BASE_API_URI}/profiles/featured`,
		baseFetcher, {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 0
		}
	);

	const randomOrderedData = useMemo((): TReceiverProps[] => {
		selectedIndex;
		if (data) {
			const orderedData = [...data];
			orderedData.forEach((item): void => {
				item.order = Math.random();
			});
			orderedData.sort((a, b): number => {
				return ((a?.order || 0) - (b?.order || 0));
			});
			return orderedData;
		}
		return [];
	}, [data, selectedIndex]);

	return (
		<div>
			<div className={'mx-auto grid w-full max-w-5xl'}>
				<div className={'mx-auto my-6 flex max-w-3xl flex-col justify-center text-center md:mt-20'}>
					<h1 className={'-ml-1 mt-4 text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
						{'Sponsorship, unrestricted'}
					</h1>
					<p className={'mt-4 w-full text-base leading-normal text-neutral-500 md:text-lg md:leading-8'}>
						{'Designed to provide unrestricted funding, resources, and guidance to help you bring your ideas to life.'}
					</p>
				</div>

				<div className={'mx-auto w-full max-w-3xl'}>
					<SearchFor />
				</div>
			</div>

			<div className={'mx-auto mt-24 hidden w-full max-w-5xl'}>
				<div className={'mb-4 flex flex-row space-x-4 overflow-x-scroll'}>
					<div
						onClick={(): void => set_selectedIndex(0)}
						className={`cursor-pointer rounded-2xl border border-neutral-200 px-4 py-1 ${selectedIndex === 0 ? 'bg-neutral-100' : 'bg-neutral-0'}`}>
						{'Featured'}
					</div>
					<div
						onClick={(): void => set_selectedIndex(1)}
						className={`cursor-pointer rounded-2xl border border-neutral-200 px-4 py-1 ${selectedIndex === 1 ? 'bg-neutral-100' : 'bg-neutral-0'}`}>
						{'Recently Added'}
					</div>
					<div
						onClick={(): void => set_selectedIndex(2)}
						className={`cursor-pointer rounded-2xl border border-neutral-200 px-4 py-1 ${selectedIndex === 2 ? 'bg-neutral-100' : 'bg-neutral-0'}`}>
						{'Art'}
					</div>
					<div
						onClick={(): void => set_selectedIndex(3)}
						className={`cursor-pointer rounded-2xl border border-neutral-200 px-4 py-1 ${selectedIndex === 3 ? 'bg-neutral-100' : 'bg-neutral-0'}`}>
						{'Music'}
					</div>
					<div
						onClick={(): void => set_selectedIndex(4)}
						className={`cursor-pointer rounded-2xl border border-neutral-200 px-4 py-1 ${selectedIndex === 4 ? 'bg-neutral-100' : 'bg-neutral-0'}`}>
						{'Writing'}
					</div>
				</div>
			</div>

			<div className={'relative mt-16 w-full overflow-x-hidden'}>
				<div className={'ml-[-10vw] flex w-[120vw] items-center justify-center'}>
					<div className={'mb-44'}>
						<FlipMove
							duration={500}
							easing={'ease-in-out'}
							className={'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}>
							{randomOrderedData?.map((receiver, i): ReactElement => {
								let {cover} = receiver;
								if (cover.startsWith('https://gateway.pinata.cloud/ipfs')) {
									cover = cover.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs');
								}
								if (cover.startsWith('ipfs://')) {
									cover = cover.replace('ipfs://', 'https://ipfs.io/ipfs/');
								}
								return (
									<Link
										key={receiver.UUID}
										href={`/${receiver.ensHandle || receiver.address}`}
										className={`h-full w-full ${
											i < 6 ? 'hidden sm:hidden md:hidden lg:hidden xl:flex' :
												i < 12 ? 'hidden sm:hidden md:hidden lg:flex' :
													i < 15 ? 'hidden sm:hidden md:flex' :
														i < 16 ? 'hidden sm:flex' :
															i < 18 ? 'flex' : ''
										}`}>
										<div
											className={'box-100 h-full w-full !rounded-xl bg-cover bg-center p-2'}
											style={{backgroundImage: `url('${cover}')`}}>

											<div className={'box-0 h-full !rounded-lg py-4'}>
												<div className={'flex items-center justify-center'}>
													<Avatar
														address={toAddress(receiver.address)}
														src={receiver.avatar} />
												</div>
												<div className={'flex items-center justify-center'}>
													<h1 className={'flex flex-row items-center pt-2 text-xl capitalize tracking-tight text-neutral-900 md:text-2xl'}>
														{receiver.name}
													</h1>
												</div>
												<div className={'flex items-center justify-center'}>
													<p className={'font-number text-center text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
														{truncateHex(receiver.address, 4)}
													</p>
												</div>

												<p className={'mt-2 px-4 text-sm text-neutral-500 md:mt-4'}>
													{receiver?.description || `${receiver.name} hasn’t written anything yet. must be shy...`}
												</p>
											</div>
										</div>
									</Link>
								);
							})}
						</FlipMove>

					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
