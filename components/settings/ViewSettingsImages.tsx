import React, {Fragment, useState} from 'react';
import {AvatarBigger} from 'components/profile/Avatar';
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

import type {FormEvent, ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types/types';
import type {Hex} from 'viem';
import type {Connector} from 'wagmi';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

function ViewSettingsImages(props: TReceiverProps): ReactElement {
	const {toast} = yToast();
	const {address, ens, provider, chainID} = useWeb3();
	const [fields, set_fields] = useState<TReceiverProps>(props);
	const [txStatus, set_txStatus] = useState(defaultTxStatus);

	async function	onSubmit(
		provider: Connector,
		{ens, fields}: {ens: string, fields: TReceiverProps}
	): Promise<TTxResponse> {
		const resolver = await fetchEnsResolver({name: ens});
		const nameNode = namehash(ens);
		const multicalls: Hex[] = [];
		if (props.avatar !== fields.avatar) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'avatar', fields.avatar]}));
		}
		if (props.cover !== fields.cover) {
			multicalls.push(encodeFunctionData({abi: ENS_RESOLVER_ABI, functionName: 'setText', args: [nameNode, 'cover', fields.cover]}));
		}

		return await handleTx({
			connector: provider,
			contractAddress: toAddress(resolver),
			chainID: chainID,
			statusHandler: set_txStatus
		}, {
			address: toAddress(resolver),
			abi: ENS_RESOLVER_ABI,
			functionName: 'multicall',
			args: [multicalls]
		});
	}
	async function	onSubmitForm(e: FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
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
				if (props.avatar !== fields.avatar) {
					changes.avatar = fields.avatar;
				}
				if (props.cover !== fields.cover) {
					changes.cover = fields.cover;
				}
				const message = Object.entries(changes).map(([key, value]): string => `${key}: ${value}`).join(',');
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

	function renderInfoFields(): ReactElement {
		return (
			<fieldset className={'col-span-12 w-full space-y-10 text-xs md:col-span-8 md:text-sm'}>
				<div className={'mt-1 flex w-full flex-row'}>
					<div>
						<AvatarBigger
							address={toAddress(fields.address)}
							src={fields.avatar} />
					</div>
					<div className={'ml-4 flex w-full flex-col'}>
						<input
							type={'url'}
							name={'avatar'}
							id={'avatar'}
							placeholder={'https://my-image-host/link-to-my-avatar.jpg'}
							className={'resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
							value={fields.avatar}
							onChange={(e): void => set_fields({...fields, avatar: e.target.value})} />
						<legend className={'mt-4 flex flex-col text-xs italic text-neutral-400'}>
							<em>{'Paste link to your avatar image'}</em>
							<em>{'Accepted formats includes: png, jpeg, svg, mp4, webmv. IPFS links are also supported, as well as opensea-type tokenURI.'}</em>
						</legend>
					</div>
				</div>

				<div className={'mt-1 flex w-full flex-row'}>
					<div>
						<AvatarBigger
							address={toAddress(fields.address)}
							src={fields.cover} />
					</div>
					<div className={'ml-4 flex w-full flex-col'}>
						<input
							type={'url'}
							name={'cover'}
							id={'cover'}
							placeholder={'https://my-image-host/link-to-my-cover.jpg'}
							className={'resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
							value={fields.cover}
							onChange={(e): void => set_fields({...fields, cover: e.target.value})} />
						<legend className={'mt-4 flex flex-col text-xs italic text-neutral-400'}>
							<em>{'Paste link to your cover image'}</em>
							<em>{'Accepted formats includes: png, jpeg, svg, mp4, webmv. IPFS links are also supported, as well as opensea-type tokenURI.'}</em>
						</legend>
					</div>
				</div>

			</fieldset>
		);
	}

	return (
		<Fragment>
			<div className={'w-full'}>
				<b className={'text-base'}>{'Your images'}</b>
				<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
					{'We know how beautiful you are and how much eager you are to show it to the world. Here you can past your avatar and cover images to shine even more for your next gibs.'}
				</p>
			</div>
			<form
				className={'flex w-full flex-col space-y-4 pt-6'}
				onSubmit={onSubmitForm}>
				{renderInfoFields()}
				<div className={'flex w-full flex-row justify-end space-x-4'}>
					<button
						type={'button'}
						className={'text-sm text-neutral-500 hover:text-neutral-900'}>
						{'Cancel'}
					</button>
					<Button
						isBusy={txStatus.pending}
						isDisabled={!txStatus.none || (fields.avatar === props.avatar && fields.cover === props.cover)}
						className={'!h-9'}
						type={'submit'}>
						{'Save images'}
					</Button>
				</div>
			</form>
		</Fragment>
	);
}

export default ViewSettingsImages;
