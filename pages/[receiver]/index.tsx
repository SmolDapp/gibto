import React, {useState} from 'react';
import Image from 'next/image';
import CardWithIcon from 'components/CardWithIcon';
import IconEdit from 'components/icons/IconEdit';
import IconSave from 'components/icons/IconSave';
import IconSpinner from 'components/icons/IconSpinner';
import Logo from 'components/icons/logo';
import {isAddress} from 'ethers/lib/utils';
import {load} from 'pages/api/db';
import lensProtocol from 'utils/lens.tools';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {GetServerSideProps, GetServerSidePropsResult} from 'next';
import type {ReactElement} from 'react';

type TReceiverProps = {
	address: string;
	name: string;
	description: string;
	about: string;
	github: string;
	twitter: string;
	isCreated: boolean;
}

function	IamDescription(props: TReceiverProps): ReactElement {
	const	{address, provider} = useWeb3();
	const	{toast} = yToast();
	const	[originalDescription, set_originalDescription] = useState(props.description);
	const	[description, set_description] = useState(props.description);
	const	[isSaving, set_isSaving] = useState(false);

	async function onUpdateDescription(): Promise<void> {
		set_isSaving(true);
		let	signature;
		try {
			const	signer = provider.getSigner();
			signature = await signer.signMessage(`I want to update my description to "${description}"`);
		} catch (err) {
			toast({type: 'error', content: (err as {message: string}).message});
			set_isSaving(false);
			return;
		}

		try {
			const result = await axios.post('/api/db', {
				action: 'EDIT_DESCRIPTION',
				address: toAddress(address),
				description: description,
				signature
			});
			if (result.data.error) {
				toast({type: 'error', content: result.data.error});
				set_isSaving(false);
				return;
			}
			toast({type: 'success', content: 'Description updated!'});
			set_originalDescription(result.data.description);
		} catch (err) {
			toast({type: 'error', content: (err as any)?.response?.data?.error || 'Impossible to update description'});
		}
		set_isSaving(false);
	}

	return (
		<div className={'relative mt-4'}>
			<div className={'absolute top-2 -left-7 flex h-full flex-col space-y-4 border-r-2 border-neutral-100 pr-2 pt-1'}>
				<label htmlFor={'description'}>
					<IconEdit
						className={'h-3 w-3 cursor-pointer text-neutral-400/80 transition-colors hover:text-neutral-900'} />
				</label>
				{isSaving ? (
					<IconSpinner className={'h-3 w-3 text-neutral-900'} />
				) : (
					<IconSave
						onClick={onUpdateDescription}
						className={`h-3 w-3 cursor-pointer transition-colors hover:text-neutral-900 ${description === originalDescription ? 'pointer-events-none text-neutral-0/0' : 'text-[#f97316]'}`} />
				)}
			</div>
			<textarea
				id={'description'}
				placeholder={'No description yet...'}
				value={description}
				rows={6}
				onChange={(e): void => {
					if (e.target.value.length > 255) {
						return;
					}
					set_description(e.target.value);
				}}
				className={'w-full resize-none border-none p-0 text-base italic leading-normal text-neutral-500 md:text-base md:leading-8'} />
		</div>
	);
}

