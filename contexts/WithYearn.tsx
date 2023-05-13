import	React					from	'react';

import {Web3ContextApp} from './useWeb3';

import type {ReactElement} from 'react';
import type {TSettingsBase, TSettingsOptions, TUIOptions, TWeb3Options} from './useWeb3Types';

function	WithYearn({children, options}: {
	children: any,
	options?: {
		ui?: TUIOptions,
		web3?: TWeb3Options,
		networks?: TSettingsOptions,
		baseSettings?: Partial<TSettingsBase>,
	}
}): ReactElement {
	return (
		<Web3ContextApp options={options?.web3}>
			{children}
		</Web3ContextApp>
	);
}

export {WithYearn};
