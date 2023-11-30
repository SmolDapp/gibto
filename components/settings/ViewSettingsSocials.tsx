import React, {Fragment, useState} from 'react';
import ENS_RESOLVER_ABI from 'utils/abi/ENSResolver.abi';
import {encodeFunctionData} from 'viem';
import {namehash} from 'viem/ens';
import axios from 'axios';
import {fetchEnsResolver} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {handleTx} from '@yearn-finance/web-lib/utils/wagmi/provider';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types/types';
import type {Hex} from 'viem';
import type {Connector} from 'wagmi';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

function ViewSettingsSocials(props: TReceiverProps): ReactElement {
	const	{address, provider, ens, chainID} = useWeb3();
	const	{toast} = yToast();
	const	[fields, set_fields] = useState<TReceiverProps>(props);
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);

	async function	onSubmit(
		provider: Connector,
		{ens, fields}: {ens: string, fields: TReceiverProps}
	): Promise<TTxResponse> {
		const resolver = await fetchEnsResolver({name: ens});
		const nameNode = namehash(ens);
		const multicalls: Hex[] = [];
		if (props.discord !== fields.discord) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'com.discord', fields.discord]}));
		}
		if (props.github !== fields.github) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'com.github', fields.github]}));
		}
		if (props.reddit !== fields.reddit) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'com.reddit', fields.reddit]}));
		}
		if (props.telegram !== fields.telegram) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'org.telegram', fields.telegram]}));
		}
		if (props.twitter !== fields.twitter) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'com.twitter', fields.twitter]}));
		}
		if (props.website !== fields.website) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'url', fields.website]}));
		}
		if (props.email !== fields.email) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'email', fields.email]}));
		}

		return await handleTx({
			connector: provider,
			contractAddress: toAddress(resolver),
			statusHandler: set_txStatus,
			chainID: chainID
		}, {
			address: toAddress(resolver),
			abi: ENS_RESOLVER_ABI,
			functionName: 'multicall',
			args: [multicalls]
		});
	}

	async function	onSubmitRecords(): Promise<void> {
		if (!provider) {
			return;
		}
		if (props.identitySource === 'on-chain') {
			if (!ens) {
				return;
			}
			new Transaction(provider, onSubmit, set_txStatus)
				.populate({ens, fields})
				.onSuccess(async (): Promise<void> => {
					props.mutate();
				}).perform();
		} else {
			try {
				set_txStatus({...defaultTxStatus, pending: true});

				const changes: Partial<TReceiverProps> = {};
				if (props.discord !== fields.discord) {
					changes.discord = fields.discord || ' ';
				}
				if (props.github !== fields.github) {
					changes.github = fields.github || ' ';
				}
				if (props.reddit !== fields.reddit) {
					changes.reddit = fields.reddit || ' ';
				}
				if (props.telegram !== fields.telegram) {
					changes.telegram = fields.telegram || ' ';
				}
				if (props.twitter !== fields.twitter) {
					changes.twitter = fields.twitter || ' ';
				}
				if (props.website !== fields.website) {
					changes.website = fields.website || ' ';
				}
				if (props.email !== fields.email) {
					changes.email = fields.email || ' ';
				}
				const message = Object.entries(changes).map(([key, value]): string => `${key}: ${value || ' '}`).join(',');
				const signer = await provider.getWalletClient();
				const signature = await signer.signMessage({message});
				await axios.put(`${process.env.BASE_API_URI}/profile/${toAddress(address)}`, {
					...changes,
					type: 'profile',
					address: toAddress(address),
					signature
				});
				toast({type: 'success', content: 'Profile updated!'});
				props.mutate();
				setTimeout((): void => set_txStatus(defaultTxStatus), 3000);
			} catch (e) {
				console.error(e);
				set_txStatus({...defaultTxStatus, error: true});
				setTimeout((): void => set_txStatus(defaultTxStatus), 3000);
				toast({type: 'error', content: (e as any)?.message || (e as any)?.response?.data?.message || 'Something went wrong!'});
			}
		}
	}

	function renderSocialFields(): ReactElement {
		return (
			<div>
				<fieldset className={'col-span-12 grid w-full grid-cols-1 gap-4 text-xs md:col-span-4 md:text-sm'}>
					<label
						aria-label={'twitter'}
						className={'flex flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Twitter'}</b>
						</span>
						<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
							<p className={'w-40 bg-neutral-100 p-2 text-neutral-400'}>{'twitter.com/'}</p>
							<input
								type={'text'}
								name={'twitter'}
								id={'twitter'}
								className={'h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
								value={fields.twitter}
								onChange={(e): void => set_fields({...fields, twitter: e.target.value})} />
						</div>
					</label>

					<label
						aria-label={'github'}
						className={'flex flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Github'}</b>
						</span>
						<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
							<p className={'w-40 bg-neutral-100 p-2 text-neutral-400'}>{'github.com/'}</p>
							<input
								type={'text'}
								name={'github'}
								id={'github'}
								className={'h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
								value={fields.github}
								onChange={(e): void => set_fields({...fields, github: e.target.value})} />
						</div>
					</label>

					<label
						aria-label={'reddit'}
						className={'flex flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Reddit'}</b>
						</span>
						<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
							<p className={'w-40 bg-neutral-100 p-2 text-neutral-400'}>{'reddit.com/u/'}</p>
							<input
								type={'text'}
								name={'reddit'}
								id={'reddit'}
								className={'h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
								value={fields.reddit}
								onChange={(e): void => set_fields({...fields, reddit: e.target.value})} />
						</div>
					</label>

					<label
						aria-label={'discord'}
						className={'flex flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Discord'}</b>
						</span>
						<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
							<p className={'w-40 bg-neutral-100 p-2 text-neutral-400'}>{'discord.gg/'}</p>
							<input
								type={'text'}
								name={'discord'}
								id={'discord'}
								className={'h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
								value={fields.discord}
								onChange={(e): void => set_fields({...fields, discord: e.target.value})} />
						</div>
					</label>

					<label
						aria-label={'telegram'}
						className={'flex flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Telegram'}</b>
						</span>
						<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
							<p className={'w-40 bg-neutral-100 p-2 text-neutral-400'}>{'telegram.me/'}</p>
							<input
								type={'text'}
								name={'telegram'}
								id={'telegram'}
								className={'h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
								value={fields.telegram}
								onChange={(e): void => set_fields({...fields, telegram: e.target.value})} />
						</div>
					</label>

					<label
						aria-label={'website'}
						className={'flex flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Website'}</b>
						</span>
						<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
							<p className={'w-40 bg-neutral-100 p-2 text-neutral-400'}>{'https://'}</p>
							<input
								type={'text'}
								name={'website'}
								id={'website'}
								placeholder={'https://personal-website.com'}
								className={'h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
								value={fields.website}
								onChange={(e): void => set_fields({...fields, website: e.target.value})} />
						</div>
					</label>
				</fieldset>
			</div>
		);
	}


	return (
		<Fragment>
			<div className={'w-full'}>
				<b className={'text-base'}>{'Your socials'}</b>
				<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
					{'Sharing is caring. Let people know where else they can find you. We’re adding Bebo and Friendster in our next update, stay tuned.'}
				</p>
			</div>
			<form
				className={'pt-6'}
				onSubmit={async (e): Promise<void> => {
					e.preventDefault();
					await onSubmitRecords();
				}}>
				{renderSocialFields()}
				<div className={'flex w-full flex-row justify-end space-x-4 pt-10'}>
					<button
						type={'button'}
						className={'text-sm text-neutral-500 hover:text-neutral-900'}>
						{'Cancel'}
					</button>
					<Button
						isBusy={txStatus.pending}
						className={'!h-9'}
						type={'submit'}>
						{'Save settings'}
					</Button>
				</div>
			</form>
		</Fragment>
	);
}

export default ViewSettingsSocials;
