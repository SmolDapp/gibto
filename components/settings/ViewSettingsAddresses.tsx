import React, {Fragment, useCallback, useState} from 'react';
import {useWeb3} from 'contexts/useWeb3';
import {PossibleNetworks} from 'utils/types';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {FormEvent, ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function ViewSettingsAddresses(props: TReceiverProps): ReactElement {
	const {toast} = yToast();
	const {address, provider} = useWeb3();
	const [fields, set_fields] = useState<TReceiverProps>(props);
	const [isSaving, set_isSaving] = useState(false);

	const onSubmitForm = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		set_isSaving(true);
		try {
			const signer = await provider.getSigner();
			const message = Object.entries(PossibleNetworks)
				.filter(([, value]): boolean => value.label in fields.addresses)
				.filter(([, value]): boolean => (fields.addresses as never)[value.label] !== '')
				.map(([, value]): string => `${value.label}: ${(fields.addresses as never)[value.label]}`).join(',');
			const signature = await signer.signMessage(message);
			await axios.put(`${process.env.BASE_API_URI}/addresses/${toAddress(address)}`, {
				addresses: fields.addresses,
				address: toAddress(address),
				signature
			});
			toast({type: 'success', content: 'Addresses updated!'});
			props.mutate();
		} catch (e) {
			console.error(e);
			toast({type: 'error', content: (e as any)?.message || (e as any)?.response?.data?.message || 'Something went wrong!'});
		}
		set_isSaving(false);
	}, [address, fields.addresses, props, provider, toast]);

	return (
		<Fragment>
			<div className={'w-full'}>
				<b className={'text-base'}>{'Your addresses'}</b>
				<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
					{'Gib lets you receive funds on different networks. So link your addresses for super cool multi chain crypto donations. Nice.'}
				</p>
			</div>
			<form
				onSubmit={onSubmitForm}
				className={'flex w-full flex-col space-y-4 pt-6'}>
				<fieldset className={'col-span-2 flex w-full flex-col space-y-4'}>
					{
						Object.entries(PossibleNetworks)
							.map(([chainID, chain]): ReactElement => (
								<label
									key={chainID}
									aria-label={chain.name}
									className={'flex w-full flex-row'}>
									<div className={'flex w-full flex-col justify-between'}>
										<div className={'flex w-full flex-row space-x-4'}>
											<div className={'w-full'}>
												<span className={'flex flex-row items-center justify-between'}>
													<b className={'text-xxs font-semibold text-neutral-600'}>{chain.name}</b>
												</span>

												<div className={'flex flex-row rounded-md border border-neutral-200 focus:border-neutral-400 focus:outline-none'}>
													<p className={'w-14 bg-neutral-100 p-2 text-xs leading-5 text-neutral-400'}>{`${chain.label}:`}</p>
													<input
														type={'text'}
														name={`${chain.name}:address`}
														id={`${chain.name}:address`}
														className={'font-number h-full w-full border-none bg-transparent p-2 text-sm focus:ring-0'}
														placeholder={'0x...'}
														value={(fields.addresses as never)?.[chain?.label] || ''}
														onChange={(e): void => set_fields({
															...fields,
															addresses: {
																...fields.addresses,
																[chain.label]: e.target.value
															}
														})} />
												</div>
											</div>
										</div>
									</div>
								</label>
							))}
				</fieldset>

				<div className={'flex w-full flex-row justify-end space-x-4 pt-6'}>
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
	);
}

export default ViewSettingsAddresses;
