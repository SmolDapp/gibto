import React, {useEffect, useRef, useState} from 'react';
import IconEdit from 'components/icons/IconEdit';
import axios from 'axios';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	SectionAbout(props: TReceiverProps): ReactElement {
	const	{provider, address} = useWeb3();
	const	isOwner = toAddress(props.address) === toAddress(address);
	const	aboutRef = useRef<HTMLDivElement>(null);
	const	[contentValue, set_contentValue] = useState<string>(props.about);
	const	[isSaving, set_isSaving] = useState(false);
	const	{toast} = yToast();
	const	placeHolder = 'hmm, looks like there’s nothing here yet. how intriguing!';

	function onTryToFocus(): void {
		if (!aboutRef?.current) {
			return;
		}
		const range = document.createRange();
		range.selectNodeContents(aboutRef?.current);
		range.collapse(false);
		const selection = window.getSelection();
		if (!selection) {
			aboutRef?.current?.focus();
			return;
		}
		selection.removeAllRanges();
		selection.addRange(range);
	}

	function onHandlePaste(e: ClipboardEvent): void {
		e.preventDefault();
		const text = e?.clipboardData?.getData('text/plain');
		document.execCommand('insertHTML', true, text);
	}

	async function onSaveAbout(): Promise<void> {
		if (isSaving) {
			return;
		}
		set_isSaving(true);
		try {
			const signer = await provider.getSigner();
			const signature = await signer.signMessage(contentValue);
			await axios.put(`${process.env.BASE_API_URI}/profile/${toAddress(address)}`, {
				type: 'about',
				about: contentValue,
				address: toAddress(address),
				signature
			});
			toast({type: 'success', content: 'About section updated!'});
			props.mutate();
		} catch (e) {
			console.error(e);
			toast({type: 'error', content: (e as any)?.message || (e as any)?.response?.data?.message || 'Something went wrong!'});
		}
		set_isSaving(false);
	}

	useEffect((): VoidFunction => {
		const currentRef = aboutRef?.current;
		currentRef?.addEventListener('paste', onHandlePaste);
		return (): void => {
			currentRef?.removeEventListener('paste', onHandlePaste);
		};
	}, [aboutRef]);

	return (
		<div className={'mb-20'}>
			<div className={'flex flex-row items-center justify-between'}>
				<h2 id={'donate'} className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>
					{'Donate'}
				</h2>
				{isOwner && (
					<div className={'flex flex-row items-center justify-center space-x-4'}>
						<button
							type={'button'}
							onClick={onSaveAbout}
							className={`text-xs text-neutral-600 underline transition-opacity duration-300 hover:text-neutral-900 ${(isOwner && props.about !== contentValue) ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
							{'Save changes'}
						</button>
						<button onClick={onTryToFocus}>
							<IconEdit
								className={'transition-color h-4 w-4 text-neutral-400 hover:text-neutral-900'} />
						</button>
					</div>
				)}
			</div>
			<div
				ref={aboutRef}
				contentEditable={isOwner}
				suppressContentEditableWarning
				className={`-mt-4 space-y-2 whitespace-break-spaces py-4 text-sm text-neutral-400  ${contentValue === '' ? 'italic' : ''}`}
				onBlur={(): void => {
					if (isOwner && aboutRef?.current) {
						const contentValue = aboutRef.current.innerText;
						console.log(contentValue);
						if (contentValue === '') {
							aboutRef.current.innerText = placeHolder;
						}
					}
				}}
				onFocus={(): void => {
					if (isOwner && aboutRef?.current) {
						const contentValue = aboutRef?.current?.innerText;
						if (contentValue === placeHolder || contentValue === '') {
							aboutRef.current.innerText = '';
						}
					}
				}}
				onInput={(e): void => set_contentValue(e.currentTarget.innerText)}>
				{props.about || placeHolder}
			</div>
		</div>
	);
}

export default SectionAbout;
