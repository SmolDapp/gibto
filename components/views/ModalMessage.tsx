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
					<b className={'text-base'}>{'Wanna attach a message?'}</b>
					<p className={'pt-2 text-sm text-neutral-500'}>
						{'You can attach a kind message to your donation. This message will not be stored onChain and will be visible by everyone!'}
					</p>
				</div>
				<div className={'flex w-full flex-col space-y-4 pt-6'}>
					<textarea
						className={'h-32 resize-none rounded-md border border-neutral-200 p-2 focus:border-neutral-400 focus:outline-none'}
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
