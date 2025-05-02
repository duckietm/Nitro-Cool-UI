import { GroupSaveBadgeComposer } from '@nitrots/nitro-renderer';
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';
import { GroupBadgePart, IGroupData, SendMessageComposer } from '../../../../api';
import { Column, Flex, Grid, LayoutBadgeImageView } from '../../../../common';
import { useGroup } from '../../../../hooks';
import { GroupBadgeCreatorView } from '../GroupBadgeCreatorView';

interface GroupTabBadgeViewProps
{
    skipDefault?: boolean;
    setCloseAction: Dispatch<SetStateAction<{ action: () => boolean }>>;
    groupData: IGroupData;
    setGroupData: Dispatch<SetStateAction<IGroupData>>;
    onBadgeCodeUpdate?: (badgeCode: string) => void;
}

export const GroupTabBadgeView: FC<GroupTabBadgeViewProps> = props =>
{
    const { groupData = null, setGroupData = null, setCloseAction = null, skipDefault = null, onBadgeCodeUpdate = null } = props;
    const { groupCustomize = null } = useGroup();
    const [ badgeParts, setBadgeParts ] = useState<GroupBadgePart[]>(groupData?.groupBadgeParts || []);

    const getModifiedBadgeCode = () =>
    {
        if (!badgeParts || !badgeParts.length) return '';

        let badgeCode = '';

        badgeParts.forEach(part => {
            if (part.code && part.code.length > 0) {
                badgeCode += part.code;
            }
            // Exclude unset symbols (key: 0) from the badge code
        });

        console.log('GroupTabBadgeView: Computed badge code', { badgeCode, badgeParts });

        return badgeCode;
    };

    const saveBadge = useCallback(() =>
    {
        if (!groupData || !badgeParts || !badgeParts.length) return false;

        if ((groupData.groupBadgeParts === badgeParts)) return true;

        if (groupData.groupId <= 0)
        {
            setGroupData(prevValue =>
            {
                const newValue = { ...prevValue };

                newValue.groupBadgeParts = badgeParts;

                return newValue;
            });

            return true;
        }

        const badge = [];

        badgeParts.forEach(part =>
        {
            if (!part.code) return;

            badge.push(part.key);
            badge.push(part.color);
            badge.push(part.position);
        });

        SendMessageComposer(new GroupSaveBadgeComposer(groupData.groupId, badge));

        return true;
    }, [ groupData, badgeParts, setGroupData ]);

    useEffect(() =>
    {
        if (groupData.groupBadgeParts) return;

        const badgeParts = [
            new GroupBadgePart(GroupBadgePart.BASE, groupCustomize.badgeBases[0].id, groupCustomize.badgePartColors[0].id),
            new GroupBadgePart(GroupBadgePart.SYMBOL, 0, groupCustomize.badgePartColors[0].id),
            new GroupBadgePart(GroupBadgePart.SYMBOL, 0, groupCustomize.badgePartColors[0].id),
            new GroupBadgePart(GroupBadgePart.SYMBOL, 0, groupCustomize.badgePartColors[0].id),
            new GroupBadgePart(GroupBadgePart.SYMBOL, 0, groupCustomize.badgePartColors[0].id)
        ];

        setGroupData(prevValue =>
        {
            const groupBadgeParts = badgeParts;

            return { ...prevValue, groupBadgeParts };
        });
    }, [ groupData.groupBadgeParts, groupCustomize, setGroupData ]);

    useEffect(() =>
    {
        console.log('GroupTabBadgeView: Setting badgeParts', { groupData, groupBadgeParts: groupData?.groupBadgeParts });
        if (groupData.groupId <= 0)
        {
            setBadgeParts(groupData.groupBadgeParts ? [ ...groupData.groupBadgeParts ] : []);
            return;
        }

        setBadgeParts(groupData.groupBadgeParts || []);
    }, [ groupData ]);

    useEffect(() =>
    {
        setCloseAction({ action: saveBadge });

        return () => setCloseAction(null);
    }, [ setCloseAction, saveBadge ]);

    return (
        <Grid gap={ 1 } overflow="hidden">
            <Column size={ 2 }>
                <Flex center className="bg-muted rounded p-1">
                    { getModifiedBadgeCode() ? (
                        <LayoutBadgeImageView badgeCode={ getModifiedBadgeCode() } isGroup={ true } />
                    ) : (
                        <div style={{ width: 45, height: 45 }} /> // Placeholder to maintain layout
                    )}
                </Flex>
            </Column>
            <Column overflow="auto" size={ 10 }>
                <GroupBadgeCreatorView badgeParts={ badgeParts } setBadgeParts={ setBadgeParts } onBadgeCodeUpdate={ onBadgeCodeUpdate } />
            </Column>
        </Grid>
    );
};