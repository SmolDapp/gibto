import	React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {ModalLogin} from 'components/common/ModalLogin';
import {optimism, polygon} from 'viem/chains';
import {configureChains, createConfig, mainnet, useAccount, useConnect, useDisconnect, useEnsName, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient, WagmiConfig} from 'wagmi';
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet';
import {InjectedConnector} from 'wagmi/connectors/injected';
import {LedgerConnector} from 'wagmi/connectors/ledger';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import {SafeConnector} from 'wagmi/connectors/safe';
import {WalletConnectLegacyConnector} from 'wagmi/connectors/walletConnectLegacy';
import {publicProvider} from 'wagmi/providers/public';
import {deepMerge} from '@yearn-finance/web-lib/contexts/utils';
import {getProvider, getRPC} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TPartnersInfo} from '@yearn-finance/web-lib/utils/partners';
import type {TWeb3Context, TWeb3Options} from './useWeb3Types';


const defaultState = {
	address: undefined,
	ens: undefined,
	lensProtocolHandle: undefined,
	chainID: 1,
	isDisconnected: false,
	isActive: false,
	isConnecting: false,
	hasProvider: false,
	provider: getProvider(),
	currentPartner: undefined,
	walletType: 'NONE',
	onConnect: async (): Promise<void> => undefined,
	onSwitchChain: (): void => undefined,
	openLoginModal: (): void => undefined,
	onDesactivate: (): void => undefined
};
const	defaultOptions: TWeb3Options = {
	shouldUseWallets: true,
	defaultChainID: 1,
	supportedChainID: [1, 4, 5, 10, 56, 100, 137, 250, 420, 1337, 31337, 42161]
};

const Web3Context = createContext<TWeb3Context>(defaultState);
type TWeb3ContextAppWrapperProps = {
	children: ReactElement;
	options?: TWeb3Options;
	currentPartner?: TPartnersInfo;
	isConnecting: boolean;
	walletType: string;
	onConnect: (p: string, e?: ((error: Error) => void) | undefined, s?: (() => void) | undefined) => Promise<void>;
	onInteractiveConnect?: () => Promise<boolean>;
	onDisconnect: () => void;
}

const {chains, publicClient, webSocketPublicClient} = configureChains(
	[mainnet, polygon, optimism],
	[publicProvider()]
);
const config = createConfig({
	autoConnect: true,
	publicClient,
	webSocketPublicClient,
	connectors: [
		new InjectedConnector({chains}),
		new MetaMaskConnector(),
		new LedgerConnector({chains: [mainnet]}),
		new WalletConnectLegacyConnector({options: {qrcode: true}}),
		new CoinbaseWalletConnector({
			options: {
				jsonRpcUrl: getRPC(1),
				appName: process.env.WEBSITE_TITLE as string
			}
		}),
		new SafeConnector({
			chains,
			options: {
				allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
				debug: false
			}
		})
	]
});



export const Web3ContextAppWrapper = ({children, options}: {children: ReactElement, options?: TWeb3Options}): ReactElement => {
	const {address, isConnecting, isConnected, isDisconnected} = useAccount();
	const {connectAsync, connectors} = useConnect();
	const {disconnect} = useDisconnect();
	const {switchNetwork} = useSwitchNetwork();
	const {data: ensName} = useEnsName({address: address});
	const {data: walletClient, isSuccess} = useWalletClient();
	const {chain} = useNetwork();
	const publicClient = usePublicClient();
	const web3Options = deepMerge(defaultOptions, options) as TWeb3Options;
	const [isModalLoginOpen, set_isModalLoginOpen] = useState(false);

	const onConnect = useCallback(async (
		providerType: string,
		onError?: ((error: Error) => void) | undefined,
		onSuccess?: (() => void) | undefined
	): Promise<void> => {
		try {
			if (providerType === 'INJECTED' || providerType === 'INJECTED_LEDGER') {
				await connectAsync({connector: connectors[0]});
			} else if (providerType === 'WALLET_CONNECT') {
				await connectAsync({connector: connectors[3]});
			} else if (providerType === 'EMBED_LEDGER') {
				await connectAsync({connector: connectors[2]});
			} else if (providerType === 'EMBED_GNOSIS_SAFE') {
				await connectAsync({connector: connectors[5]});
			} else if (providerType === 'EMBED_COINBASE') {
				await connectAsync({connector: connectors[4]});
			} else if (providerType === 'EMBED_TRUSTWALLET') {
				await connectAsync({connector: connectors[0]});
			} else {
				await connectAsync({connector: connectors[0]});
			}
			onSuccess?.();
		} catch (error) {
			onError?.(error as unknown as Error);
		}
	}, [connectAsync, connectors]);

	const onDesactivate = useCallback((): void => {
		disconnect();
	}, [disconnect]);

	const	onSwitchChain = useCallback((newChainID: number, force?: boolean): void => {
		if (force) {
			console.warn('onSwitchChain with force parameter is deprecated');
		}
		switchNetwork?.(newChainID);
	}, [switchNetwork]);

	const openLoginModal = useCallback(async (): Promise<void> => {
		console.log('hello');
		// const	shouldSkipModal = await onInteractiveConnect?.();
		// if (!shouldSkipModal) {
		set_isModalLoginOpen(true);
		// }
	}, []);

	const	contextValue = useMemo((): TWeb3Context => {
		return ({
			address: address as TAddress,
			isConnecting,
			isDisconnected,
			ens: ensName || '',
			isActive: isConnected && isSuccess,

			lensProtocolHandle: '',
			hasProvider: !!(walletClient || publicClient),
			provider: (walletClient || publicClient) as any,
			chainID: Number(chain?.id || 0),
			onConnect,
			onSwitchChain,
			openLoginModal,
			onDesactivate: onDesactivate,
			options: web3Options,
			walletType: 'NONE'
		});
	}, [address, chain?.id, ensName, isConnected, isConnecting, isDisconnected, isSuccess, onConnect, onDesactivate, onSwitchChain, openLoginModal, publicClient, walletClient, web3Options]);

	return (
		<Web3Context.Provider value={contextValue}>
			{children}
			<ModalLogin
				isOpen={isModalLoginOpen}
				onClose={(): void => set_isModalLoginOpen(false)} />
		</Web3Context.Provider>
	);
};

export const Web3ContextApp = ({children}: {children: ReactElement, options?: TWeb3Options}): ReactElement => {

	console.warn('hELLEO');


	return (
		<WagmiConfig config={config}>
			<Web3ContextAppWrapper>
				{children}
			</Web3ContextAppWrapper>
		</WagmiConfig>
	);
};

export const useWeb3 = (): TWeb3Context => useContext(Web3Context);
export default useWeb3;
