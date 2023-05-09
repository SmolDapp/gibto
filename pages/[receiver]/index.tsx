import React from 'react';
import {NextSeo} from 'next-seo';
import Profile from 'components/views/Profile';
import meta from 'public/manifest.json';
import axios from 'axios';
import useSWR from 'swr';
import useWeb3 from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import type {GetServerSideProps, GetServerSidePropsResult} from 'next';
import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	Receiver(props: TReceiverProps): ReactElement {
	const {address} = useWeb3();
	const {data, mutate} = useSWR<TReceiverProps>(
		`${process.env.BASE_API_URI}/profile/${toAddress(props.address)}`,
		baseFetcher, {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 0
		}
	);

	const	profile = {...(data || props)};
	const	todayMidnightAsTimestamp = new Date().setHours(0, 0, 0, 0).valueOf();
	return (
		<>
			<NextSeo
				title={`Gib to ${profile.name}`}
				defaultTitle={`Gib to ${profile.name}`}
				description={`${profile.description}`}
				openGraph={{
					title: `Gib to ${profile.name}`,
					description: profile.description,
					images: [{url: `https://gib.to/api/og?name=${profile.name}&time=${todayMidnightAsTimestamp}`, width: 1920, height: 900, alt: profile.name}]
				}}
				twitter={{
					handle: profile.twitter || meta.twitter,
					site: profile.twitter || meta.twitter,
					cardType: 'summary_large_image'
				}} />
			<Profile
				{...profile}
				isOwner={toAddress(address) == toAddress(profile.address)}
				key={profile.address}
				mutate={mutate} />
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<GetServerSidePropsResult<TReceiverProps>> => {
	const {receiver} = context.query;
	const {data: creator} = await axios.get(`${process.env.BASE_API_URI}/quickprofile/${receiver}`);
	return {props: creator};
};

export default Receiver;

