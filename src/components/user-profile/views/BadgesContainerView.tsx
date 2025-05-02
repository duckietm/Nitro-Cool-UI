import { FC } from 'react';
import { Flex, FlexProps, LayoutBadgeImageView } from '../../../common';

interface BadgesContainerViewProps extends FlexProps
{
    badges: string[];
}

export const BadgesContainerView: FC<BadgesContainerViewProps> = props =>
{
    const { badges = null, gap = 1, justifyContent = 'between', ...rest } = props;

    const isGroupBadge = (badgeCode: string): boolean =>
    {
        return badgeCode && badgeCode.startsWith('b') && badgeCode.length > 10; // Example heuristic
    };

    return (
        <Flex gap={ 2 } alignItems="center" {...rest}>
            { badges && (badges.length > 0) && badges.map((badge, index) =>
            {
                const isGroup = isGroupBadge(badge);

                return (
                    <div key={ badge } style={{ maxWidth: 45, maxHeight: 45 }}>
                        <LayoutBadgeImageView badgeCode={ badge } isGroup={ isGroup } />
                    </div>
                );
            }) }
        </Flex>
    );
}