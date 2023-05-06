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
				destination: 'https://github.com/SmolDapp/dumpservices',
				permanent: true
			}
		];
	},
	env: {
		JSON_RPC_URL: {
			1: 'https://eth.llamarpc.com' || process.env.RPC_URL_MAINNET,
			10: process.env.RPC_URL_OPTIMISM,
			250: 'https://rpc3.fantom.network' || process.env.RPC_URL_FANTOM,
			42161: process.env.RPC_URL_ARBITRUM
		},
		RECEIVER_ADDRESS: '0x10001192576E8079f12d6695b0948C2F41320040',
		DISPERSE_ADDRESS: '0xD152f549545093347A162Dce210e7293f1452150',
		TELEGRAM_BOT: process.env.TELEGRAM_BOT,
		TELEGRAM_CHAT: process.env.TELEGRAM_CHAT,
		BASE_API_URI: 'http://localhost:8080'
		// BASE_API_URI: 'https://api.docudroid.app'
	}
}));
