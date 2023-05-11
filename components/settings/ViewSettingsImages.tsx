import React, {Fragment, useState} from 'react';
import {AvatarBigger} from 'components/profile/Avatar';
import {ethers} from 'ethers';
import {namehash} from 'ethers/lib/utils';
import ENS_RESOLVER_ABI from 'utils/abi/ENSResolver.abi';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';
import {defaultTxStatus, handleTx, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {FormEvent, ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

function ViewSettingsImages(props: TReceiverProps): ReactElement {
	const {toast} = yToast();
	const {address, ens, provider} = useWeb3();
	const [fields, set_fields] = useState<TReceiverProps>(props);
	const [txStatus, set_txStatus] = useState(defaultTxStatus);

	async function	onSubmit(
		provider: ethers.providers.JsonRpcProvider | ethers.providers.JsonRpcProvider,
		{ens, fields}: {ens: string, fields: TReceiverProps}
	): Promise<TTxResponse> {
		const signer = await provider.getSigner();
		const resolver = await getProvider(1).getResolver(ens);
		const resolverIFace = new ethers.utils.Interface(ENS_RESOLVER_ABI);
		const nameNode = namehash(ens);
		const multicalls = [];
		if (props.avatar !== fields.avatar) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'avatar', fields.avatar]));
		}
		if (props.cover !== fields.cover) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'cover', fields.cover]));
		}
		const contract = new ethers.Contract(toAddress(resolver?.address), ENS_RESOLVER_ABI, signer);
		return await handleTx(contract.multicall(multicalls));
	}
	async function	onSubmitForm(e: FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
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
				const signer = await provider.getSigner();
				const signature = await signer.signMessage(Object.entries(changes).map(([key, value]): string => `${key}: ${value}`).join(','));
				const {data: profile} = await axios.put(`${process.env.BASE_API_URI}/profile/${toAddress(address)}`, {
					...changes,
					type: 'profile',
					address: toAddress(address),
					signature
				});
				console.log(profile);
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
