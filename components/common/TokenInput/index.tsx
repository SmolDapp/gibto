import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import IconCircleCross from 'components/icons/IconCircleCross';
import {useWallet} from 'contexts/useWallet';
import handleInputChangeEventValue from 'utils/handleInputChangeEventValue';
import {useAnimate} from 'framer-motion';
import {useClickOutside} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import {MultipleTokenSelector, UniqueTokenSelector} from './TokenSelector';

import type {ChangeEvent, ReactElement} from 'react';
import type {TToken} from 'utils/types/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

type TViewFromToken = {
	token: TToken | undefined;
	value: TNormalizedBN | undefined;
	onChange: (value: TNormalizedBN) => void;
	placeholder?: string;
	tokens?: TToken[];
	onChangeToken?: (token: TToken, tokenBalance: TNormalizedBN | undefined) => void;
	shouldCheckBalance?: boolean;
	isDisabled?: boolean;
	index?: number;
};
function TokenInput({
	token,
	value,
	onChange,
	tokens,
	onChangeToken,
	placeholder,
	shouldCheckBalance = true,
	isDisabled = false,
	index
}: TViewFromToken): ReactElement {
	const [scope, animate] = useAnimate();
	const inputRef = useRef<HTMLInputElement>(null);
	const {getBalance} = useWallet();

	const balanceOf = useMemo((): TNormalizedBN => {
		return getBalance(toAddress(token?.address));
	}, [getBalance, token?.address]);

	const onChangeAmount = useCallback(
		(e: ChangeEvent<HTMLInputElement>): void => {
			const element = document.getElementById('amountToSend') as HTMLInputElement;
			const newAmount = handleInputChangeEventValue(e, token?.decimals || 18);
			if (newAmount.raw > balanceOf?.raw) {
				if (element?.value) {
					element.value = formatAmount(balanceOf?.normalized, 0, 18);
				}
				return onChange(toNormalizedBN(balanceOf?.raw || 0, token?.decimals || 18));
			}
			onChange(newAmount);
		},
		[balanceOf, onChange, token?.decimals]
	);

	useEffect((): void => {
		animate('button', {opacity: 0, x: 112, pointerEvents: 'none'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 48}, {duration: 0.3});
	}, [animate]);

	useClickOutside(inputRef, (): void => {
		animate('button', {opacity: 0, x: 112, pointerEvents: 'none'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 48}, {duration: 0.3});
	});

	const onFocus = useCallback((): void => {
		animate('button', {opacity: 1, x: 0, pointerEvents: 'auto'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 0}, {duration: 0.3});
	}, [animate]);

	return (
		<div className={'flex w-full gap-4'}>
			<div className={'flex w-full'}>
				{tokens && tokens?.length > 0 ? (
					<MultipleTokenSelector
						token={token}
						tokens={tokens}
						onChangeToken={onChangeToken}
					/>
				) : (
					<UniqueTokenSelector token={token} />
				)}
			</div>
			<label className={'flex h-[48px] w-full'}>
				<div
					ref={inputRef}
					className={cl('smol--input-wrapper h-[48px]', isDisabled ? 'bg-neutral-200' : 'bg-neutral-0')}>
					<input
						suppressHydrationWarning
						className={'smol--input font-mono'}
						placeholder={
							placeholder ||
							`${formatAmount(balanceOf.normalized, 6, token?.decimals || 18)} ${token?.symbol || ''}`
						}
						type={'number'}
						min={0}
						maxLength={20}
						max={balanceOf?.normalized || 0}
						step={1 / 10 ** (token?.decimals || 18)}
						inputMode={'numeric'}
						disabled={isDisabled}
						pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
						value={value ? value.normalized : ''}
						onChange={onChangeAmount}
						onFocus={onFocus}
					/>
					<div
						ref={scope}
						className={'ml-2 flex flex-row items-center space-x-2'}>
						<span
							className={'relative block h-4 w-4'}
							style={{zIndex: index}}>
							{shouldCheckBalance && (
								<IconCircleCross
									style={{
										opacity: toBigInt(value?.raw) > balanceOf.raw ? 1 : 0,
										pointerEvents: toBigInt(value?.raw) > balanceOf.raw ? 'auto' : 'none'
									}}
									className={'text-red-600 absolute inset-0 h-4 w-4 transition-opacity'}
								/>
							)}
						</span>
						<button
							type={'button'}
							tabIndex={-1}
							onClick={(): void => onChange(balanceOf)}
							className={cl(
								'px-2 py-1 text-xs rounded-md border border-neutral-900 transition-colors bg-neutral-900 text-neutral-0',
								'opacity-0 pointer-events-none'
							)}>
							{'Max'}
						</button>
					</div>
				</div>
			</label>
		</div>
	);
}

export default TokenInput;
