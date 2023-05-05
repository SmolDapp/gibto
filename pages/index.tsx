import React, {useCallback, useState} from 'react';
import {useRouter} from 'next/router';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {isAddress} from 'ethers/lib/utils';
import {checkENSValidity, checkLensValidity} from 'utils';
import lensProtocol from 'utils/lens.tools';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useUI} from '@yearn-finance/web-lib/contexts/useUI';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';

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
			<label
				htmlFor={'search'}
				className={'text-base text-neutral-400'}>
				{'Find a creator, a project, or a community'}
			</label>
			<div className={'relative mt-2'}>
				<input
					id={'search'}
					className={'h-16 w-full rounded-lg border border-neutral-300 px-3 pr-10 text-base text-neutral-900 transition-colors placeholder:text-neutral-500 focus:border-neutral-300 focus:outline-none focus:ring-0 focus:ring-transparent'}
					aria-invalid={!isValidValue}
					onFocus={async (): Promise<void> => checkDestinationValidity()}
					onBlur={async (): Promise<void> => checkDestinationValidity()}
					type={'text'}
					spellCheck={false}
					autoComplete={'off'}
					required
					placeholder={'Search by ens, lens handle or address'}
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
	return (
		<div className={'mx-auto grid w-full max-w-5xl'}>
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
					{'Sponsorship, unrestricted'}
				</h1>
				<p className={'mt-4 w-full text-base leading-normal text-neutral-500 md:w-3/4 md:text-lg md:leading-8'}>
					{'Designed to provide unrestricted funding, resources, and guidance to help you bring your ideas to life.'}
				</p>
			</div>

			<div>
				<div className={'box-100 relative p-6 pb-10'}>
					<SearchFor />
				</div>
			</div>
		</div>
	);
}

export default Home;
