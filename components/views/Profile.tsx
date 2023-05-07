import React from 'react';

import AboutSection from './AboutSection';
import DonationSection from './DonationSection';
import HeroSection from './HeroSection';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	Profile(props: TReceiverProps): ReactElement {
	return (
		<>
			<HeroSection {...props} />
			<div className={'mx-auto mb-20 grid w-full max-w-5xl'}>
				<AboutSection {...props} />
				<div className={'mb-72'}>
					<h2 id={'donate'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
						{'Donate'}
					</h2>
					<DonationSection {...props} />
				</div>
			</div>
		</>
	);
}

export default Profile;