function	IamTwitter(props: TReceiverProps): ReactElement {
	const	{address, provider} = useWeb3();
	const	{toast} = yToast();
	const	[originalTwitter, set_originalTwitter] = useState(props.twitter);
	const	[twitter, set_twitter] = useState(props.twitter);
	const	[isSaving, set_isSaving] = useState(false);

	async function onUpdateTwitter(): Promise<void> {
		set_isSaving(true);
		let	signature;
		try {
			const	signer = provider.getSigner();
			signature = await signer.signMessage(`I want to update my Twitter/Lenster to "${twitter}"`);
		} catch (err) {
			toast({type: 'error', content: (err as {message: string}).message});
			set_isSaving(false);
			return;
		}

		try {
			const result = await axios.post('/api/db', {
				action: 'EDIT_TWITTER',
				address: toAddress(address),
				twitter: twitter,
				signature
			});
			if (result.data.error) {
				toast({type: 'error', content: result.data.error});
				set_isSaving(false);
				return;
			}
			toast({type: 'success', content: 'Twitter/Lenster updated!'});
			set_originalTwitter(result.data.twitter);
		} catch (err) {
			toast({type: 'error', content: (err as any)?.response?.data?.error || 'Impossible to update Twitter/Lenster'});
		}
		set_isSaving(false);
	}

	return (
		<span className={'flex flex-col justify-between'}>
			<b>{'Twitter/Lenster:'}</b>
			<span className={'flex flex-row items-center space-x-2'}>
				<input
					id={'twitter'}
					placeholder={'https://twitter.com/...'}
					value={twitter}
					onChange={(e): void => {
						if (e.target.value.length > 255) {
							return;
						}
						set_twitter(e.target.value);
					}}
					className={'font-number w-full resize-none border-b border-dashed border-b-transparent bg-transparent py-0 pl-1 pr-0 hover:border-b-neutral-400'} />
				<div className={'flex flex-row space-x-4 '}>
					<label htmlFor={'twitter'}>
						<IconEdit
							className={'h-3 w-3 cursor-pointer text-neutral-400/80 transition-colors hover:text-neutral-900'} />
					</label>
					{isSaving ? (
						<IconSpinner className={'h-3 w-3 text-neutral-900'} />
					) : (
						<IconSave
							onClick={onUpdateTwitter}
							className={`h-3 w-3 cursor-pointer transition-colors hover:text-neutral-900 ${twitter === originalTwitter ? 'pointer-events-none text-neutral-0/0' : 'text-[#f97316]'}`} />
					)}
				</div>
			</span>
		</span>
	);
}

function	IamGithub(props: TReceiverProps): ReactElement {
	const	{address, provider} = useWeb3();
	const	{toast} = yToast();
	const	[originalGithub, set_originalGithub] = useState(props.github);
	const	[github, set_github] = useState(props.github);
	const	[isSaving, set_isSaving] = useState(false);

	async function onUpdateGithub(): Promise<void> {
		set_isSaving(true);
		let	signature;
		try {
			const	signer = provider.getSigner();
			signature = await signer.signMessage(`I want to update my Github to "${github}"`);
		} catch (err) {
			toast({type: 'error', content: (err as {message: string}).message});
			set_isSaving(false);
			return;
		}

		try {
			const result = await axios.post('/api/db', {
				action: 'EDIT_GITHUB',
				address: toAddress(address),
				github: github,
				signature
			});
			if (result.data.error) {
				toast({type: 'error', content: result.data.error});
				set_isSaving(false);
				return;
			}
			toast({type: 'success', content: 'Github updated!'});
			set_originalGithub(result.data.github);
		} catch (err) {
			toast({type: 'error', content: (err as any)?.response?.data?.error || 'Impossible to update Github'});
		}
		set_isSaving(false);
	}

	return (
		<span className={'flex flex-col justify-between'}>
			<b>{'Github:'}</b>
			<span className={'flex flex-row items-center space-x-2'}>
				<input
					id={'github'}
					placeholder={'https://github.com/...'}
					value={github}
					onChange={(e): void => {
						if (e.target.value.length > 255) {
							return;
						}
						set_github(e.target.value);
					}}
					className={'font-number w-full resize-none border-b border-dashed border-b-transparent bg-transparent py-0 pl-1 pr-0 hover:border-b-neutral-400'} />
				<div className={'flex flex-row space-x-4 '}>
					<label htmlFor={'github'}>
						<IconEdit
							className={'h-3 w-3 cursor-pointer text-neutral-400/80 transition-colors hover:text-neutral-900'} />
					</label>
					{isSaving ? (
						<IconSpinner className={'h-3 w-3 text-neutral-900'} />
					) : (
						<IconSave
							onClick={onUpdateGithub}
							className={`h-3 w-3 cursor-pointer transition-colors hover:text-neutral-900 ${github === originalGithub ? 'pointer-events-none text-neutral-0/0' : 'text-[#f97316]'}`} />
					)}
				</div>
			</span>
		</span>
	);
}

