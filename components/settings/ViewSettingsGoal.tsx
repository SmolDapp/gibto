import React, {Fragment, useCallback, useEffect, useState} from 'react';
import {GoalPreviewMin} from 'components/profile/GoalBox';
import {useWeb3} from 'contexts/useWeb3';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {FormEvent, ReactElement} from 'react';
import type {Maybe, TGoal} from 'utils/types';

function ViewSettingsGoal(props: Maybe<TGoal> & {mutate: VoidFunction}): ReactElement {
	const {toast} = yToast();
	const {address, provider} = useWeb3();
	const [startDate, set_startDate] = useState(
		(props.startDate ? new Date(props.startDate * 1000) : new Date(Date.now())).toISOString().split('T')[0]
	);
	const [endDate, set_endDate] = useState(
		(props.endDate ? new Date(props.endDate * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
	);
	const [goalValue, set_goalValue] = useState(props.value || 0);
	const [isSaving, set_isSaving] = useState(false);

	useEffect((): void => {
		performBatchedUpdates((): void => {
			set_startDate((props.startDate ? new Date(props.startDate * 1000) : new Date(Date.now())).toISOString().split('T')[0]);
			set_endDate((props.endDate ? new Date(props.endDate * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]);
			set_goalValue(props.value || 0);
		});
	}, [props]);

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
			props?.mutate();
		} catch (e) {
			console.error(e);
			toast({type: 'error', content: (e as any)?.message || (e as any)?.response?.data?.message || 'Something went wrong!'});
		}
		set_isSaving(false);
	}, [address, endDate, goalValue, props, provider, startDate, toast]);

	return (
		<Fragment>
			<div className={'w-full'}>
				<b className={'text-base'}>{'What’s your goal?'}</b>
				<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
					{'Let people know how much you’re looking to raise for your project and by what dates. You can always change this later.'}
				</p>
			</div>
			<form
				onSubmit={onSubmitForm}
				className={'grid grid-cols-1 gap-6 pt-6 md:grid-cols-2'}>
				<div className={'box-50 relative col-span-2 mx-auto flex w-full items-center justify-center py-10 md:col-span-1'}>
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
	);
}

export default ViewSettingsGoal;
