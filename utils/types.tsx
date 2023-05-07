import type {ReactElement} from 'react';

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

export type TReceiverProps = {
	address: string;
	name: string;
	ensHandle: string;
	lensHandle: string;
	description: string;
	about: string;
	avatar: string;
	cover: string;
	email: string;
	website: string;
	telegram: string;
	twitter: string;
	github: string;
	reddit: string;
	discord: string;
	isCreated: boolean;
	isVerified: boolean;
	identitySource: 'on-chain' | 'off-chain';
} & {mutate: () => void};
