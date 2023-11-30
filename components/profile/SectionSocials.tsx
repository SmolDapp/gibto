import React, {Fragment} from 'react';
import SocialMediaCard from 'components/common/SocialMediaCard';
import IconSocialReddit from 'components/icons/IconSocialReddit';
import IconSocialTelegram from 'components/icons/IconSocialTelegram';
import IconSocialWebsite from 'components/icons/IconSocialWebsite';
import {IconSocialDiscord} from '@yearn-finance/web-lib/icons/IconSocialDiscord';
import {IconSocialGithub} from '@yearn-finance/web-lib/icons/IconSocialGithub';
import {IconSocialTwitter} from '@yearn-finance/web-lib/icons/IconSocialTwitter';

import type {ReactElement} from 'react';
import type {TReceiverProps} from 'utils/types/types';

function SectionSocials(props: TReceiverProps): ReactElement {
	return (
		<Fragment>
			<SocialMediaCard
				href={`https://twitter.com/${props.twitter}`}
				className={props.twitter ? '' : 'pointer-events-none opacity-40'}
				icon={<IconSocialTwitter />} />
			<SocialMediaCard
				href={`https://github.com/${props.github}`}
				className={props.github ? '' : 'pointer-events-none opacity-40'}
				icon={<IconSocialGithub />} />
			<SocialMediaCard
				href={`https://discord.gg/${props.discord}`}
				className={props.discord ? '' : 'pointer-events-none opacity-40'}
				icon={<IconSocialDiscord />} />
			<SocialMediaCard
				href={`https://reddit.com/${props.reddit}`}
				className={props.reddit ? '' : 'pointer-events-none opacity-40'}
				icon={<IconSocialReddit />} />
			<SocialMediaCard
				href={`https://t.me/${props.telegram}`}
				className={props.telegram ? '' : 'pointer-events-none opacity-40'}
				icon={<IconSocialTelegram />} />
			<SocialMediaCard
				href={props.website}
				className={props.website ? '' : 'pointer-events-none opacity-40'}
				icon={<IconSocialWebsite />} />
		</Fragment>
	);
}


export default SectionSocials;
