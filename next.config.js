/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV !== 'production'
});
const withTM = require('next-transpile-modules')(['@yearn-finance/web-lib'], {resolveSymlinks: false});
const {PHASE_EXPORT} = require('next/constants');

module.exports = (phase) => withTM(withPWA({
	assetPrefix: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT ? './' : '/',
	images: {
		unoptimized: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT,
		domains: [
			'raw.githubusercontent.com',
			'assets.smold.app'
		]
	},
	async rewrites() {
		return [
			{
				source: '/js/script.js',
				destination: 'https://plausible.io/js/script.js'
			},
			{
				source: '/api/event',
				destination: 'https://plausible.io/api/event'
			}
		];
	},
	redirects() {
		return [
			{
				source: '/github',
				destination: 'https://github.com/SmolDapp/gibto',
				permanent: true
			},
			{
				source: '/favicon.ico',
				destination: 'https://gib.to/favicons/favicon.ico',
				permanent: true
			}
		];
	},
	env: {
		JSON_RPC_URL: {
			1: process.env.RPC_URL_MAINNET,
			5: process.env.RPC_URL_GOERLI,
			10: process.env.RPC_URL_OPTIMISM,
			56: process.env.RPC_URL_BINANCE,
			97: process.env.RPC_URL_BINANCE_TESTNET,
			137: process.env.RPC_URL_POLYGON,
			250: process.env.RPC_URL_FANTOM,
			420: process.env.RPC_URL_OPTIMISM_GOERLI,
			8453: process.env.RPC_URL_BASE,
			80001: process.env.RPC_URL_POLYGON_TESTNET,
			42161: process.env.RPC_URL_ARBITRUM,
			11155111: process.env.RPC_URL_SEPOLIA
		},
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
		OPENSEA_API_KEY: process.env.OPENSEA_API_KEY,
		SMOL_ASSETS_URL: 'https://assets.smold.app/api',

		TELEGRAM_BOT: process.env.TELEGRAM_BOT,
		TELEGRAM_CHAT: process.env.TELEGRAM_CHAT,
		// BASE_API_URI: 'http://localhost:8080'
		BASE_API_URI: 'https://api.gib.to',

		// Wallet Connect modal configuration
		WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
		WALLETCONNECT_PROJECT_NAME: 'Smol',
		WALLETCONNECT_PROJECT_DESCRIPTION:
			'Simple, smart and elegant dapps, designed to make your crypto journey a little bit easier.',
		WALLETCONNECT_PROJECT_URL: 'https://smold.app',
		WALLETCONNECT_PROJECT_ICON: 'https://smold.app/favicons/ms-icon-310x310.png'
	}
}));