function	IamReceiver(props: TReceiverProps): ReactElement {
	const	{address, provider} = useWeb3();
	const	{toast} = yToast();
	const	[isSaving, set_isSaving] = useState(false);
	const	[isCreated, set_isCreated] = useState(props.isCreated);

	async function onCreate(): Promise<void> {
		set_isSaving(true);
		let	signature;
		try {
			const	signer = provider.getSigner();
			signature = await signer.signMessage('gib to me pls');
		} catch (err) {
			toast({type: 'error', content: (err as {message: string}).message});
			set_isSaving(false);
			return;
		}

		try {
			const result = await axios.post('/api/db', {
				action: 'CREATE_CREATOR',
				address: toAddress(address),
				signature
			});
			if (result.data.error) {
				toast({type: 'error', content: result.data.error});
				set_isSaving(false);
				return;
			}
			toast({type: 'success', content: 'Profile created!'});
			set_isCreated(true);
		} catch (err) {
			toast({type: 'error', content: (err as any)?.message || 'Impossible to create profile'});
		}
		set_isSaving(false);
	}

	function	renderNotCreated(): ReactElement {
		return (
			<div className={'mt-10 flex flex-col items-center justify-center space-y-4'}>
				<div className={'flex flex-col items-center justify-center space-y-4'}>
					<Logo className={'h-20 w-20 text-neutral-400'} />
					<span className={'text-lg font-bold text-neutral-900'}>{'Your profile is not created yet'}</span>
					<Button onClick={onCreate} isBusy={isSaving}>
						{'Create your profile'}
					</Button>
				</div>
			</div>
		);
	}
	return (
		<div className={'mx-auto mb-20 grid w-full max-w-5xl'}>
			<div className={'mt-6 mb-10 flex flex-col justify-center md:mt-20'}>
				<div className={'mt-4 -ml-2 flex flex-row items-center md:mt-6'}>
					<div className={'mr-4 h-14 w-14 rounded-full bg-neutral-200'}>
						<Image
							src={'https://images.unsplash.com/photo-1550165946-6c770414edb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80'}
							alt={'Profile picture'}
							className={'!h-14 !w-14 rounded-full object-cover'}
							width={600}
							height={600}
							unoptimized
						/>
					</div>
					<h1 className={'text-3xl tracking-tight text-neutral-900 md:text-5xl'}>
						{`Hello ${props.name}`}
					</h1>
				</div>
				{isCreated ? (
					<div className={'mt-6 grid grid-cols-2 gap-10'}>
						<IamDescription {...props} />
						<div className={'font-number w-full space-y-4 rounded-lg bg-neutral-100 p-4 text-xs md:text-sm'}>
							<span className={'flex flex-col justify-between'}>
								<b>{'Address:'}</b>
								<p className={'font-number'}>{props.address}</p>
							</span>
							<IamTwitter {...props} />
							<IamGithub {...props} />
						</div>
					</div>
				) : renderNotCreated()}
			</div>

			<div className={'mt-10'}>
				<h2 className={'text-xl text-neutral-500'}>
					{'Donations'}
				</h2>
				<div className={'mt-2 border-t border-neutral-200 pt-6'}>
					<div className={'relative grid grid-cols-1 gap-10 md:grid-cols-3'}>
						<CardWithIcon
							isSelected={false}
							icon={(
								<svg
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 576 512'}
									className={'h-6 w-6'}>
									<path d={'M162.4 306.8c11.1 13.4 24.1 26.8 38.7 39.2c35.5 30 81.4 54 134.8 54s99.3-24 134.8-54c35.5-30 60.8-66 73.2-90c-12.4-24-37.6-60-73.2-90c-35.5-30-81.4-54-134.8-54s-99.3 24-134.8 54c-14.6 12.4-27.6 25.8-38.7 39.2L145.1 226l-23.4-13.6L32 160l45.8 80.1L86.9 256l-9.1 15.9L32 352l89.7-52.3L145.1 286l17.3 20.8zM4.2 336.1L50 256 4.2 175.9c-7.2-12.6-5-28.4 5.3-38.6s26.1-12.2 38.7-4.9l89.7 52.3c12.2-14.6 26.5-29.4 42.7-43.1C219.7 108.5 272.6 80 336 80s116.3 28.5 155.5 61.5c39.1 33 66.9 72.4 81 99.8c4.7 9.2 4.7 20.1 0 29.3c-14.1 27.4-41.9 66.8-81 99.8C452.3 403.5 399.4 432 336 432s-116.3-28.5-155.5-61.5c-16.2-13.7-30.5-28.5-42.7-43.1L48.1 379.6c-12.5 7.3-28.4 5.3-38.7-4.9S-3 348.7 4.2 336.1zM416 232a24 24 0 1 1 0 48 24 24 0 1 1 0-48z'} fill={'currentcolor'}/>
								</svg>
							)}
							label={'$1.00'}
							onClick={(): void => undefined} />
						<CardWithIcon
							isSelected={false}
							icon={(
								<svg
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 512 512'}
									className={'h-6 w-6'}>
									<path d={'M176 32h49.1c40.5 0 78.7 9.4 112.7 26.2c4 2 8.5 2.2 12.7 .7c32.4-12.1 73.2-24.6 105.2-26.6c-.8 3.3-2.2 7.6-4.2 13c-7.2 18.6-20.2 42.3-31.2 61.1c-3.4 5.8-2.8 13.1 1.5 18.3C458.1 168.8 480 225.2 480 286.9c0 54.4-33.6 100.9-81.2 119.9C409.7 391.3 416 372.4 416 352c0-46.5-33-85.2-76.8-94.1c-4.7-1-9.6 .3-13.3 3.3s-5.9 7.6-5.9 12.4V325c0 6.1-4.9 11-11 11c-2.9 0-5.6-1.1-7.7-3.1l-73.8-72.3c-3-2.9-7-4.6-11.2-4.6H216 176 50.2c-10 0-18.2-8.1-18.2-18.2c0-6.5 3.4-12.4 9-15.7l25.1-14.6c6.9-4.1 9.8-12.6 6.7-20c-5.6-13.4-8.8-28-8.8-43.5C64 82.1 114.1 32 176 32zm280.6-6.3a.1 .1 0 1 0 -.2 .1 .1 .1 0 1 0 .2-.1zM320 416H281.9l-1-2.1C261.9 376 223.1 352 180.7 352H176c-5.5 0-10.7 2.9-13.6 7.6s-3.2 10.6-.7 15.6L190.1 432l-28.4 56.8c-2.5 5-2.2 10.9 .7 15.6s8.1 7.6 13.6 7.6h4.7c42.4 0 81.2-24 100.2-61.9l1-2.1H320h30.9c89 0 161.1-72.1 161.1-161.1c0-65.3-21.8-125.6-58.6-173.8c10-17.5 21-38.4 27.9-56.2c3.9-10.2 7.4-21.4 7.3-30.9c0-4.8-1-11.5-5.6-17.3C477.9 2.3 470.6 0 464 0c-37 0-83.5 13.9-118.3 26.5C309 9.5 268.2 0 225.1 0H176C96.5 0 32 64.5 32 144c0 14.8 2.2 29.1 6.4 42.6l-13.5 7.9C9.5 203.5 0 220 0 237.8C0 265.5 22.5 288 50.2 288H176h33.8l69.1 67.7c8 7.9 18.8 12.3 30.1 12.3c23.7 0 43-19.2 43-43V296.6c19.1 11.1 32 31.8 32 55.4c0 35.3-28.7 64-64 64zM203.6 387.3c20.9 6.2 38.6 20.8 48.7 40.9l1.9 3.8-1.9 3.8c-10 20.1-27.8 34.7-48.7 40.9l18.8-37.5c2.3-4.5 2.3-9.8 0-14.3l-18.8-37.5zM152 176a24 24 0 1 0 0-48 24 24 0 1 0 0 48z'} fill={'currentcolor'}/>
								</svg>
							)}
							label={'$10.00'}
							onClick={(): void => undefined} />
						<CardWithIcon
							isSelected={false}
							icon={(
								<svg
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 640 512'}
									className={'h-6 w-6'}>
									<path d={'M164.9 .8c5.7 1.8 9.9 6.7 10.9 12.6l14.1 84.7 84.7 14.1c5.9 1 10.8 5.2 12.6 10.9s.3 12-3.9 16.2L242.6 180c-18.3 18.3-44.2 26.6-69.7 22.3L111 192 70.8 250.4c-9.2 13.3-10.4 30.6-3.1 45c7.5 15.1 22.9 24.6 39.7 24.6h3.2c11.3 0 22.2-3.8 31-10.9L270.9 205.7C333.8 155.4 411.8 128 492.3 128C573.9 128 640 194.1 640 275.7V384c0 53-43 96-96 96H162.4C72.7 480 0 407.3 0 317.6c0-39.5 15.7-77.3 43.6-105.2l46.5-46.5 3.4-3.4-7.9-47.4C81.4 89.6 89.7 63.7 108 45.4L148.7 4.7c4.2-4.2 10.5-5.8 16.2-3.9zM149.3 49.3L130.6 68c-11 11-16 26.5-13.4 41.8l8.7 52.2 52.2 8.7c15.3 2.5 30.9-2.4 41.8-13.4l18.7-18.7-65.3-10.9c-6.7-1.1-12-6.4-13.2-13.2L149.3 49.3zM368 296a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm-334.1 .5c-1.3 6.9-1.9 14-1.9 21.2C32 389.6 90.4 448 162.4 448H544c35.3 0 64-28.7 64-64V275.7C608 211.8 556.2 160 492.3 160c-73.2 0-144.2 24.9-201.4 70.7L161.6 334.1c-14.5 11.6-32.4 17.9-50.9 17.9h-3.2c-28.9 0-55.4-16.4-68.4-42.2c-2.2-4.3-3.9-8.8-5.2-13.3z'} fill={'currentcolor'}/>
								</svg>
							)}
							label={'$50.00'}
							onClick={(): void => undefined} />

					</div>
				</div>
			</div>

			<div className={'mt-20'}>
				<h2 className={'text-xl text-neutral-500'}>
					{'About'}
				</h2>
				<div className={'mt-4 space-y-2 text-sm text-neutral-400'}>
					<p>
						{'Meet Chuchu, a talented coder and feline enthusiast who has dedicated their career to combining their two passions. With a background in computer science and a deep love for cats, Chuchu has spent years honing their coding skills to create unique and innovative projects that celebrate all things feline.'}
					</p>

					<p>
						{"One of Chuchu's most notable projects is an interactive website that allows users to explore different breeds of cats in a fun and engaging way. The website features beautiful illustrations of each breed, along with detailed descriptions of their characteristics and history. Users can also interact with the cats on the site, playing games and solving puzzles to learn more about their favorite breeds."}
					</p>

					<p>
						{'In addition to their website, Chuchu has also created a variety of mobile apps that feature adorable cat animations and games. One of their most popular apps is a virtual pet game where users can adopt and care for their own digital cat. The app has received rave reviews from cat lovers around the world, who appreciate the attention to detail and realistic behavior of the virtual cats.'}
					</p>

					<p>
						{"Through their work, Chuchu has shown that coding and creativity can go hand in hand. Their passion for cats has inspired them to push the boundaries of what is possible in the world of software development, creating projects that are both fun and functional. Whether you're a cat lover or a coding enthusiast, Chuchu's work is sure to impress and inspire."}
					</p>

				</div>
			</div>
		</div>
	);
}

