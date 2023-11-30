import assert from 'assert';
import {BaseError} from 'viem';
import {erc20ABI, getPublicClient, prepareSendTransaction, prepareWriteContract, readContract, sendTransaction, switchNetwork, waitForTransaction, writeContract} from '@wagmi/core';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {MAX_UINT_256} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {toWagmiProvider} from '@yearn-finance/web-lib/utils/wagmi/provider';
import {assertAddress} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {Abi,SimulateContractParameters} from 'viem';
import type {Connector, WalletClient} from 'wagmi';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TWriteTransaction} from '@yearn-finance/web-lib/utils/wagmi/provider';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

//Because USDT do not return a boolean on approve, we need to use this ABI
const ALTERNATE_ERC20_APPROVE_ABI = [{'constant': false, 'inputs': [{'name': '_spender', 'type': 'address'}, {'name': '_value', 'type': 'uint256'}], 'name': 'approve', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}] as const;


type TPrepareWriteContractConfig<
	TAbi extends Abi | readonly unknown[] = Abi,
	TFunctionName extends string = string
> = Omit<SimulateContractParameters<TAbi, TFunctionName>, 'chain' | 'address'> & {
	chainId?: number;
	walletClient?: WalletClient;
	address: TAddress | undefined;
	confirmation?: number;
};
export async function handleTx<TAbi extends Abi | readonly unknown[], TFunctionName extends string>(
	args: TWriteTransaction,
	props: TPrepareWriteContractConfig<TAbi, TFunctionName>
): Promise<TTxResponse> {
	args.statusHandler?.({...defaultTxStatus, pending: true});
	let wagmiProvider = await toWagmiProvider(args.connector);

	// Use debug mode
	if ((window as any).ethereum.useForknetForMainnet) {
		if (args.chainID === 1) {
			args.chainID = 1337;
		}
	}

	/* 🔵 - Yearn.Fi ***************************************************************************
	 ** First, make sure we are using the correct chainID.
	 ******************************************************************************************/
	if (wagmiProvider.chainId !== args.chainID) {
		try {
			await switchNetwork({chainId: args.chainID});
		} catch (error) {
			if (!(error instanceof BaseError)) {
				return {isSuccessful: false, error};
			}
			toast({type: 'error', content: error.shortMessage});
			args.statusHandler?.({...defaultTxStatus, error: true});
			console.error(error);
			return {isSuccessful: false, error};
		}
	}

	wagmiProvider = await toWagmiProvider(args.connector);
	assertAddress(props.address, 'contractAddress');
	assertAddress(wagmiProvider.address, 'userAddress');
	assert(wagmiProvider.chainId === args.chainID, 'ChainID mismatch');
	try {
		const config = await prepareWriteContract({
			...wagmiProvider,
			...(props as TPrepareWriteContractConfig),
			address: props.address,
			value: toBigInt(props.value),
			chainId: args.chainID
		});
		const {hash} = await writeContract({...config.request, chainId: undefined});
		const receipt = await waitForTransaction({
			hash,
			chainId: args.chainID,
			confirmations: props.confirmation || 2
		});
		if (receipt.status === 'success') {
			args.statusHandler?.({...defaultTxStatus, success: true});
		} else if (receipt.status === 'reverted') {
			args.statusHandler?.({...defaultTxStatus, error: true});
		}
		toast({type: 'success', content: 'Transaction successful!'});
		return {isSuccessful: receipt.status === 'success', receipt};
	} catch (error) {
		if (!(error instanceof BaseError)) {
			return {isSuccessful: false, error};
		}

		if (args.onTrySomethingElse) {
			if (error.name === 'ContractFunctionExecutionError') {
				return await args.onTrySomethingElse();
			}
		}

			toast({type: 'error', content: error.shortMessage});
		args.statusHandler?.({...defaultTxStatus, error: true});
		console.error(error);
		return {isSuccessful: false, error};
	} finally {
		setTimeout((): void => {
			args.statusHandler?.({...defaultTxStatus});
		}, 3000);
	}
}








/* 🔵 - Yearn Finance **********************************************************
** isApprovedERC20 is a _VIEW_ function that checks if a token is approved for
** a spender.
******************************************************************************/
type TIsApprovedERC20 = {
	connector: Connector | undefined;
	contractAddress: TAddress;
	spenderAddress: TAddress;
	amount?: bigint;
}
export async function isApprovedERC20(props: TIsApprovedERC20): Promise<boolean> {
	const wagmiProvider = await toWagmiProvider(props.connector);
	const result = await readContract({
		...wagmiProvider,
		abi: erc20ABI,
		address: props.contractAddress,
		functionName: 'allowance',
		args: [wagmiProvider.address, props.spenderAddress]
	});
	return (result || 0n) >= toBigInt(props.amount || MAX_UINT_256);
}

