import React, {useEffect, useRef, useState} from 'react';
import IconEdit from 'components/icons/IconEdit';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
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
		set_isSaving(true);
		try {
			const signer = await provider.getSigner();
			const signature = await signer.signMessage(contentValue);
			const {data: profile} = await axios.put(`${process.env.BASE_API_URI}/profile/${toAddress(address)}`, {
				type: 'about',
				about: contentValue,
				address: toAddress(address),
				signature
			});
			console.log(profile);
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
		<div className={'mb-10'}>
			<div className={'flex flex-row items-center justify-between'}>
				<h2 className={'text-xl text-neutral-500'}>
					{'About'}
					<span>
						{isOwner && (
							<IconEdit
								onClick={onTryToFocus}
								className={'ml-2 inline-block h-4 w-4 cursor-pointer text-neutral-300 transition-colors hover:text-neutral-900'} />
						)}
					</span>
				</h2>
				<Button
					onClick={onSaveAbout}
					isBusy={isSaving}
					className={`!h-8 text-sm transition-opacity duration-300 ${(isOwner && props.about !== contentValue) ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
					{'Save'}
				</Button>
			</div>
			<div
				ref={aboutRef}
				contentEditable
				suppressContentEditableWarning
				className={'mt-4 space-y-2 whitespace-break-spaces text-sm text-neutral-400'}
				onInput={(e): void => set_contentValue(e.currentTarget.innerText)}>
				{props.about || 'No description provided'}
			</div>
		</div>
	);
}

export default SectionAbout;
