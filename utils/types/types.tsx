import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict, TNDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export type TTokenList = {
	name: string;
	description: string;
	timestamp: string;
	logoURI: string;
	uri: string;
	keywords: string[];
	version: {
		major: number;
		minor: number;
		patch: number;
	};
	tokens: {
		address: TAddress;
		name: string;
		symbol: string;
		decimals: number;
		chainId: number;
		logoURI?: string;
	}[];
};

export type TToken = {
	address: TAddress;
	name: string;
	symbol: string;
	decimals: number;
	chainID: number;
	logoURI?: string;
	//Optional fields
	value?: number;
	price?: TNormalizedBN;
	balance?: TNormalizedBN;
};
export type TChainTokens = TNDict<TDict<TToken>>;

export type TComboboxAddressInput = {
	value: TToken | undefined;
	possibleValues: TDict<TToken>;
	onChangeValue: (value: TToken) => void;
	onAddValue: Dispatch<SetStateAction<TDict<TToken>>>;
	shouldSort?: boolean;
	shouldHideZeroBalance?: boolean;
};

export type TTokenWithAmount = TToken & {
	amount: TNormalizedBN;
	amountWithSlippage?: string;
};


export type TAddresses = {
	eth?: string;
	opt?: string;
	bsc?: string;
	gno?: string;
	matic?: string;
	ftm?: string;
	zkevm?: string;
	arb?: string;
}
export type TNetworkData = {name: string, label: string};
export const PossibleNetworks: TNDict<TNetworkData> = {
	1: {name: 'Ethereum', label: 'eth'},
	10: {name: 'Optimism', label: 'opt'},
	56: {name: 'Binance Smart Chain', label: 'bsc'},
	100: {name: 'Gnosis', label: 'gno'},
	137: {name: 'Polygon', label: 'matic'},
	250: {name: 'Fantom', label: 'ftm'},
	324: {name: 'zkSync', label: 'zksync'},
	1101: {name: 'Polygon zkEVM', label: 'zkevm'},
	42161: {name: 'Arbitrum', label: 'arb'}
};

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
	isCreated: boolean;
	isVerified: boolean;
	isOwner: boolean;
	uniqueGivers?: number;
	identitySource: 'on-chain' | 'off-chain';
	order?: number;
	addresses: TAddresses;
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
