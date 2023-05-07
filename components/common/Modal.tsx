import React, {Fragment} from 'react';
import IconCircleCross from 'components/icons/IconCircleCross';
import {Dialog, Transition} from '@headlessui/react';

import type {Dispatch, ReactElement, SetStateAction} from 'react';

function Modal({isOpen, set_isOpen, className = '', children}: {
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
	className?: string,
	children: ReactElement,
}): ReactElement {
	return (
		<Transition
			appear
			show={isOpen}
			as={Fragment}>
			<Dialog
				as={'div'}
				onClose={(): void => set_isOpen(false)}
				className={'relative z-50 flex'}>
				<Transition.Child
					as={Fragment}
					enter={'ease-out duration-300'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-100'}
					leave={'ease-in duration-200'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<div className={'fixed inset-0 bg-neutral-900/30'} />
				</Transition.Child>
				<div className={'fixed inset-0 overflow-y-auto'}>
					<div className={'mx-auto flex min-h-full w-full justify-center pt-32'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 scale-95'}
							enterTo={'opacity-100 scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 scale-100'}
							leaveTo={'opacity-0 scale-95'}>
							<Dialog.Panel className={'mx-auto w-full items-center'}>
								<div className={`box-0 relative mx-auto grid w-full max-w-3xl grid-cols-12 ${className}`}>
									<button
										onClick={(): void => set_isOpen(false)}
										className={'absolute right-4 top-4'}>
										<IconCircleCross className={'h-4 w-4 text-neutral-400 transition-colors hover:text-neutral-900'} />
									</button>
									<div className={'col-span-12 flex flex-col p-4 text-neutral-900 md:p-6 md:pb-4'}>
										{children}
									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

export default Modal;
