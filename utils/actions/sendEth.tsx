
import {BaseError} from 'viem';
import * as allChains from 'viem/chains';
import {waitForTransaction} from '@wagmi/core';
import {toWagmiAddress} from '@yearn-finance/web-lib/utils/address';

import type {Connector} from 'wagmi';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	sendEther(
	provider: Connector,
	to: TAddress,
	value: bigint
): Promise<TTxResponse> {
	try {
		const signer = await provider.getWalletClient();
		const chainID = await provider.getChainId();
		const chainForID = Object.values(allChains).find((chain): boolean => chain.id === chainID);
		if (!chainForID) {
			return {isSuccessful: false, error: new BaseError(`Chain ID ${chainID} not found`)};
		}
		const transaction = await signer.sendTransaction({to: toWagmiAddress(to), value, chain: chainForID});
		const receipt = await waitForTransaction({
			chainId: chainID,
			hash: transaction
		});
		return {isSuccessful: true, receipt};
	} catch (error) {
		console.error(error);
		return {isSuccessful: false, error: error as BaseError};
	}
}
