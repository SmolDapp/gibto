import {useCallback, useEffect, useState} from 'react';
import CardWithIcon from 'components/CardWithIcon';
import ComboboxAddressInput from 'components/ComboboxAddressInput';
import IconMessage from 'components/icons/IconMessage';
import IconMessageCheck from 'components/icons/IconMessageCheck';
import {useWallet} from 'contexts/useWallet';
import {ethers} from 'ethers';
import {handleInputChangeEventValue} from 'utils';
import {sendEther} from 'utils/actions/sendEth';
import {transfer} from 'utils/actions/transferERC20';
import cowswapTokenList from 'utils/tokenLists.json';
import axios from 'axios';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN, Zero} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import ModalMessage from './ModalMessage';

import type {TTokenInfo, TTokenList} from 'contexts/useTokenList';
import type {TUseBalancesTokens} from 'hooks/useBalances';
import type {ChangeEvent, Dispatch, ReactElement, SetStateAction} from 'react';
import type {TReceiverProps} from 'utils/types';
import type {TDict, TNDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

function	TokenToSend({tokenToSend, onChange}: {tokenToSend: TTokenInfo, onChange: Dispatch<SetStateAction<TTokenInfo>>}): ReactElement {
	const	[, set_isValidDestination] = useState<boolean | 'undetermined'>('undetermined');
	const	[possibleDestinations, set_possibleDestinations] = useState<TDict<TTokenInfo>>({});

	/* 🔵 - Yearn Finance **************************************************************************
	** On mount, fetch the token list from the tokenlistooor repo for the cowswap token list, which
	** will be used to populate the destination token combobox.
	** Only the tokens in that list will be displayed as possible destinations.
	**********************************************************************************************/
	useMountEffect((): void => {
		axios.all([axios.get('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/1/yearn.json')]).then(axios.spread((yearnResponse): void => {
			const	cowswapTokenListResponse = cowswapTokenList as TTokenList;
			const	yearnTokenListResponse = yearnResponse.data as TTokenList;
			const	possibleDestinationsTokens: TDict<TTokenInfo> = {};
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = {
				address: ETH_TOKEN_ADDRESS,
				chainId: 1,
				name: 'Ether',
				symbol: 'ETH',
				decimals: 18,
				logoURI: `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/${ETH_TOKEN_ADDRESS}/logo-128.png`
			};
			for (const eachToken of cowswapTokenListResponse.tokens) {
				if (eachToken.extra) {
					continue;
				}
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
			for (const eachToken of yearnTokenListResponse.tokens) {
				if (eachToken.symbol.startsWith('yv')) {
					possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
				}
			}
			set_possibleDestinations(possibleDestinationsTokens);
		}));
	});

	/* 🔵 - Yearn Finance **************************************************************************
	** When the destination token changes, check if it is a valid destination token. The check is
	** trivial as we only check if the address is valid.
	**********************************************************************************************/
	useUpdateEffect((): void => {
		set_isValidDestination('undetermined');
		if (!isZeroAddress(toAddress(tokenToSend.address))) {
			set_isValidDestination(true);
		}
	}, [tokenToSend]);

	return (
		<ComboboxAddressInput
			possibleDestinations={possibleDestinations}
			onAddPossibleDestination={set_possibleDestinations}
			value={tokenToSend.address}
			onChangeValue={(newToken): void => onChange(newToken)} />
	);
}

function	AmountToSend({token, amountToSend, onChange}: {
	token: TTokenInfo,
	amountToSend: TNormalizedBN,
	onChange: Dispatch<SetStateAction<TNormalizedBN>>
}): ReactElement {
	/**********************************************************************************************
	** onInputChange is triggered when the user is typing in the input field. It updates the
	** amount in the state and triggers the debounced retrieval of the quote from the Cowswap API.
	** It is set as callback to avoid unnecessary re-renders.
	**********************************************************************************************/
	const	onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
		onChange(handleInputChangeEventValue(e, token?.decimals || 18));
	}, [onChange, token?.decimals]);

	return (
		<input
			key={token?.address}
			id={'amountToSend'}
			className={'h-auto w-full overflow-x-scroll border-none bg-transparent p-0 text-center text-5xl font-bold tabular-nums outline-none scrollbar-none'}
			type={'number'}
			min={0}
			step={1 / 10 ** (token.decimals || 18)}
			inputMode={'numeric'}
			placeholder={'0'}
			pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
			value={amountToSend?.normalized ?? '0'}
			onChange={onInputChange} />
	);
}