function	Receiver(props: TReceiverProps): ReactElement {
	const	{address} = useWeb3();
	if (toAddress(address) === toAddress(props.address)) {
		return (
			<IamReceiver {...props} />
		);
	}

	return (
		<div className={'mx-auto grid w-full max-w-5xl'}>
			<div className={'mt-6 mb-10 flex flex-col justify-center md:mt-20'}>
				<h1 className={'mt-4 -ml-1 text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
					{`Gib to ${props.name}`}
				</h1>
				<p className={'mt-4 w-full text-base italic leading-normal text-neutral-500 md:w-3/4 md:text-base md:leading-8'}>
					{'Help me bring joy to Chuchu! With your support, I can create meaningful and impactful work that inspires change. Join me on this journey and be a part of something bigger. #SponsorMyDreams #UnrestrictedCreativity'}
				</p>
				<div className={'font-number mt-6 w-2/3 space-y-2 rounded-lg bg-neutral-100 p-4 text-xs md:text-sm'}>
					<span className={'flex flex-col justify-between md:flex-row'}>
						<b>{'Address:'}</b>
						<p className={'font-number'}>{props.address}</p>
					</span>
					<span className={'flex flex-col justify-between md:flex-row'}>
						<b>{'Goal:'}</b>
						<p className={'font-number'}>{`${132}/234`}</p>
					</span>
				</div>
			</div>

			<div>
				<div className={'relative grid grid-cols-1 gap-10 md:grid-cols-3'}>
					<CardWithIcon
						isSelected={false}
						icon={(
							<svg
								xmlns={'http://www.w3.org/2000/svg'}
								viewBox={'0 0 576 512'}
								className={'h-6 w-6'}>
								<path d={'M162.4 306.8c11.1 13.4 24.1 26.8 38.7 39.2c35.5 30 81.4 54 134.8 54s99.3-24 134.8-54c35.5-30 60.8-66 73.2-90c-12.4-24-37.6-60-73.2-90c-35.5-30-81.4-54-134.8-54s-99.3 24-134.8 54c-14.6 12.4-27.6 25.8-38.7 39.2L145.1 226l-23.4-13.6L32 160l45.8 80.1L86.9 256l-9.1 15.9L32 352l89.7-52.3L145.1 286l17.3 20.8zM4.2 336.1L50 256 4.2 175.9c-7.2-12.6-5-28.4 5.3-38.6s26.1-12.2 38.7-4.9l89.7 52.3c12.2-14.6 26.5-29.4 42.7-43.1C219.7 108.5 272.6 80 336 80s116.3 28.5 155.5 61.5c39.1 33 66.9 72.4 81 99.8c4.7 9.2 4.7 20.1 0 29.3c-14.1 27.4-41.9 66.8-81 99.8C452.3 403.5 399.4 432 336 432s-116.3-28.5-155.5-61.5c-16.2-13.7-30.5-28.5-42.7-43.1L48.1 379.6c-12.5 7.3-28.4 5.3-38.7-4.9S-3 348.7 4.2 336.1zM416 232a24 24 0 1 1 0 48 24 24 0 1 1 0-48z'} fill={'currentcolor'}/>
							</svg>
						)}
						label={'$1.00'}
						onClick={(): void => undefined} />
					<CardWithIcon
						isSelected={false}
						icon={(
							<svg
								xmlns={'http://www.w3.org/2000/svg'}
								viewBox={'0 0 512 512'}
								className={'h-6 w-6'}>
								<path d={'M176 32h49.1c40.5 0 78.7 9.4 112.7 26.2c4 2 8.5 2.2 12.7 .7c32.4-12.1 73.2-24.6 105.2-26.6c-.8 3.3-2.2 7.6-4.2 13c-7.2 18.6-20.2 42.3-31.2 61.1c-3.4 5.8-2.8 13.1 1.5 18.3C458.1 168.8 480 225.2 480 286.9c0 54.4-33.6 100.9-81.2 119.9C409.7 391.3 416 372.4 416 352c0-46.5-33-85.2-76.8-94.1c-4.7-1-9.6 .3-13.3 3.3s-5.9 7.6-5.9 12.4V325c0 6.1-4.9 11-11 11c-2.9 0-5.6-1.1-7.7-3.1l-73.8-72.3c-3-2.9-7-4.6-11.2-4.6H216 176 50.2c-10 0-18.2-8.1-18.2-18.2c0-6.5 3.4-12.4 9-15.7l25.1-14.6c6.9-4.1 9.8-12.6 6.7-20c-5.6-13.4-8.8-28-8.8-43.5C64 82.1 114.1 32 176 32zm280.6-6.3a.1 .1 0 1 0 -.2 .1 .1 .1 0 1 0 .2-.1zM320 416H281.9l-1-2.1C261.9 376 223.1 352 180.7 352H176c-5.5 0-10.7 2.9-13.6 7.6s-3.2 10.6-.7 15.6L190.1 432l-28.4 56.8c-2.5 5-2.2 10.9 .7 15.6s8.1 7.6 13.6 7.6h4.7c42.4 0 81.2-24 100.2-61.9l1-2.1H320h30.9c89 0 161.1-72.1 161.1-161.1c0-65.3-21.8-125.6-58.6-173.8c10-17.5 21-38.4 27.9-56.2c3.9-10.2 7.4-21.4 7.3-30.9c0-4.8-1-11.5-5.6-17.3C477.9 2.3 470.6 0 464 0c-37 0-83.5 13.9-118.3 26.5C309 9.5 268.2 0 225.1 0H176C96.5 0 32 64.5 32 144c0 14.8 2.2 29.1 6.4 42.6l-13.5 7.9C9.5 203.5 0 220 0 237.8C0 265.5 22.5 288 50.2 288H176h33.8l69.1 67.7c8 7.9 18.8 12.3 30.1 12.3c23.7 0 43-19.2 43-43V296.6c19.1 11.1 32 31.8 32 55.4c0 35.3-28.7 64-64 64zM203.6 387.3c20.9 6.2 38.6 20.8 48.7 40.9l1.9 3.8-1.9 3.8c-10 20.1-27.8 34.7-48.7 40.9l18.8-37.5c2.3-4.5 2.3-9.8 0-14.3l-18.8-37.5zM152 176a24 24 0 1 0 0-48 24 24 0 1 0 0 48z'} fill={'currentcolor'}/>
							</svg>
						)}
						label={'$10.00'}
						onClick={(): void => undefined} />
					<CardWithIcon
						isSelected={false}
						icon={(
							<svg
								xmlns={'http://www.w3.org/2000/svg'}
								viewBox={'0 0 640 512'}
								className={'h-6 w-6'}>
								<path d={'M164.9 .8c5.7 1.8 9.9 6.7 10.9 12.6l14.1 84.7 84.7 14.1c5.9 1 10.8 5.2 12.6 10.9s.3 12-3.9 16.2L242.6 180c-18.3 18.3-44.2 26.6-69.7 22.3L111 192 70.8 250.4c-9.2 13.3-10.4 30.6-3.1 45c7.5 15.1 22.9 24.6 39.7 24.6h3.2c11.3 0 22.2-3.8 31-10.9L270.9 205.7C333.8 155.4 411.8 128 492.3 128C573.9 128 640 194.1 640 275.7V384c0 53-43 96-96 96H162.4C72.7 480 0 407.3 0 317.6c0-39.5 15.7-77.3 43.6-105.2l46.5-46.5 3.4-3.4-7.9-47.4C81.4 89.6 89.7 63.7 108 45.4L148.7 4.7c4.2-4.2 10.5-5.8 16.2-3.9zM149.3 49.3L130.6 68c-11 11-16 26.5-13.4 41.8l8.7 52.2 52.2 8.7c15.3 2.5 30.9-2.4 41.8-13.4l18.7-18.7-65.3-10.9c-6.7-1.1-12-6.4-13.2-13.2L149.3 49.3zM368 296a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm-334.1 .5c-1.3 6.9-1.9 14-1.9 21.2C32 389.6 90.4 448 162.4 448H544c35.3 0 64-28.7 64-64V275.7C608 211.8 556.2 160 492.3 160c-73.2 0-144.2 24.9-201.4 70.7L161.6 334.1c-14.5 11.6-32.4 17.9-50.9 17.9h-3.2c-28.9 0-55.4-16.4-68.4-42.2c-2.2-4.3-3.9-8.8-5.2-13.3z'} fill={'currentcolor'}/>
							</svg>
						)}
						label={'$50.00'}
						onClick={(): void => undefined} />

				</div>
			</div>

		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<GetServerSidePropsResult<TReceiverProps>> => {
	const {receiver} = context.query;
	if (!receiver) {
		return {notFound: true};
	}
	let receiverAddress = '';
	let receiverName = '';
	let	receiverStr = receiver.toString();
	if (receiverStr.startsWith('0x')) {
		if (isAddress(receiverStr)) {
			receiverAddress = toAddress(receiverStr);
			receiverName = truncateHex(toAddress(receiverStr), 6);
		}
	} else {
		if (receiverStr.endsWith('.eth')) {
			receiverStr = receiverStr.slice(0, -4);
			const	addressViaENS = await getProvider(1).resolveName(`${receiverStr}.eth`);
			if (addressViaENS) {
				if (isAddress(addressViaENS)) {
					receiverAddress = toAddress(addressViaENS);
					receiverName = receiverStr;
				}
			}
		} else if (receiverStr.endsWith('.lens')) {
			receiverStr = receiverStr.slice(0, -5);
			const	addressViaLens = await lensProtocol.getAddressFromHandle(`${receiverStr}.lens`);
			if (addressViaLens) {
				if (isAddress(addressViaLens)) {
					receiverAddress = toAddress(addressViaLens);
					receiverName = receiverStr;
				}
			}
		} else {
			const	addressViaENS = await getProvider(1).resolveName(`${receiverStr}.eth`);
			if (addressViaENS) {
				if (isAddress(addressViaENS)) {
					receiverAddress = toAddress(addressViaENS);
					receiverName = receiverStr;
				}
			}
		}
	}

	if (!receiverAddress) {
		return {notFound: true};
	}
	const	creator = await load('LOAD_CREATOR', toAddress(receiverAddress));
	return {
		props: {
			address: toAddress(receiverAddress),
			name: receiverName,
			isCreated: !!creator,
			description: creator?.description || '',
			twitter: creator?.twitter || '',
			github: creator?.github || '',
			about: ''
		}
	};

};

export default Receiver;

