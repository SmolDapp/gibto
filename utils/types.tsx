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
	UUID: string;
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
	networks: number[];
	isCreated: boolean;
	isVerified: boolean;
	isOwner: boolean;
	identitySource: 'on-chain' | 'off-chain';
	order?: number;
} & {mutate: () => void};

export type TDonationsProps = {
	UUID: string;
	from: string
	to: string
	token: string
	fromENS: string
	tokenName: string
	amountRaw: string
	txHash: string
	message: string
	amount: number
	value: number
	pricePerToken: number
	chainID: number
	decimals: number
	time: number
	isVerified: boolean
}

export type TGoal = {
	UUID: string;
	startDate: number;
	endDate: number;
	value: number;
	received: number;
}
