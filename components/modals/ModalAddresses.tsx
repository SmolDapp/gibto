import React, {Fragment} from 'react';
import Modal from 'components/common/Modal';
import {PossibleNetworks} from 'utils/types';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {truncateHex} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TReceiverProps} from 'utils/types';

function ModalAddresses({identity, isOpen, set_isOpen}: {
	identity: TReceiverProps,
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
}): ReactElement {
	return (
		<Modal isOpen={isOpen} set_isOpen={set_isOpen}>
			<Fragment>
				<div className={'w-full md:w-5/6'}>
					<b className={'text-base capitalize'}>{`${identity.name}'s addresses`}</b>
					<p className={'pt-2 text-xs text-neutral-500 md:text-sm'}>
						{`${identity.name} accepts donations on the following networks on theses following addresses. When you donate, the correct address will be selected based on the network you are connected to.`}
					</p>
				</div>
				<div className={'flex w-full flex-col space-y-2 pt-6'}>
					{Object.entries(PossibleNetworks)
						.filter(([, chain]): boolean => (identity.addresses as never)?.[chain?.label] || '')
						.map(([chainID, chain]): ReactElement => (
							<div key={chainID} className={'flex w-full flex-col justify-between'}>
								<div className={'flex w-full flex-row'}>
									<p className={'font-number h-full w-full border-none bg-transparent text-sm focus:ring-0'}>
										<span className={'text-neutral-400'}>{`${chain.label}: `}</span>
										<span className={'hidden md:inline'}>{`${(identity.addresses as never)?.[chain?.label] || ''}`}</span>
										<span className={'inline md:hidden'}>{`${truncateHex((identity.addresses as never)?.[chain?.label] || '', 9)}`}</span>
									</p>
								</div>
							</div>
						))}
				</div>
				<div className={'flex w-full flex-col space-x-0 space-y-2 pt-10 md:flex-row md:space-x-4 md:space-y-0'}>
					<Button
						className={'w-full'}
						variant={'outlined'}>
						{'Acknowledge'}
					</Button>
				</div>
			</Fragment>
		</Modal>
	);
}

export default ModalAddresses;
