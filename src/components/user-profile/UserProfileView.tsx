import { ExtendedProfileChangedMessageEvent, RelationshipStatusInfoEvent, RelationshipStatusInfoMessageParser, RoomEngineObjectEvent, RoomObjectCategory, RoomObjectType, UserCurrentBadgesComposer, UserCurrentBadgesEvent, UserProfileEvent, UserProfileParser, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { CreateLinkEvent, GetRoomSession, GetSessionDataManager, GetUserProfile, LocalizeText, SendMessageComposer } from '../../api';
import { Column, Flex, Grid, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../common';
import { useMessageEvent, useRoomEngineEvent } from '../../hooks';
import { BadgesContainerView } from './views/BadgesContainerView';
import { FriendsContainerView } from './views/FriendsContainerView';
import { GroupsContainerView } from './views/GroupsContainerView';
import { UserContainerView } from './views/UserContainerView';

let currentUserId: number | null = null;

const handleUserCurrentBadgesEvent = (event: UserCurrentBadgesEvent, setUserBadges: (badges: string[]) => void) => {
    const parser = event.getParser();

    if (currentUserId === null || parser.userId !== currentUserId) return;

    setUserBadges(parser.badges);
};

export const UserProfileView: FC<{}> = props =>
{
    const [ userProfile, setUserProfile ] = useState<UserProfileParser>(null);
    const [ userBadges, setUserBadges ] = useState<string[]>(null);
    const [ userRelationships, setUserRelationships ] = useState<RelationshipStatusInfoMessageParser>(null);

    const onClose = () =>
    {
        setUserProfile(null);
        setUserBadges(null);
        setUserRelationships(null);
        currentUserId = null;
    }

    const onLeaveGroup = () =>
    {
        if(!userProfile || (userProfile.id !== GetSessionDataManager().userId)) return;

        GetUserProfile(userProfile.id);
    }

    useMessageEvent<UserCurrentBadgesEvent>(UserCurrentBadgesEvent, event => {
        handleUserCurrentBadgesEvent(event, setUserBadges);
    });

    useMessageEvent<RelationshipStatusInfoEvent>(RelationshipStatusInfoEvent, event =>
    {
        const parser = event.getParser();

        if(!userProfile || (parser.userId !== userProfile.id)) return;

        setUserRelationships(parser);
    });

    useMessageEvent<UserProfileEvent>(UserProfileEvent, event =>
    {
        const parser = event.getParser();

        let isSameProfile = false;

        setUserProfile(prevValue =>
        {
            if(prevValue && prevValue.id) isSameProfile = (prevValue.id === parser.id);

            return parser;
        });

        if(!isSameProfile)
        {
            setUserBadges(null);
            setUserRelationships(null);
        }

        currentUserId = parser.id;

        SendMessageComposer(new UserCurrentBadgesComposer(parser.id));
        SendMessageComposer(new UserRelationshipsComposer(parser.id));
    });

    useMessageEvent<ExtendedProfileChangedMessageEvent>(ExtendedProfileChangedMessageEvent, event =>
    {
        const parser = event.getParser();

        console.log('UserProfileView: Received ExtendedProfileChangedMessageEvent', { userId: parser.userId, currentUserId });

        if(parser.userId != userProfile?.id) return;

        GetUserProfile(parser.userId);
    });

    useRoomEngineEvent<RoomEngineObjectEvent>(RoomEngineObjectEvent.SELECTED, event =>
    {
        if(!userProfile) return;

        if(event.category !== RoomObjectCategory.UNIT) return;

        const userData = GetRoomSession().userDataManager.getUserDataByIndex(event.objectId);

        if(userData.type !== RoomObjectType.USER) return;

        GetUserProfile(userData.webID);
    });

    useEffect(() => {
        return () => {
            currentUserId = null;
        };
    }, []);

    if(!userProfile) return null;

    return (
        <NitroCardView uniqueKey="nitro-user-profile" theme="primary-slim" className="user-profile">
            <NitroCardHeaderView headerText={ LocalizeText('extendedprofile.caption') } onCloseClick={ onClose } />
            <NitroCardContentView overflow="hidden">
                <Grid fullHeight={ false } gap={ 2 } style={{ minHeight: '200px' }}>
                    <Column size={ 7 } gap={ 1 } className="user-container pe-2">
                        <UserContainerView userProfile={ userProfile } />
                        <Grid fullHeight className="bg-muted rounded px-2 py-1" style={{ minHeight: '70px' }}>
                            { userBadges === null ? (
                                <Text>Loading badges...</Text>
                            ) : (
                                <BadgesContainerView key={ userBadges.join('-') } fullWidth center badges={ userBadges } />
                            ) }
                        </Grid>
                    </Column>
                    <Column size={ 5 }>
                        { userRelationships &&
                            <FriendsContainerView relationships={ userRelationships } friendsCount={ userProfile.friendsCount } /> }
                    </Column>
                </Grid>
                <Flex alignItems="center" className="rooms-button-container px-2 py-1">
                    <Flex alignItems="center" gap={ 1 } onClick={ event => CreateLinkEvent(`navigator/search/hotel_view/owner:${ userProfile.username }`) }>
                        <i className="icon icon-rooms" />
                        <Text bold underline pointer>{ LocalizeText('extendedprofile.rooms') }</Text>
                    </Flex>
                </Flex>
                <GroupsContainerView fullWidth itsMe={ userProfile.id === GetSessionDataManager().userId } groups={ userProfile.groups } onLeaveGroup={ onLeaveGroup } />
            </NitroCardContentView>
        </NitroCardView>
    )
}