type TOnDonateCallback = (toRefresh?: TUseBalancesTokens) => Promise<void>;
function	SectionDonate(props: TReceiverProps & {onDonateCallback: TOnDonateCallback}): ReactElement {
	const {address, provider, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const {balances} = useWallet();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const [price, set_price] = useState<TNDict<TDict<number>>>({});
	const [isModalOpen, set_isModalOpen] = useState<boolean>(false);
	const [attachedMessage, set_attachedMessage] = useState<string>('');
	const [amountToSend, set_amountToSend] = useState<TNormalizedBN & {value: number}>({...toNormalizedBN(0), value: 0});
	const [tokenToSend, set_tokenToSend] = useState<TTokenInfo>({
		address: ETH_TOKEN_ADDRESS,
		chainId: 1,
		name: 'Ether',
		symbol: 'ETH',
		decimals: 18,
		logoURI: `https://assets.smold.app/api/token/1/${ETH_TOKEN_ADDRESS}/logo-128.png`
	});

	const onRegisterDonation = useCallback(async (txHash: string): Promise<void> => {
		try {
			await axios.post(`${process.env.BASE_API_URI}/give/${toAddress(props.address)}`, {
				from: address,
				to: props.address,
				token: tokenToSend.address,
				amount: amountToSend.raw.toString(),
				txHash: txHash,
				chainID: safeChainID,
				message: attachedMessage
			});
			props.mutate();
		} catch (e) {
			console.error(e);
		}
	}, [address, amountToSend.raw, attachedMessage, props, safeChainID, tokenToSend.address]);

	const onDonate = useCallback(async (): Promise<void> => {
		if (toAddress(tokenToSend.address) === ETH_TOKEN_ADDRESS) {
			new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(props.address),
				amountToSend.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (receipt): Promise<void> => {
				if (receipt?.transactionHash) {
					await onRegisterDonation(receipt.transactionHash);
				}
				await props.onDonateCallback();
				set_amountToSend({...toNormalizedBN(0), value: 0});
			}).perform();
		} else {
			new Transaction(provider, transfer, set_txStatus).populate(
				toAddress(tokenToSend.address),
				toAddress(props.address),
				amountToSend.raw,
				balances[tokenToSend.address]?.raw
			).onSuccess(async (receipt): Promise<void> => {
				if (receipt?.transactionHash) {
					await onRegisterDonation(receipt.transactionHash);
				}
				await props.onDonateCallback({
					token: toAddress(tokenToSend.address),
					decimals: tokenToSend.decimals,
					symbol: tokenToSend.symbol,
					name: tokenToSend.name
				});
				set_amountToSend({...toNormalizedBN(0), value: 0});
			}).perform();
		}
	}, [amountToSend.raw, balances, onRegisterDonation, props, provider, tokenToSend.address, tokenToSend.decimals, tokenToSend.name, tokenToSend.symbol]);

	const onComputeValueFromAmount = useCallback((amount: TNormalizedBN): void => {
		const	value = Number(amount.normalized) * price[safeChainID][tokenToSend.address];
		set_amountToSend({...amount, value});
	}, [price, safeChainID, tokenToSend.address]);

	const onComputeAmountFromValue = useCallback((value: number): void => {
		const amountNormalized = value / price[safeChainID][tokenToSend.address];
		const amountAsBN = ethers.utils.parseUnits(amountNormalized.toFixed(6), tokenToSend.decimals);
		set_amountToSend({...toNormalizedBN(amountAsBN, tokenToSend.decimals), value});
	}, [price, safeChainID, tokenToSend.address, tokenToSend.decimals]);

	const onRefreshPrice = useCallback(async (): Promise<void> => {
		let	tokenAddress = tokenToSend.address;
		if (tokenToSend.address === ETH_TOKEN_ADDRESS) {
			tokenAddress = WETH_TOKEN_ADDRESS;
		}

		const response = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd&precision=6`);
		set_price((prev): TNDict<TDict<number>> => {
			const	newPrice = {...prev};
			if (!newPrice[safeChainID]) {
				newPrice[safeChainID] = {};
			}
			newPrice[safeChainID][tokenToSend.address] = Number(response?.data?.[tokenAddress.toLowerCase()]?.usd || 0);
			return newPrice;
		});
		set_amountToSend((prev): TNormalizedBN & {value: number} => {
			const	newAmount = {...prev};
			//If a specific value is selected, we don't want to change it, so we only update the value to match the new price
			if ([10, 50, 100].includes(Number(formatAmount(newAmount.value, 2, 2)))) {
				const amountNormalized = newAmount.value / Number(response?.data?.[tokenAddress.toLowerCase()]?.usd || 0);
				const	amountAsBN = ethers.utils.parseUnits(amountNormalized.toFixed(6), tokenToSend.decimals);
				const normalizedBNAmount = toNormalizedBN(amountAsBN, tokenToSend.decimals);
				newAmount.normalized = normalizedBNAmount.normalized;
				newAmount.raw = normalizedBNAmount.raw;
			} else {
				newAmount.value = Number(newAmount.normalized) * Number(response?.data?.[tokenAddress.toLowerCase()]?.usd || 0);
			}
			return newAmount;
		});
	}, [tokenToSend.address, tokenToSend.decimals, safeChainID]);

	useEffect((): void => {
		onRefreshPrice();
	}, [onRefreshPrice]);

	return (
		<div className={'grid grid-cols-3 gap-4'}>
			<div className={'relative grid grid-cols-1 gap-2 md:grid-cols-1'}>
				<CardWithIcon
					isSelected={Number(formatAmount(amountToSend.value, 2, 2)) === 10}
					icon={(
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 576 512'}
							className={'h-6 w-6'}>
							<path d={'M162.4 306.8c11.1 13.4 24.1 26.8 38.7 39.2c35.5 30 81.4 54 134.8 54s99.3-24 134.8-54c35.5-30 60.8-66 73.2-90c-12.4-24-37.6-60-73.2-90c-35.5-30-81.4-54-134.8-54s-99.3 24-134.8 54c-14.6 12.4-27.6 25.8-38.7 39.2L145.1 226l-23.4-13.6L32 160l45.8 80.1L86.9 256l-9.1 15.9L32 352l89.7-52.3L145.1 286l17.3 20.8zM4.2 336.1L50 256 4.2 175.9c-7.2-12.6-5-28.4 5.3-38.6s26.1-12.2 38.7-4.9l89.7 52.3c12.2-14.6 26.5-29.4 42.7-43.1C219.7 108.5 272.6 80 336 80s116.3 28.5 155.5 61.5c39.1 33 66.9 72.4 81 99.8c4.7 9.2 4.7 20.1 0 29.3c-14.1 27.4-41.9 66.8-81 99.8C452.3 403.5 399.4 432 336 432s-116.3-28.5-155.5-61.5c-16.2-13.7-30.5-28.5-42.7-43.1L48.1 379.6c-12.5 7.3-28.4 5.3-38.7-4.9S-3 348.7 4.2 336.1zM416 232a24 24 0 1 1 0 48 24 24 0 1 1 0-48z'} fill={'currentcolor'}/>
						</svg>
					)}
					label={'$10.00'}
					onClick={(): void => onComputeAmountFromValue(10)} />
				<CardWithIcon
					isSelected={Number(formatAmount(amountToSend.value, 2, 2)) === 50}
					icon={(
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 512 512'}
							className={'h-6 w-6'}>
							<path d={'M176 32h49.1c40.5 0 78.7 9.4 112.7 26.2c4 2 8.5 2.2 12.7 .7c32.4-12.1 73.2-24.6 105.2-26.6c-.8 3.3-2.2 7.6-4.2 13c-7.2 18.6-20.2 42.3-31.2 61.1c-3.4 5.8-2.8 13.1 1.5 18.3C458.1 168.8 480 225.2 480 286.9c0 54.4-33.6 100.9-81.2 119.9C409.7 391.3 416 372.4 416 352c0-46.5-33-85.2-76.8-94.1c-4.7-1-9.6 .3-13.3 3.3s-5.9 7.6-5.9 12.4V325c0 6.1-4.9 11-11 11c-2.9 0-5.6-1.1-7.7-3.1l-73.8-72.3c-3-2.9-7-4.6-11.2-4.6H216 176 50.2c-10 0-18.2-8.1-18.2-18.2c0-6.5 3.4-12.4 9-15.7l25.1-14.6c6.9-4.1 9.8-12.6 6.7-20c-5.6-13.4-8.8-28-8.8-43.5C64 82.1 114.1 32 176 32zm280.6-6.3a.1 .1 0 1 0 -.2 .1 .1 .1 0 1 0 .2-.1zM320 416H281.9l-1-2.1C261.9 376 223.1 352 180.7 352H176c-5.5 0-10.7 2.9-13.6 7.6s-3.2 10.6-.7 15.6L190.1 432l-28.4 56.8c-2.5 5-2.2 10.9 .7 15.6s8.1 7.6 13.6 7.6h4.7c42.4 0 81.2-24 100.2-61.9l1-2.1H320h30.9c89 0 161.1-72.1 161.1-161.1c0-65.3-21.8-125.6-58.6-173.8c10-17.5 21-38.4 27.9-56.2c3.9-10.2 7.4-21.4 7.3-30.9c0-4.8-1-11.5-5.6-17.3C477.9 2.3 470.6 0 464 0c-37 0-83.5 13.9-118.3 26.5C309 9.5 268.2 0 225.1 0H176C96.5 0 32 64.5 32 144c0 14.8 2.2 29.1 6.4 42.6l-13.5 7.9C9.5 203.5 0 220 0 237.8C0 265.5 22.5 288 50.2 288H176h33.8l69.1 67.7c8 7.9 18.8 12.3 30.1 12.3c23.7 0 43-19.2 43-43V296.6c19.1 11.1 32 31.8 32 55.4c0 35.3-28.7 64-64 64zM203.6 387.3c20.9 6.2 38.6 20.8 48.7 40.9l1.9 3.8-1.9 3.8c-10 20.1-27.8 34.7-48.7 40.9l18.8-37.5c2.3-4.5 2.3-9.8 0-14.3l-18.8-37.5zM152 176a24 24 0 1 0 0-48 24 24 0 1 0 0 48z'} fill={'currentcolor'}/>
						</svg>
					)}
					label={'$50.00'}
					onClick={(): void => onComputeAmountFromValue(50)} />
				<CardWithIcon
					isSelected={Number(formatAmount(amountToSend.value, 2, 2)) === 100}
					icon={(
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 640 512'}
							className={'h-6 w-6'}>
							<path d={'M164.9 .8c5.7 1.8 9.9 6.7 10.9 12.6l14.1 84.7 84.7 14.1c5.9 1 10.8 5.2 12.6 10.9s.3 12-3.9 16.2L242.6 180c-18.3 18.3-44.2 26.6-69.7 22.3L111 192 70.8 250.4c-9.2 13.3-10.4 30.6-3.1 45c7.5 15.1 22.9 24.6 39.7 24.6h3.2c11.3 0 22.2-3.8 31-10.9L270.9 205.7C333.8 155.4 411.8 128 492.3 128C573.9 128 640 194.1 640 275.7V384c0 53-43 96-96 96H162.4C72.7 480 0 407.3 0 317.6c0-39.5 15.7-77.3 43.6-105.2l46.5-46.5 3.4-3.4-7.9-47.4C81.4 89.6 89.7 63.7 108 45.4L148.7 4.7c4.2-4.2 10.5-5.8 16.2-3.9zM149.3 49.3L130.6 68c-11 11-16 26.5-13.4 41.8l8.7 52.2 52.2 8.7c15.3 2.5 30.9-2.4 41.8-13.4l18.7-18.7-65.3-10.9c-6.7-1.1-12-6.4-13.2-13.2L149.3 49.3zM368 296a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm-334.1 .5c-1.3 6.9-1.9 14-1.9 21.2C32 389.6 90.4 448 162.4 448H544c35.3 0 64-28.7 64-64V275.7C608 211.8 556.2 160 492.3 160c-73.2 0-144.2 24.9-201.4 70.7L161.6 334.1c-14.5 11.6-32.4 17.9-50.9 17.9h-3.2c-28.9 0-55.4-16.4-68.4-42.2c-2.2-4.3-3.9-8.8-5.2-13.3z'} fill={'currentcolor'}/>
						</svg>
					)}
					label={'$100.00'}
					onClick={(): void => onComputeAmountFromValue(100)} />
				<CardWithIcon
					isSelected={![0, 10, 50, 100].includes(Number(formatAmount(amountToSend.value, 2, 2)))}
					icon={(
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 512 512'}
							className={'h-6 w-6'}>
							<path d={'M112 32C73.3 32 41 59.5 33.6 96h97.1c4.2 0 8.3-1.7 11.3-4.7l6.6-6.6c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-6.6 6.6c-9 9-21.2 14.1-33.9 14.1H32v20.1c0 11.5 6.2 22.1 16.1 27.8l78.8 45C145.1 206 167.5 196 192 193V144c0-8.8 7.2-16 16-16s16 7.2 16 16v48h64V144c0-8.8 7.2-16 16-16s16 7.2 16 16v49c24.5 3.1 46.9 13.1 65.1 28l78.8-45c10-5.7 16.1-16.3 16.1-27.8V128H381.3c-12.7 0-24.9-5.1-33.9-14.1l-6.6-6.6c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l6.6 6.6c3 3 7.1 4.7 11.3 4.7h97.1C471 59.5 438.7 32 400 32H384l25.6 19.2c7.1 5.3 8.5 15.3 3.2 22.4s-15.3 8.5-22.4 3.2l-64-48c-5.5-4.1-7.8-11.3-5.6-17.9S329.1 0 336 0h64c61.9 0 112 50.1 112 112v36.1c0 23-12.3 44.2-32.2 55.6l-72.1 41.2c6 8.3 11.1 17.4 15 27.1h37.5l28.6-14.3c7.9-4 17.5-.7 21.5 7.2s.7 17.5-7.2 21.5l-32 16c-2.2 1.1-4.7 1.7-7.2 1.7H431c.7 5.2 1 10.6 1 16v8l22.2 9.2c1.9 .8 3.7 2 5.2 3.5l32 32c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-29.8-29.8-25.7-10.7-31.1 31.1L421.7 401c2.1 .8 4 2 5.6 3.6l32 32c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-29.6-29.6-49.8-19-15.1 15.1L377.3 451c4.2 3 6.7 7.9 6.7 13v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V472.2L318.1 448H193.9L160 472.2V496c0 8.8-7.2 16-16 16s-16-7.2-16-16V464c0-5.2 2.5-10 6.7-13l35.2-25.1-15.1-15.1-49.8 19L75.3 459.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l32-32c1.6-1.6 3.5-2.8 5.6-3.6l39.6-15.1L98.8 354.8 73.1 365.6 43.3 395.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l32-32c1.5-1.5 3.2-2.6 5.2-3.5L80 328v-8c0-5.4 .3-10.8 1-16H48c-2.5 0-4.9-.6-7.2-1.7l-32-16c-7.9-4-11.1-13.6-7.2-21.5s13.6-11.1 21.5-7.2L51.8 272H89.3c3.9-9.7 9-18.8 15-27.1L32.2 203.7C12.3 192.3 0 171.1 0 148.1V112C0 50.1 50.1 0 112 0h64c6.9 0 13 4.4 15.2 10.9s-.1 13.7-5.6 17.9l-64 48c-7.1 5.3-17.1 3.9-22.4-3.2s-3.9-17.1 3.2-22.4L128 32H112zM304 224H208c-53 0-96 43-96 96v2.7L205.3 416H306.7L400 322.7V320c0-53-43-96-96-96z'} fill={'currentcolor'}/>
						</svg>
					)}
					label={'Customize'}
					onClick={(): void => {
						document.getElementById('amountToSend')?.focus();
						onComputeAmountFromValue(69);
					}} />

			</div>
			<div className={'box-100 col-span-2 flex h-full flex-col p-4 pb-2'}>
				<div className={'font-number w-full space-y-4 rounded-lg bg-neutral-100 text-xs md:text-sm'}>
					<span className={'flex flex-col justify-between'}>
						<b className={'pb-2'}>{'Token:'}</b>
						<TokenToSend
							tokenToSend={tokenToSend}
							onChange={set_tokenToSend} />
					</span>
				</div>
				<div className={'flex h-full flex-col items-center justify-center py-20'}>
					<AmountToSend
						token={tokenToSend}
						amountToSend={amountToSend}
						onChange={(v): void => onComputeValueFromAmount(v as never)} />
					<p className={'font-number text-center text-xs text-neutral-600'} suppressHydrationWarning>
						{`${tokenToSend.symbol} ≈ $${formatAmount(amountToSend.value, 0, 2)}`}
					</p>
				</div>
				<div>
					<div className={'flex flex-row space-x-2'}>
						<Button
							className={'w-full'}
							isBusy={txStatus.pending}
							isDisabled={
								!isActive ||
								(amountToSend?.raw || Zero)?.isZero() ||
								(amountToSend?.raw || Zero)?.gt(balances?.[toAddress(tokenToSend.address)]?.raw || Zero)
							}
							onClick={onDonate}>
							{'Donate'}
						</Button>
						<Button
							variant={'light'}
							className={attachedMessage === '' ? '' : '!text-[#22c55e]'}
							onClick={(): void => set_isModalOpen(true)}>
							{attachedMessage === '' ? <IconMessage className={'h-5 w-5 '} /> : <IconMessageCheck className={'h-5 w-5 '} />}
						</Button>
					</div>
					<div className={'font-number w-full pt-1 text-center text-xxs text-neutral-400'}>
						<button
							suppressHydrationWarning
							onClick={(): void => onComputeValueFromAmount(balances?.[tokenToSend.address])}>
							{`You have ${formatAmount(balances?.[tokenToSend.address]?.normalized || 0, 2, 6)} ${tokenToSend.symbol}`}
						</button>
					</div>
				</div>
			</div>
			<ModalMessage
				isOpen={isModalOpen}
				set_isOpen={set_isModalOpen}
				message={attachedMessage}
				onCancel={(): void => {
					set_isModalOpen(false);
					set_attachedMessage('');
				}}
				onConfirm={(message: string): void => {
					set_isModalOpen(false);
					set_attachedMessage(message);
				}} />
		</div>
	);
}

export default SectionDonate;
