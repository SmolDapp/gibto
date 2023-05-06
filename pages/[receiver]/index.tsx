import React from 'react';
import IAmReceiver from 'components/views/IAmReceiver';
import {isAddress} from 'ethers/lib/utils';
import lensProtocol from 'utils/lens.tools';
import axios from 'axios';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {GetServerSideProps, GetServerSidePropsResult} from 'next';
import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types';

function	Receiver(props: TReceiverProps): ReactElement {
	const	{address} = useWeb3();
	if (toAddress(address) === toAddress(props.address)) {
		return (<IAmReceiver {...props} />);
	}
	return (<IAmReceiver {...props} />);
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
		const	{data: creator} = await axios.get(`${process.env.BASE_API_URI}/profile/${toAddress(receiverAddress)}`);
		creator.name = receiverName;
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

	const	{data: creator} = await axios.get(`${process.env.BASE_API_URI}/profile/${toAddress(receiverAddress)}`);
	creator.name = receiverName;
	return {props: creator};
};

export default Receiver;

