import React from 'react';
import CardWithIcon from 'components/CardWithIcon';
import {isAddress} from 'ethers/lib/utils';
import lensProtocol from 'utils/lens.tools';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {GetServerSideProps, GetServerSidePropsResult} from 'next';
import type {ReactElement} from 'react';

type TReceiverProps = {
	address: string;
	name: string;
}

function	Receiver(props: TReceiverProps): ReactElement {
	console.log(props);
	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
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
	let	receiverStr = receiver.toString();
	if (receiverStr.startsWith('0x')) {
		//check if address is valid
		if (isAddress(receiverStr)) {
			return {
				props: {
					address: toAddress(receiverStr),
					name: truncateHex(toAddress(receiverStr), 6)
				}
			};
		}
	} else {
		if (receiverStr.endsWith('.eth')) {
			receiverStr = receiverStr.slice(0, -4);
		}
		if (receiverStr.endsWith('.lens')) {
			receiverStr = receiverStr.slice(0, -5);
		}

		const	addressViaENA = await getProvider(1).resolveName(`${receiverStr}.eth`);
		if (addressViaENA) {
			if (isAddress(addressViaENA)) {
				return {
					props: {
						address: toAddress(addressViaENA),
						name: receiverStr
					}
				};
			}
		}

		const	addressViaLens = await lensProtocol.getAddressFromHandle(`${receiverStr}.lens`);
		if (addressViaLens) {
			if (isAddress(addressViaLens)) {
				return {
					props: {
						address: toAddress(addressViaENA),
						name: receiverStr
					}
				};
			}
		}
	}

	return {notFound: true};

};

export default Receiver;

