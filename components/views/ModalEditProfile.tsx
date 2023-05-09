import React, {Fragment, useState} from 'react';
import Avatar from 'components/Avatar';
import Modal from 'components/common/Modal';
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

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TReceiverProps} from 'utils/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

function ModalEditProfile({identity, isOpen, set_isOpen}: {
	identity: TReceiverProps,
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
}): ReactElement {
	const	{address, provider, ens} = useWeb3();
	const	{toast} = yToast();
	const	[fields, set_fields] = useState<TReceiverProps>(identity);
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
		if (identity.avatar !== fields.avatar) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'avatar', fields.avatar]));
		}
		if (identity.cover !== fields.cover) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'cover', fields.cover]));
		}
		if (identity.description !== fields.description) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'description', fields.description]));
		}
		if (identity.discord !== fields.discord) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'com.discord', fields.discord]));
		}
		if (identity.github !== fields.github) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'com.github', fields.github]));
		}
		if (identity.reddit !== fields.reddit) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'com.reddit', fields.reddit]));
		}
		if (identity.telegram !== fields.telegram) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'org.telegram', fields.telegram]));
		}
		if (identity.twitter !== fields.twitter) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'com.twitter', fields.twitter]));
		}
		if (identity.website !== fields.website) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'url', fields.website]));
		}
		if (identity.email !== fields.email) {
			multicalls.push(resolverIFace.encodeFunctionData('setText', [nameNode, 'email', fields.email]));
		}

		const contract = new ethers.Contract(toAddress(resolver?.address), ENS_RESOLVER_ABI, signer);
		return await handleTx(contract.multicall(multicalls));
	}
	async function	onSubmitRecords(): Promise<void> {
		if (identity.identitySource === 'on-chain') {
			if (!ens) {
				return;
			}
			new Transaction(provider, onSubmit, set_txStatus)
				.populate({ens, fields})
				.onSuccess(async (): Promise<void> => {
					identity.mutate();
					set_isOpen(false);
				}).perform();
		} else {
			try {
				set_txStatus({...defaultTxStatus, pending: true});

				const changes: Partial<TReceiverProps> = {};
				if (identity.avatar !== fields.avatar) {
					changes.avatar = fields.avatar;
				}
				if (identity.cover !== fields.cover) {
					changes.cover = fields.cover;
				}
				if (identity.description !== fields.description) {
					changes.description = fields.description.replace(/(^\s+|\s+$)/g, '');
				}
				if (identity.discord !== fields.discord) {
					changes.discord = fields.discord;
				}
				if (identity.github !== fields.github) {
					changes.github = fields.github;
				}
				if (identity.reddit !== fields.reddit) {
					changes.reddit = fields.reddit;
				}
				if (identity.telegram !== fields.telegram) {
					changes.telegram = fields.telegram;
				}
				if (identity.twitter !== fields.twitter) {
					changes.twitter = fields.twitter;
				}
				if (identity.website !== fields.website) {
					changes.website = fields.website;
				}
				if (identity.email !== fields.email) {
					changes.email = fields.email;
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
				identity.mutate();
				set_isOpen(false);
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
			<fieldset className={'col-span-12 flex w-full flex-col space-y-2 text-xs md:col-span-4 md:text-sm'}>
				<span>
					<b className={'text-xxs font-semibold text-neutral-600'}>{'Social'}</b>
				</span>
				<label
					aria-label={'twitter'}
					className={'flex flex-col justify-between'}>
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
					<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
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
				<div className={'sticky inset-x-0 bottom-0 w-full pt-2 md:relative'}>
					<Button
						className={'w-full'}
						isDisabled={!txStatus.none}
						isBusy={txStatus.pending}>
						{'Submit'}
					</Button>
				</div>
			</fieldset>
		);
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
						className={'h-24 resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none md:h-36'}
						value={fields.description}
						onChange={(e): void => set_fields({...fields, description: e.target.value})} />
				</label>
			</fieldset>
		);
	}

	function renderForm(): ReactElement {
		return (
			<form
				onSubmit={async (e): Promise<void> => {
					e.preventDefault();
					await onSubmitRecords();
				}}
				className={'relative mt-6 grid grid-cols-12 gap-x-0 gap-y-4 md:gap-x-10'}>
				{renderInfoFields()}
				{renderSocialFields()}
			</form>
		);
	}

	return (
		<Modal
			className={'max-h-[80vh] max-w-sm overflow-x-hidden overflow-y-scroll md:max-h-[unset] md:max-w-5xl md:!p-0'}
			isOpen={isOpen}
			set_isOpen={(): void => set_isOpen(false)}>
			<Fragment>
				<div className={'w-full md:w-3/4'}>
					<b className={'text-base'}>{'Update your profile'}</b>
					<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
						{'You are in control of your profile. You can update your name, avatar, and social media links. All of theses changes will be stored on-chain as ENS records. Unleash your digital identity!'}
					</p>
				</div>
				{renderForm()}
			</Fragment>
		</Modal>
	);
}

export default ModalEditProfile;
