import React from 'react';
import {Inter} from 'next/font/google';
import AppWrapper from 'components/common/AppWrapper';
import {TokenListContextApp} from 'contexts/useTokenList';
import {WalletContextApp} from 'contexts/useWallet';
import {WithYearn} from 'contexts/WithYearn';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import	'../style.css';

const inter = Inter({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--inter-font'
});

function	MyApp(props: AppProps): ReactElement {
	return (
		<>
			<style jsx global>{`html {font-family: ${inter.style.fontFamily};}`}</style>
			<WithYearn
				options={{
					web3: {
						supportedChainID: [1, 10, 56, 100, 137, 250, 42161]
					}
				}}>
				<TokenListContextApp>
					<WalletContextApp>
						<main className={`flex h-screen flex-col ${inter.variable}`}>
							<AppWrapper {...props} />
						</main>
					</WalletContextApp>
				</TokenListContextApp>
			</WithYearn>
		</>
	);
}

export default MyApp;
