import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {TAddress, TNDict} from '@yearn-finance/web-lib/types';

export const MATIC_TOKEN_ADDRESS = toAddress('0x0000000000000000000000000000000000001010');
export const POLYGON_LENS_ADDRESS = toAddress('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d');
export const ETHEREUM_ENS_ADDRESS = toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85');

export const NFTMIGRATOOOR_CONTRACT_PER_CHAIN: TNDict<TAddress> = {
	1: toAddress('0x100CCFF9117E168158a6BE35081694fBbe394fBB'),
	10: toAddress('0x6dfd3a052bb73e609d9c2381dc48de5e2662575e'),
	100: toAddress('0xC813978A4c104250B1d2bC198cC7bE74b68Cd81b'),
	137: toAddress('0x0e5b46E4b2a05fd53F5a4cD974eb98a9a613bcb7'),
	250: toAddress('0x291F9794fFB8Cd1F71CE5478E40b5E29a029dbE9'),
	1101: toAddress('0xA3a3C48F1d5191968D3dEF7A5aE4c860589Bf380'),
	42161: toAddress('0x7E08735690028cdF3D81e7165493F1C34065AbA2')
};

export const GECKO_CHAIN_NAMES: TNDict<string> = {
	1:     'ethereum',
	10:    'optimistic-ethereum',
	56:    'binance-smart-chain',
	100:   'xdai',
	137:   'polygon-pos',
	250:   'fantom',
	1101:  'polygon-zkevm',
	42161: 'arbitrum-one'
};

export const NATIVE_WRAPPER_COINS: TNDict<TAddress> = {
	1: toAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
	10: toAddress('0x4200000000000000000000000000000000000006'),
	56: toAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
	100: toAddress('0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'),
	137: toAddress('0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'),
	250: toAddress('0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'),
	1101: toAddress('0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9'),
	42161: toAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')
};