/* 🔵 - Yearn Finance **********************************************************
** approveERC20 is a _WRITE_ function that approves a token for a spender.
**
** @param spenderAddress - The address of the spender.
** @param amount - The amount of collateral to deposit.
******************************************************************************/
type TApproveERC20 = TWriteTransaction & {
	spenderAddress: TAddress | undefined;
	amount: bigint;
};
export async function approveERC20(props: TApproveERC20): Promise<TTxResponse> {
	assertAddress(props.spenderAddress, 'spenderAddress');
	assertAddress(props.contractAddress);

	props.onTrySomethingElse = async (): Promise<TTxResponse> => {
		assertAddress(props.spenderAddress, 'spenderAddress');
		return await handleTx(props, {
			address: props.contractAddress,
			abi: ALTERNATE_ERC20_APPROVE_ABI,
			functionName: 'approve',
			args: [props.spenderAddress, props.amount]
		});
	};

	return await handleTx(props, {
		address: props.contractAddress,
		abi: erc20ABI,
		functionName: 'approve',
		args: [props.spenderAddress, props.amount]
	});
}

/* 🔵 - Yearn Finance **********************************************************
** transferERC20 is a _WRITE_ function that transfers a token to a recipient.
**
** @param spenderAddress - The address of the spender.
** @param amount - The amount of collateral to deposit.
******************************************************************************/
type TTransferERC20 = TWriteTransaction & {
	receiverAddress: TAddress | undefined;
	amount: bigint;
};
export async function transferERC20(props: TTransferERC20): Promise<TTxResponse> {
	assertAddress(props.receiverAddress, 'receiverAddress');
	assertAddress(props.contractAddress);

	console.warn(props);
	return await handleTx(props, {
		address: props.contractAddress,
		abi: erc20ABI,
		functionName: 'transfer',
		chainId: props.chainID,
		args: [props.receiverAddress, props.amount]
	});
}

/* 🔵 - Yearn Finance **********************************************************
** transferEther is a _WRITE_ function that transfers ETH to a recipient.
** Here, ETH represents the chain's native coin.
**
** @param spenderAddress - The address of the spender.
** @param amount - The amount of collateral to deposit.
******************************************************************************/
type TTransferEther = Omit<TWriteTransaction, 'contractAddress'> & {
	receiverAddress: TAddress | undefined;
	amount: bigint;
	shouldAdjustForGas?: boolean;
};
export async function transferEther(props: TTransferEther): Promise<TTxResponse> {
	assertAddress(props.receiverAddress, 'receiverAddress');

	props.statusHandler?.({...defaultTxStatus, pending: true});
	const wagmiProvider = await toWagmiProvider(props.connector);

	assertAddress(wagmiProvider.address, 'userAddress');
	try {
		let config = await prepareSendTransaction({
			...wagmiProvider,
			to: props.receiverAddress,
			value: props.amount
		});
		if (props.shouldAdjustForGas) {
			if (!config.maxPriorityFeePerGas) {
				const client = await getPublicClient({chainId: wagmiProvider.chainId});
				const gasPrice = await client.getGasPrice();
				config.maxPriorityFeePerGas = gasPrice;
			}
			const newAmount = (toBigInt(config.gas) * toBigInt(config.maxPriorityFeePerGas)) + 21_000n;
			config = await prepareSendTransaction({
				...wagmiProvider,
				to: props.receiverAddress,
				value: props.amount - newAmount
			});
		}
		const {hash} = await sendTransaction(config);
		const receipt = await waitForTransaction({chainId: wagmiProvider.chainId, hash});
		if (receipt.status === 'success') {
			props.statusHandler?.({...defaultTxStatus, success: true});
		} else if (receipt.status === 'reverted') {
			props.statusHandler?.({...defaultTxStatus, error: true});
		}
		return ({isSuccessful: receipt.status === 'success', receipt});
	} catch (error) {
		console.error(error);
		const errorAsBaseError = error as BaseError;
		props.statusHandler?.({...defaultTxStatus, error: true});
		return ({isSuccessful: false, error: errorAsBaseError || ''});
	} finally {
		setTimeout((): void => {
			props.statusHandler?.({...defaultTxStatus});
		}, 3000);
	}
}
