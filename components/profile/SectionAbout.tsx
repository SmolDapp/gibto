import React from 'react';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types/types';

function	SectionAbout(props: TReceiverProps): ReactElement {
	const	placeHolder = 'hmm, looks like there’s nothing here yet. how intriguing!';

	return (
		<div className={'mb-20'}>
			<div className={'flex flex-row items-center justify-between'}>
				<h2 id={'about'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
					{'About'}
				</h2>
			</div>
			<div
				className={'-mt-4 space-y-2 whitespace-break-spaces py-4 text-sm text-neutral-700'}>
				{props.about || placeHolder}
			</div>
		</div>
	);
}

export default SectionAbout;
