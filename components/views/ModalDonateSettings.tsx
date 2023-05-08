import React, {Fragment, useCallback, useState} from 'react';
import Modal from 'components/common/Modal';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, FormEvent, ReactElement, SetStateAction} from 'react';

function ModalDonateSettings({networks = [1], mutate, isOpen, set_isOpen}: {
	networks: number[];
	mutate: VoidFunction,
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
}): ReactElement {
	const {toast} = yToast();
	const chains = useChain();
	const {address, provider} = useWeb3();
	const [isSaving, set_isSaving] = useState(false);
	const [selectedNetworks, set_selectedNetworks] = useState<number[]>(networks);

	const onSubmitForm = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		set_isSaving(true);
		try {
			const signer = await provider.getSigner();
			const signature = await signer.signMessage(selectedNetworks.join(','));
			await axios.put(`${process.env.BASE_API_URI}/networks/${toAddress(address)}`, {
				networks: selectedNetworks,
				address: toAddress(address),
				signature
			});
			toast({type: 'success', content: 'Goal updated!'});
			mutate();
		} catch (e) {
			console.error(e);
			toast({type: 'error', content: (e as any)?.message || (e as any)?.response?.data?.message || 'Something went wrong!'});
		}
		set_isSaving(false);
	}, [address, selectedNetworks, mutate, provider, toast]);

	return (
		<Modal isOpen={isOpen} set_isOpen={set_isOpen}>
			<Fragment>
				<div className={'w-full md:w-5/6'}>
					<b className={'text-base'}>{'Gib for networks'}</b>
					<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
						{'You may want to only enable donation for some networks and this is why you can customize it here! This is specially useful if you are using a smartContract wallet like Argent or Gnosis Safe.'}
					</p>
				</div>
				<form
					onSubmit={onSubmitForm}
					className={'flex w-full flex-col space-y-4 pt-6'}>
					<fieldset className={'grid grid-cols-1 gap-1 md:grid-cols-2'}>
						{
							Object.entries(chains.getAll())
								.filter(([chainId]): boolean => [1, 10, 56, 100, 137, 250, 42161].includes(Number(chainId)))
								.map(([chainId, chain]): ReactElement => (
									<label
										key={chainId}
										aria-label={`chain-${chainId}`}
										className={'flex w-full flex-row items-center space-x-2'}>
										<input
											onChange={(e): void => {
												if (e.target.checked) {
													set_selectedNetworks((prev): number[] => [...prev, Number(chainId)]);
												} else {
													set_selectedNetworks((prev): number[] => prev.filter((id): boolean => id !== Number(chainId)));
												}
											}}
											className={'fill-current rounded-sm border border-neutral-200 p-2 text-[#f472b6] ring-0 focus:border-neutral-400 focus:outline-none focus:ring-0'}
											type={'checkbox'}
											defaultChecked={networks.includes(Number(chainId))}
											readOnly />
										<span>
											<b className={'text-sm font-semibold text-neutral-600'}>{chain.displayName}</b>
										</span>
									</label>
								))}
					</fieldset>

					<div className={'flex w-full flex-row justify-end space-x-4'}>
						<button
							type={'button'}
							className={'text-sm text-neutral-500 hover:text-neutral-900'}>
							{'Cancel'}
						</button>
						<Button
							isBusy={isSaving}
							className={'!h-9'}
							type={'submit'}>
							{'Save settings'}
						</Button>
					</div>
				</form>
			</Fragment>
		</Modal>
	);
}

export default ModalDonateSettings;
