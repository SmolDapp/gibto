import React, {Fragment, useState} from 'react';
import Avatar from 'components/profile/Avatar';
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

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

function ViewSettingsProfile(props: TReceiverProps): ReactElement {
	const	{address, provider, ens} = useWeb3();
	const	{toast} = yToast();
	const	[fields, set_fields] = useState<TReceiverProps>(props);
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);

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
		if (props.description !== fields.description) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'description', fields.description]));
		}
		if (props.about !== fields.about) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'about', fields.about]));
		}
		const contract = new ethers.Contract(toAddress(resolver?.address), ENS_RESOLVER_ABI, signer);
		return await handleTx(contract.multicall(multicalls));
	}
	async function	onSubmitRecords(): Promise<void> {
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
				if (props.description !== fields.description) {
					changes.description = fields.description.replace(/(^\s+|\s+$)/g, '');
				}
				if (props.about !== fields.about) {
					changes.about = fields.about;
				}
				const signer = await provider.getSigner();
				const signature = await signer.signMessage(Object.entries(changes).map(([key, value]): string => `${key}: ${value}`).join('\n'));
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
			<fieldset className={'col-span-12 w-full space-y-4 text-xs md:col-span-8 md:text-sm'}>
				<label aria-label={'avatar'} className={'flex w-full flex-row'}>
					<div className={'mt-3'}>
						<Avatar
							address={toAddress(fields.address)}
							src={fields.avatar} />
					</div>
					<div className={'ml-4 flex w-full flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Avatar'}</b>
							<div className={'tooltip'}>
								<i className={'text-xxs text-neutral-400'}>{'Paste link to your avatar image'}</i>
								<span className={'tooltiptext z-[100000] text-xs'}>
									<p suppressHydrationWarning>{'Accepted formats includes: png, jpeg, svg, mp4, webmv. IPFS links are also supported, as well as opensea-type tokenURI.'}</p>
								</span>
							</div>
						</span>
						<input
							type={'url'}
							name={'avatar'}
							id={'avatar'}
							placeholder={'https://my-image-host/link-to-my-avatar.jpg'}
							className={'resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
							value={fields.avatar}
							onChange={(e): void => set_fields({...fields, avatar: e.target.value})} />
					</div>
				</label>

				<label aria-label={'cover'} className={'flex w-full flex-row'}>
					<div className={'mt-3'}>
						<Avatar
							address={toAddress(fields.address)}
							src={fields.cover || '/hero.jpg'} />
					</div>
					<div className={'ml-4 flex w-full flex-col justify-between'}>
						<span className={'flex flex-row items-center justify-between'}>
							<b className={'text-xxs font-semibold text-neutral-600'}>{'Cover'}</b>
							<div className={'tooltip'}>
								<i className={'text-xxs text-neutral-400'}>{'Paste link to your cover image'}</i>
								<span className={'tooltiptext z-[100000] text-xs'}>
									<p suppressHydrationWarning>{'Accepted formats includes: png, jpeg, svg, mp4, webmv. IPFS links are also supported, as well as opensea-type tokenURI.'}</p>
								</span>
							</div>
						</span>
						<input
							type={'url'}
							name={'cover'}
							id={'cover'}
							placeholder={'https://my-image-host/link-to-my-cover-image.png'}
							className={'resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
							value={fields.cover}
							onChange={(e): void => set_fields({...fields, cover: e.target.value})} />
					</div>
				</label>

				<label
					aria-label={'description'}
					className={'flex flex-col justify-between'}>
					<span>
						<b className={'text-xxs font-semibold text-neutral-600'}>{'Description'}</b>
					</span>
					<textarea
						name={'description'}
						id={'description'}
						placeholder={'smoldapp'}
						className={'h-16 resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none md:h-20'}
						value={fields.description}
						onChange={(e): void => set_fields({...fields, description: e.target.value})} />
				</label>

				<label
					aria-label={'about'}
					className={'flex flex-col justify-between'}>
					<span>
						<b className={'text-xxs font-semibold text-neutral-600'}>{'About'}</b>
					</span>
					<textarea
						name={'about'}
						id={'about'}
						placeholder={'smoldapp'}
						className={'h-24 resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none md:h-36'}
						value={fields.about}
						onChange={(e): void => set_fields({...fields, about: e.target.value})} />
				</label>
			</fieldset>
		);
	}

	return (
		<Fragment>
			<div className={'w-full'}>
				<b className={'text-base'}>{'Your profile'}</b>
				<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
					{'Let the world know who you are and what you’re building. If you don’t like to blow your own trumpet, that’s ok. Just take a deep breath and summon the confidence of a flat-earther using first grade maths to explain why there’s no horizon.'}
				</p>
			</div>
			<form
				className={'pt-6'}
				onSubmit={async (e): Promise<void> => {
					e.preventDefault();
					await onSubmitRecords();
				}}>
				{renderInfoFields()}
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

export default ViewSettingsProfile;
