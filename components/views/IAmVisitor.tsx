import Image from 'next/image';

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

function	Description(props: TReceiverProps): ReactElement {
	return (
		<div className={'p-4'}>
			<div className={'-ml-2 flex flex-row items-center'}>
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
			<p className={'mt-4 text-neutral-500'}>
				{props?.description || 'No description'}
			</p>
		</div>
	);
}

function	IAmVisitor(props: TReceiverProps): ReactElement {
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
							<Description {...props} />
							<div className={'font-number box-100 w-full space-y-4 p-4 text-xs md:text-sm'}>
								<span className={'flex flex-col justify-between'}>
									<b>{'Address:'}</b>
									<p className={'font-number'}>{props.address}</p>
								</span>
								<span className={'flex flex-col justify-between'}>
									<b>{'Twitter/Lenster:'}</b>
									<p className={'font-number'}>{props?.twitter || 'Not provided'}</p>
								</span>
								<span className={'flex flex-col justify-between'}>
									<b>{'Github:'}</b>
									<p className={'font-number'}>{props?.github || 'Not provided'}</p>
								</span>
							</div>
						</div>
					</div>
				</section>
			</div>
			<div className={'relative mx-auto mb-20 grid w-full max-w-5xl'}>

				{/* <div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
					<div className={'-ml-2 mt-4 flex flex-row items-center md:mt-6'}>
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
							{`Gib to ${props.name}`}
						</h1>
					</div>
					<div className={'mt-6 grid grid-cols-2 gap-10'}>
						<Description {...props} />
						<div className={'font-number w-full space-y-4 rounded-lg bg-neutral-100 p-4 text-xs md:text-sm'}>
							<span className={'flex flex-col justify-between'}>
								<b>{'Address:'}</b>
								<p className={'font-number'}>{props.address}</p>
							</span>
							<span className={'flex flex-col justify-between'}>
								<b>{'Twitter/Lenster:'}</b>
								<p className={'font-number'}>{props?.twitter || 'Not provided'}</p>
							</span>
							<span className={'flex flex-col justify-between'}>
								<b>{'Github:'}</b>
								<p className={'font-number'}>{props?.github || 'Not provided'}</p>
							</span>
						</div>
					</div>
				</div> */}

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

export default IAmVisitor;
