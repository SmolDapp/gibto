import React, {useState} from 'react';
import Image from 'next/image';
import IconEdit from 'components/icons/IconEdit';
import IconSave from 'components/icons/IconSave';
import IconSpinner from 'components/icons/IconSpinner';
import axios from 'axios';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {yToast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import DonationSection from './DonationSection';

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

function	IamDescription(props: TReceiverProps & {onCreated: VoidFunction}): ReactElement {
	const	{address, provider} = useWeb3();
	const	{toast} = yToast();
	const	[originalDescription, set_originalDescription] = useState(props.description);
	const	[description, set_description] = useState(props.description);
	const	[isSaving, set_isSaving] = useState(false);

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
			props.onCreated();
		} catch (err) {
			toast({type: 'error', content: (err as any)?.message || 'Impossible to create profile'});
		}
		set_isSaving(false);
	}

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

	function renderDescriptionEditor(): ReactElement {
		return (
			<div className={'relative mt-4 pl-0'}>
				<div className={'absolute -left-5 top-2.5 flex h-full flex-col space-y-4'}>
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
					rows={3}
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

	function renderCreationButton(): ReactElement {
		return (
			<div className={'mt-10 flex flex-col items-center justify-center space-y-4'}>
				<div className={'flex flex-col items-center justify-center space-y-4'}>
					<Button onClick={onCreate} isBusy={isSaving}>
						{'Create your profile'}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={'p-4'}>
			<div className={'flex flex-row items-center'}>
				<div className={'mr-4 h-12 w-12 rounded-2xl bg-neutral-200'}>
					<Image
						src={'https://images.unsplash.com/photo-1550165946-6c770414edb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80'}
						alt={'Profile picture'}
						className={'!h-12 !w-12 rounded-2xl object-cover'}
						width={600}
						height={600}
						unoptimized />
				</div>
				<h1 className={'text-3xl tracking-tight text-neutral-900 md:text-3xl'}>
					{`Gib to ${props.name}`}
				</h1>
			</div>
			{props.isCreated ? renderDescriptionEditor() : renderCreationButton()}
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
	const	[isCreated, set_isCreated] = useState(false);

	return (
		<>
			<div className={'relative h-[340px] w-full'}>
				<Image
					src={'/hero.jpg'}
					alt={'Hero image'}
					className={'absolute inset-0 -z-10 !h-[340px] !w-full object-cover'}
					width={6020}
					height={3384} />
				<section className={'z-10 mx-auto mb-20 grid w-full max-w-5xl'}>
					<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-10'}>
						<div className={'box-0 mt-6 grid grid-cols-2 gap-10 p-4'}>
							<IamDescription
								{...props}
								isCreated={isCreated}
								onCreated={(): void => set_isCreated(true)} />
							<div className={'font-number box-100 w-full space-y-4 p-4 text-xs md:text-sm'}>
								<span className={'flex flex-col justify-between'}>
									<b>{'Address:'}</b>
									<p className={'font-number'}>{props.address}</p>
								</span>
								<IamTwitter {...props} />
								<IamGithub {...props} />
							</div>
						</div>
					</div>
				</section>
			</div>

			<div className={'mx-auto mb-20 grid w-full max-w-5xl'}>
				<div className={'mt-6'}>
					<DonationSection />
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
		</>
	);
}

export default IamReceiver;
