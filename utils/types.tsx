import type {BigNumber} from 'ethers';
import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Maybe<T> = T | null | undefined;

export type TPossibleStatus = 'pending' | 'expired' | 'fulfilled' | 'cancelled' | 'invalid'
export type TPossibleFlowStep = 'valid' | 'invalid' | 'pending' | 'undetermined';

export type TToken = {
	label: string;
	symbol: string;
	decimals: number;
	value: string;
	icon?: ReactElement;
}

export type TInitSolverArgs = {
	from: TAddress,
	receiver: TAddress,
	inputToken: TToken
	outputToken: TToken
	inputAmount: BigNumber
}