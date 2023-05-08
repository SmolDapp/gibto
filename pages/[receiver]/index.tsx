import React from 'react';
import {NextSeo} from 'next-seo';
import Profile from 'components/views/Profile';
import {isAddress} from 'ethers/lib/utils';
import meta from 'public/manifest.json';
import lensProtocol from 'utils/lens.tools';
import axios from 'axios';
import useSWR from 'swr';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {GetServerSideProps, GetServerSidePropsResult} from 'next';
import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	Receiver(props: TReceiverProps): ReactElement {
	const {data, mutate} = useSWR<TReceiverProps>(
		`${process.env.BASE_API_URI}/profile/${toAddress(props.address)}`,
		baseFetcher, {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 0
		}
	);

	const	profile = {...(data || props), name: props.name};
	return (
		<>
			<NextSeo
				title={`Gib to ${props.name}`}
				defaultTitle={`Gib to ${props.name}`}
				description={`${props.description}`}
				openGraph={{
					title: `Gib to ${props.name}`,
					description: props.description,
					images: [
						{
							url: `https://gib.to/api/og?name=${props.name}`,
							width: 1920,
							height: 900,
							alt: props.name
						},
						{
							url: props.cover || meta.og,
							width: 1200,
							height: 675,
							alt: props.name
						}
					]
				}}
				twitter={{
					handle: props.twitter || meta.twitter,
					site: props.twitter || meta.twitter,
					cardType: 'summary_large_image'
				}} />
			<Profile
				{...profile}
				key={props.address}
				mutate={mutate} />
		</>
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
		const {data: creator} = await axios.get(`${process.env.BASE_API_URI}/quickprofile/${toAddress(receiverAddress)}`);
		const creatorName = (creator.ensHandle || creator.lensHandle).replace('.eth', '').replace('.lens', '');
		creator.name = creatorName || receiverName;
		return {props: creator};
	}
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

	if (!receiverAddress) {
		return {notFound: true};
	}

	const	{data: creator} = await axios.get(`${process.env.BASE_API_URI}/quickprofile/${toAddress(receiverAddress)}`);
	creator.name = receiverName;
	return {props: creator};
};

export default Receiver;

