import React, {Fragment, useState} from 'react';
import Modal from 'components/common/Modal';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TReceiverProps} from 'utils/types';

function ModalIdentitySource({identity, isOpen, set_isOpen}: {
	identity: TReceiverProps,
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
}): ReactElement {
	const	{address, provider} = useWeb3();
	const	{toast} = yToast();
	const	[isSaving, set_isSaving] = useState(false);

	async function	onChangeIdentitySource(source: 'on-chain' | 'off-chain'): Promise<void> {
		try {
			set_isSaving(true);
			const signer = await provider.getSigner();
			const signature = await signer.signMessage(source);
			await axios.put(`${process.env.BASE_API_URI}/profile/${toAddress(address)}`, {
				identitySource: source,
				type: 'identitySource',
				address: toAddress(address),
				signature
			});
			toast({type: 'success', content: 'Identity source updated!'});
			identity.mutate();
			set_isOpen(false);
		} catch (e) {
			console.error(e);
			toast({type: 'error', content: (e as any)?.message || (e as any)?.response?.data?.message || 'Something went wrong!'});
		}
		set_isSaving(false);
	}

	return (
		<Modal isOpen={isOpen} set_isOpen={set_isOpen}>
			<Fragment>
				<div className={'w-full md:w-5/6'}>
					<b className={'text-base'}>{'Choose your Identity Source'}</b>
					<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
						{'By default if you have an ENS name, your identity will be onChain and when updating your profile, the changes will be stored on-chain as ENS records. However, you may want to change to an offChain source to avoid paying gas fees.'}
					</p>
				</div>
				<div className={'flex w-full flex-col space-x-0 space-y-2 pt-10 md:flex-row md:space-x-4 md:space-y-0'}>
					<Button
						isBusy={isSaving}
						onClick={async (): Promise<void> => onChangeIdentitySource('off-chain')}
						className={'w-full'}
						variant={'outlined'}>
						{`${identity.identitySource === 'off-chain' ? 'Keep' : 'Use'} Off-Chain`}
					</Button>
					<Button
						isBusy={isSaving}
						onClick={async (): Promise<void> => onChangeIdentitySource('on-chain')}
						className={'w-full'}>
						{`${identity.identitySource === 'on-chain' ? 'Keep' : 'Use'} On-Chain`}
					</Button>
				</div>
			</Fragment>
		</Modal>
	);
}

export default ModalIdentitySource;
