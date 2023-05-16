
import {waitForTransaction} from '@wagmi/core';
import {toWagmiAddress} from '@yearn-finance/web-lib/utils/address';

import type {BaseError} from 'viem';
import type {Connector} from 'wagmi';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	sendEther(
	provider: Connector,
	chainID: number,
	to: TAddress,
	value: bigint
): Promise<TTxResponse> {
	const	signer = await provider.getWalletClient();
	try {
		const transaction = await signer.sendTransaction({to: toWagmiAddress(to), value});
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
