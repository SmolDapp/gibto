import React from 'react';

import DonationSection from './DonationSection';
import HeroSection from './HeroSection';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	IamReceiver(props: TReceiverProps): ReactElement {
	return (
		<>
			<HeroSection {...props} />
			<div className={'mx-auto mb-20 grid w-full max-w-5xl'}>
				<div className={'mb-10'}>
					<h2 className={'text-xl text-neutral-500'}>
						{'About'}
					</h2>
					<div className={'mt-4 space-y-2 text-sm text-neutral-400'}>
						{'No description provided.'}

					</div>
				</div>
				<div className={'mb-72'}>
					<h2 id={'donate'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
						{'Donate'}
					</h2>
					<DonationSection />
				</div>
			</div>
		</>
	);
}

export default IamReceiver;
