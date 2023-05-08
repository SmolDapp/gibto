import React, {Fragment, useCallback, useState} from 'react';
import Modal from 'components/common/Modal';
import {GoalPreviewMin} from 'components/GoalBox';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, FormEvent, ReactElement, SetStateAction} from 'react';

function ModalGoal({mutate, isOpen, set_isOpen}: {
	mutate: VoidFunction,
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
}): ReactElement {
	const {toast} = yToast();
	const {address, provider} = useWeb3();
	const [startDate, set_startDate] = useState(new Date(Date.now()).toISOString().split('T')[0]);
	const [endDate, set_endDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
	const [goalValue, set_goalValue] = useState(0);
	const [isSaving, set_isSaving] = useState(false);

	console.log({startDate, endDate, goalValue});
	const onSubmitForm = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		set_isSaving(true);
		try {
			const signer = await provider.getSigner();
			const signature = await signer.signMessage(JSON.stringify({
				startDate: new Date(startDate).valueOf() / 1000,
				endDate: new Date(endDate).valueOf() / 1000,
				goalValue
			}));
			await axios.post(`${process.env.BASE_API_URI}/goal/${toAddress(address)}`, {
				goal: {
					startDate: new Date(startDate).valueOf() / 1000,
					endDate: new Date(endDate).valueOf() / 1000,
					goalValue: goalValue
				},
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
	}, [address, endDate, goalValue, mutate, provider, startDate, toast]);

	return (
		<Modal isOpen={isOpen} set_isOpen={set_isOpen}>
			<Fragment>
				<div className={'w-full md:w-5/6'}>
					<b className={'text-base'}>{'What is you goal'}</b>
					<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
						{'Indicate how much you would like to raise and for how long. You can always change this later.'}
					</p>
				</div>
				<form
					onSubmit={onSubmitForm}
					className={'grid grid-cols-1 gap-6 pt-6 md:grid-cols-2'}>
					<div className={'box-100 relative mx-auto flex w-full items-center justify-center py-10'}>
						<i className={'absolute left-4 top-2 text-xxs text-neutral-400'}>
							{'Preview'}
						</i>
						<GoalPreviewMin
							received={goalValue / 2}
							value={goalValue} />
					</div>
					<div>
						<div
							className={'flex w-full flex-col space-y-4'}>
							<div className={'flex w-full flex-col space-y-2'}>
								<label aria-label={'date-start'} className={'flex w-full flex-col justify-between'}>
									<span>
										<b className={'text-xxs font-semibold text-neutral-600'}>{'From'}</b>
									</span>
									<input
										className={'w-full rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
										placeholder={'Start date'}
										type={'date'}
										value={startDate}
										onChange={(e): void => set_startDate(e.target.value as never)} />
								</label>
								<label aria-label={'date-end'} className={'flex w-full flex-col justify-between'}>
									<span>
										<b className={'text-xxs font-semibold text-neutral-600'}>{'To'}</b>
									</span>
									<input
										className={'w-full rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
										placeholder={'End date'}
										type={'date'}
										value={endDate}
										onChange={(e): void => set_endDate(e.target.value as never)} />
								</label>
								<label aria-label={'goal'} className={'flex w-full flex-col justify-between'}>
									<span>
										<b className={'text-xxs font-semibold text-neutral-600'}>{'Goal (in $)'}</b>
									</span>
									<input
										className={'w-full rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
										step={1}
										min={0}
										value={goalValue}
										type={'number'}
										onChange={(e): void => set_goalValue(e.target.valueAsNumber)} />
								</label>
							</div>
						</div>
					</div>
					<div className={'col-span-2 flex w-full flex-row justify-end space-x-4'}>
						<button
							type={'button'}
							className={'text-sm text-neutral-500 hover:text-neutral-900'}>
							{'Cancel'}
						</button>
						<Button
							isBusy={isSaving}
							className={'!h-9'}
							type={'submit'}>
							{'Set goal'}
						</Button>
					</div>
				</form>
			</Fragment>
		</Modal>
	);
}

export default ModalGoal;
