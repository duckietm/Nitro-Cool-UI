import { FC, useEffect, useState } from 'react';
import { LocalizeBadgeName, LocalizeText, UnseenItemCategory } from '../../../../api';
import { AutoGrid, Button, Column, Flex, Grid, LayoutBadgeImageView, Text } from '../../../../common';
import { useAchievements, useInventoryBadges, useInventoryUnseenTracker } from '../../../../hooks';
import { InventoryBadgeItemView } from './InventoryBadgeItemView';

interface InventoryBadgeViewProps
{
    filteredBadgeCodes: string[];
}

export const InventoryBadgeView: FC<InventoryBadgeViewProps> = props =>
{
    const { filteredBadgeCodes = [] } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const { activeBadgeCodes = [], selectedBadgeCode = null, isWearingBadge = null, canWearBadges = null, toggleBadge = null, getBadgeId = null, activate = null, deactivate = null } = useInventoryBadges();
    const { isUnseen = null, removeUnseen = null } = useInventoryUnseenTracker();
    const { achievementScore = 0 } = useAchievements();

    useEffect(() =>
    {
        if(!selectedBadgeCode || !isUnseen(UnseenItemCategory.BADGE, getBadgeId(selectedBadgeCode))) return;

        removeUnseen(UnseenItemCategory.BADGE, getBadgeId(selectedBadgeCode));
    }, [ selectedBadgeCode, isUnseen, removeUnseen, getBadgeId ]);

    useEffect(() =>
    {
        if(!isVisible) return;

        const id = activate();

        return () => deactivate(id);
    }, [ isVisible, activate, deactivate ]);

    useEffect(() =>
    {
        setIsVisible(true);

        return () => setIsVisible(false);
    }, []);

    return (
        <div className="badge-wrapper calc-wrapper mt-n2">
            <Grid gap={ 1 }>
                <Column overflow="hidden" className="size-list-badges mt-1">
                    <AutoGrid gap={ 1 } columnCount={ 5 }>
                        { filteredBadgeCodes && filteredBadgeCodes.length > 0 && filteredBadgeCodes.map((badgeCode, index) =>
                        {
                            if (isWearingBadge(badgeCode)) return null;

                            return <InventoryBadgeItemView key={ index } badgeCode={ badgeCode } />;
                        }) }
                    </AutoGrid>
                </Column>
                <Column className="justify-content-between size-badges position-absolute end-2 mt-n4" overflow="auto">
                    <Column overflow="hidden">
                        <Text center bold>{ LocalizeText('inventory.badges.activebadges') }</Text>
                        <AutoGrid gap={ 1 } columnCount={ 5 }>
                            { activeBadgeCodes && (activeBadgeCodes.length > 0) && activeBadgeCodes.map((badgeCode, index) => <InventoryBadgeItemView key={ index } badgeCode={ badgeCode } />) }
                        </AutoGrid>
                    </Column>
                </Column>
            </Grid>
            <Column gap={ 0 } position="absolute" className="bottom-2" style={ { width: '96%' } }>
                { !!selectedBadgeCode &&
                    <Flex className="bg-white pb-1 px-2 rounded mt-2" style={ { height: '50px' } } justifyContent={ 'between' } alignItems={ 'end' } gap={ 2 }>
                        <Flex alignItems="start" gap={ 2 }>
                            <LayoutBadgeImageView shrink badgeCode={ selectedBadgeCode } />
                            <Text className="font-bold mt-2">{ LocalizeBadgeName(selectedBadgeCode) }</Text>
                        </Flex>
                        <Button className="btn btn-primary mb-1" style={ { fontSize: '12px' } } disabled={ !isWearingBadge(selectedBadgeCode) && !canWearBadges() } onClick={ event => toggleBadge(selectedBadgeCode) }>{ LocalizeText(isWearingBadge(selectedBadgeCode) ? 'inventory.badges.clearbadge' : 'inventory.badges.wearbadge') }</Button>
                    </Flex>
                }
                <div className="nitro-progress-bar text-white mt-1">
                    <Text small center style={ { marginTop: '-1px' } }>{ LocalizeText('achievements.categories.score', [ 'score' ], [ achievementScore.toString() ]) }</Text>
                </div>
            </Column>
        </div>
    );
}
