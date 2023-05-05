import type {ReactElement} from 'react';

function Error({statusCode}: any): ReactElement {
	return (
		<p>
			{statusCode
				? `An error ${statusCode} occurred on server`
				: 'An error occurred on client'}
		</p>
	);
}

Error.getInitialProps = ({res, err}: any): any => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return {statusCode};
};

export default Error;
