import React, {Fragment, useState} from 'react';
import Modal from 'components/common/Modal';
import {Button} from '@yearn-finance/web-lib/components/Button';

import type {Dispatch, ReactElement, SetStateAction} from 'react';

function ModalMessage({isOpen, set_isOpen, message, onConfirm, onCancel}: {
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
	message: string,
	onConfirm: (message: string) => void,
	onCancel: () => void,
}): ReactElement {
	const [value, set_value] = useState<string>(message);
	return (
		<Modal isOpen={isOpen} set_isOpen={set_isOpen}>
			<Fragment>
				<div className={'w-full md:w-5/6'}>
					<b className={'text-base'}>{'Add a message?'}</b>
					<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
						{'Your donation says more than words ever could, but you can also add some words because they’re nice too. This message won’t be stored on chain and will be visible to everyone.'}
					</p>
				</div>
				<div className={'flex w-full flex-col space-y-4 pt-6'}>
					<textarea
						className={'h-24 resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none md:h-32'}
						placeholder={'Your message'}
						value={value}
						onChange={(e): void => set_value(e.target.value)} />
					<div className={'flex w-full flex-row justify-end space-x-4'}>
						<button
							className={'text-sm text-neutral-500 hover:text-neutral-900'}
							onClick={(): void => onCancel()}>
							{'Cancel'}
						</button>
						<Button
							isDisabled={value.length === 0}
							onClick={(): void => onConfirm(value)}>
							{'Attach message'}
						</Button>
					</div>
				</div>
			</Fragment>
		</Modal>
	);
}

export default ModalMessage;
