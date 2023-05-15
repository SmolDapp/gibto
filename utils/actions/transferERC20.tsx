import {erc20ABI, prepareWriteContract} from '@wagmi/core';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {handleTx} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {Connector} from 'wagmi';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	transfer(
	provider: Connector,
	chainID: number,
	token: TAddress,
	receiver: TAddress,
	amount: bigint
): Promise<TTxResponse> {
	const signer = await provider.getWalletClient();
	const config = await prepareWriteContract({
		address: toAddress(token),
		abi: erc20ABI,
		functionName: 'transfer',
		walletClient: signer,
		chainId: chainID,
		args: [receiver, amount]
	});
	return await handleTx(config);
}
