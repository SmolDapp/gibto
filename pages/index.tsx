import React, {useCallback, useMemo, useState} from 'react';
import Marquee from 'react-fast-marquee';
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
		`${process.env.BASE_API_URI}/profiles/featured2`,
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

	function renderProfileBox(receiver: TReceiverProps, i: number): ReactElement {
		let {cover} = receiver;
		if (cover.startsWith('https://gateway.pinata.cloud/ipfs')) {
			cover = cover.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs');
		}
		if (cover.startsWith('ipfs://')) {
			cover = cover.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		return (
			<Link
				key={`${receiver.UUID}_${i}`}
				href={`/${receiver.ensHandle || receiver.address}`}
				className={'h-full w-full'}>
				<div
					className={'box-100 group mr-4 h-full  w-[20rem] overflow-hidden !rounded-xl bg-cover bg-center p-2 transition-all duration-500 ease-in-out hover:p-0'}
					style={{backgroundImage: `url(${cover})`}}>
					<div className={'box-0 h-full !rounded-lg p-4 transition-all duration-500 ease-in-out group-hover:!rounded-[11px] group-hover:p-6'}>
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
						<div className={'flex items-center justify-center'}>
							<div className={'font-number flex flex-row items-center justify-center pt-4 text-center text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
								{receiver.uniqueGivers}
								<svg
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 512 512'}
									className={'ml-1 h-3 w-3'}><path d={'M244 130.6l-12-13.5-4.2-4.7c-26-29.2-65.3-42.8-103.8-35.8c-53.3 9.7-92 56.1-92 110.3v3.5c0 32.3 13.4 63.1 37.1 85.1L253 446.8c.8 .7 1.9 1.2 3 1.2s2.2-.4 3-1.2L443 275.5c23.6-22 37-52.8 37-85.1v-3.5c0-54.2-38.7-100.6-92-110.3c-38.5-7-77.8 6.6-103.8 35.8l-4.2 4.7-12 13.5c-3 3.4-7.4 5.4-12 5.4s-8.9-2-12-5.4zm34.9-57.1C311 48.4 352.7 37.7 393.7 45.1C462.2 57.6 512 117.3 512 186.9v3.5c0 36-13.1 70.6-36.6 97.5c-3.4 3.8-6.9 7.5-10.7 11l-184 171.3c-.8 .8-1.7 1.5-2.6 2.2c-6.3 4.9-14.1 7.5-22.1 7.5c-9.2 0-18-3.5-24.8-9.7L47.2 299c-3.8-3.5-7.3-7.2-10.7-11C13.1 261 0 226.4 0 190.4v-3.5C0 117.3 49.8 57.6 118.3 45.1c40.9-7.4 82.6 3.2 114.7 28.4c6.7 5.3 13 11.1 18.7 17.6l4.2 4.7 4.2-4.7c4.2-4.7 8.6-9.1 13.3-13.1c1.8-1.5 3.6-3 5.4-4.5z'} fill={'currentcolor'}/>
								</svg>
							</div>
						</div>
						<p className={'mt-2 line-clamp-3 text-center text-sm text-neutral-500 md:mt-4'}>
							{receiver?.description || `${receiver.name} hasn’t written anything yet. must be shy...`}
						</p>
					</div>
				</div>
			</Link>
		);
	}

	return (
		<div>
			<div className={'mx-auto grid w-full max-w-5xl'}>
				<div className={'mx-auto my-6 flex max-w-3xl flex-col justify-center text-center md:mt-20'}>
					<h1 className={'-ml-1 mt-4 text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
						{'Fund the future.'}
					</h1>
					<p className={'mt-4 w-full text-base leading-normal text-neutral-500 md:text-lg md:leading-8'}>
						{'The easiest way to donate to the crypto projects you love.'}
					</p>
					<p className={'w-full text-base leading-normal text-neutral-500 md:text-lg md:leading-8'}>
						{'So that builders can bring their ideas to life.'}
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
					<div className={'mb-44 w-full space-y-4'}>
						<Marquee
							speed={20}
							onCycleComplete={(): void => console.log('he')}>
							{randomOrderedData
								.filter((_, i): boolean => i < 10)
								.map((receiver, i): ReactElement => renderProfileBox(receiver, i))}
						</Marquee>
						<Marquee
							direction={'right'}
							speed={20}
							onCycleComplete={(): void => console.log('he')}>
							{randomOrderedData
								.filter((_, i): boolean => i >= 10 && i < 20)
								.map((receiver, i): ReactElement => renderProfileBox(receiver, i))}

						</Marquee>
						<div className={'hidden sm:flex '}>
							<Marquee
								direction={'left'}
								speed={20}
								onCycleComplete={(): void => console.log('he')}>
								{randomOrderedData
									.filter((_, i): boolean => i >= 20 && i < 30)
									.map((receiver, i): ReactElement => renderProfileBox(receiver, i))}
							</Marquee>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
