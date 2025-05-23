import { RelationshipStatusInfoEvent, RelationshipStatusInfoMessageParser, RoomSessionFavoriteGroupUpdateEvent, RoomSessionUserBadgesEvent, RoomSessionUserFigureUpdateEvent, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { Dispatch, FC, FocusEvent, KeyboardEvent, SetStateAction, useEffect, useState } from 'react';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { AvatarInfoUser, CloneObject, GetConfiguration, GetGroupInformation, GetSessionDataManager, GetUserProfile, LocalizeText, SendMessageComposer } from '../../../../../api';
import { Base, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text, UserProfileIconView } from '../../../../../common';
import { useMessageEvent, useRoom, useRoomSessionManagerEvent } from '../../../../../hooks';
import { InfoStandWidgetUserRelationshipsView } from './InfoStandWidgetUserRelationshipsView';
import { InfoStandWidgetUserTagsView } from './InfoStandWidgetUserTagsView';
import { BackgroundsView } from '../../../../backgrounds/BackgroundsView';

interface InfoStandWidgetUserViewProps {
    avatarInfo: AvatarInfoUser;
    setAvatarInfo: Dispatch<SetStateAction<AvatarInfoUser>>;
    onClose: () => void;
}

export const InfoStandWidgetUserView: FC<InfoStandWidgetUserViewProps> = props => {
    const { avatarInfo = null, setAvatarInfo = null, onClose = null } = props;
    const [motto, setMotto] = useState<string>(null);
    const [isEditingMotto, setIsEditingMotto] = useState(false);
    const [relationships, setRelationships] = useState<RelationshipStatusInfoMessageParser>(null);
    const { roomSession = null } = useRoom();
    const [backgroundId, setBackgroundId] = useState<number>(null);
    const [standId, setStandId] = useState<number>(null);
    const [overlayId, setOverlayId] = useState<number>(null);
    const [backgroundDirection, setBackgroundDirection] = useState<number>(2);
    const [standDirection, setStandDirection] = useState<number>(2);
    const [overlayDirection, setOverlayDirection] = useState<number>(2);
    const [isVisible, setIsVisible] = useState(false);

    const infostandBackgroundClass = `background-${backgroundId}`;
    const infostandStandClass = `stand-${standId}`;
    const infostandOverlayClass = `overlay-${overlayId}`;

    // Compute the avatar direction: Overlay > Stand > Background
    const avatarDirection = overlayDirection !== null && overlayDirection !== undefined ? overlayDirection : 
                           (standDirection !== null && standDirection !== undefined ? standDirection : backgroundDirection);

    const saveMotto = (motto: string) => {
        if (!isEditingMotto || (motto.length > GetConfiguration<number>('motto.max.length', 38))) return;

        roomSession.sendMottoMessage(motto);

        setIsEditingMotto(false);
    };

    const onMottoBlur = (event: FocusEvent<HTMLInputElement>) => saveMotto(event.target.value);

    const onMottoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();

        switch (event.key) {
            case 'Enter':
                saveMotto((event.target as HTMLInputElement).value);
                return;
        }
    };

    useRoomSessionManagerEvent<RoomSessionUserBadgesEvent>(RoomSessionUserBadgesEvent.RSUBE_BADGES, event => {
        if (!avatarInfo || (avatarInfo.webID !== event.userId)) return;

        const oldBadges = avatarInfo.badges.join('');

        if (oldBadges === event.badges.join('')) return;

        setAvatarInfo(prevValue => {
            const newValue = CloneObject(prevValue);

            newValue.badges = event.badges;

            return newValue;
        });
    });

    useRoomSessionManagerEvent<RoomSessionUserFigureUpdateEvent>(RoomSessionUserFigureUpdateEvent.USER_FIGURE, event => {
        if (!avatarInfo || (avatarInfo.roomIndex !== event.roomIndex)) return;

        setAvatarInfo(prevValue => {
            const newValue = CloneObject(prevValue);

            newValue.figure = event.figure;
            newValue.motto = event.customInfo;
            newValue.backgroundId = event.backgroundId;
            newValue.standId = event.standId;
            newValue.overlayId = event.overlayId;
            newValue.achievementScore = event.activityPoints;

            return newValue;
        });

        // Update directions based on the new IDs
        const backgrounds = GetConfiguration('backgrounds.data') || [];
        const stands = GetConfiguration('stands.data') || [];
        const overlays = GetConfiguration('overlays.data') || [];

        const background = backgrounds.find(bg => bg.backgroundId === event.backgroundId);
        const stand = stands.find(st => st.standId === event.standId);
        const overlay = overlays.find(ov => ov.overlayId === event.overlayId);

        setBackgroundDirection(background ? background.AvatarDirection ?? 2 : 2);
        setStandDirection(stand ? stand.AvatarDirection ?? 2 : 2);
        setOverlayDirection(overlay ? overlay.AvatarDirection ?? 2 : 2);
    });

    useRoomSessionManagerEvent<RoomSessionFavoriteGroupUpdateEvent>(RoomSessionFavoriteGroupUpdateEvent.FAVOURITE_GROUP_UPDATE, event => {
        if (!avatarInfo || (avatarInfo.roomIndex !== event.roomIndex)) return;

        setAvatarInfo(prevValue => {
            const newValue = CloneObject(prevValue);
            const clearGroup = ((event.status === -1) || (event.habboGroupId <= 0));

            newValue.groupId = clearGroup ? -1 : event.habboGroupId;
            newValue.groupName = clearGroup ? null : event.habboGroupName;
            newValue.groupBadgeId = clearGroup ? null : GetSessionDataManager().getGroupBadge(event.habboGroupId);

            return newValue;
        });
    });

    useMessageEvent<RelationshipStatusInfoEvent>(RelationshipStatusInfoEvent, event => {
        const parser = event.getParser();

        if (!avatarInfo || (avatarInfo.webID !== parser.userId)) return;

        setRelationships(parser);
    });

    useEffect(() => {
        setIsEditingMotto(false);
        setMotto(avatarInfo.motto);
        setBackgroundId(avatarInfo.backgroundId);
        setStandId(avatarInfo.standId);
        setOverlayId(avatarInfo.overlayId);

        // Set initial directions based on avatarInfo
        const backgrounds = GetConfiguration('backgrounds.data') || [];
        const stands = GetConfiguration('stands.data') || [];
        const overlays = GetConfiguration('overlays.data') || [];

        const background = backgrounds.find(bg => bg.backgroundId === avatarInfo.backgroundId);
        const stand = stands.find(st => st.standId === avatarInfo.standId);
        const overlay = overlays.find(ov => ov.overlayId === avatarInfo.overlayId);

        setBackgroundDirection(background ? background.AvatarDirection ?? 2 : 2);
        setStandDirection(stand ? stand.AvatarDirection ?? 2 : 2);
        setOverlayDirection(overlay ? overlay.AvatarDirection ?? 2 : 2);

        SendMessageComposer(new UserRelationshipsComposer(avatarInfo.webID));

        return () => {
            setIsEditingMotto(false);
            setMotto(null);
            setRelationships(null);
            setBackgroundId(null);
            setStandId(null);
            setOverlayId(null);
            setBackgroundDirection(2);
            setStandDirection(2);
            setOverlayDirection(2);
        };
    }, [avatarInfo]);

    if (!avatarInfo) return null;

    return (
        <Column className="nitro-infostand rounded">
            <Column overflow="visible" className="container-fluid content-area" gap={1}>
                <Column gap={1}>
                    <Flex alignItems="center" justifyContent="between">
                        <Flex alignItems="center" gap={1}>
                            <UserProfileIconView userId={avatarInfo.webID} />
                            <Text variant="white" small wrap>{avatarInfo.name}</Text>
                        </Flex>
                        <FaTimes className="cursor-pointer fa-icon" onClick={onClose} />
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={1}>
                    <Flex gap={1}>
                        <Column position="relative" pointer fullWidth className={`body-image profile-background ${infostandBackgroundClass}`} onClick={event => GetUserProfile(avatarInfo.webID)}>
                            <Base position="absolute" className={`body-image profile-stand ${infostandStandClass}`} />
                            <LayoutAvatarImageView figure={avatarInfo.figure} direction={avatarDirection} style={{ position: 'relative', top: '-10px' }} />
                            <Base position="absolute" className={`body-image profile-overlay ${infostandOverlayClass}`} />
                            {avatarInfo.type === AvatarInfoUser.OWN_USER &&
                                <Base position="absolute" className="icon edit-icon edit-icon-position" onClick={event => {
                                    event.stopPropagation();
                                    setIsVisible(prevValue => !prevValue);
                                }} />
                            }
                        </Column>
                        <Column grow alignItems="center" gap={0}>
                            <Flex gap={1}>
                                <Flex center className="badge-image">
                                    {avatarInfo.badges[0] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[0]} showInfo={true} />}
                                </Flex>
                                <Flex center pointer={(avatarInfo.groupId > 0)} className="badge-image" onClick={event => GetGroupInformation(avatarInfo.groupId)}>
                                    {avatarInfo.groupId > 0 &&
                                        <LayoutBadgeImageView badgeCode={avatarInfo.groupBadgeId} isGroup={true} showInfo={true} customTitle={avatarInfo.groupName} />}
                                </Flex>
                            </Flex>
                            <Flex center gap={1}>
                                <Flex center className="badge-image">
                                    {avatarInfo.badges[1] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[1]} showInfo={true} />}
                                </Flex>
                                <Flex center className="badge-image">
                                    {avatarInfo.badges[2] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[2]} showInfo={true} />}
                                </Flex>
                            </Flex>
                            <Flex center gap={1}>
                                <Flex center className="badge-image">
                                    {avatarInfo.badges[3] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[3]} showInfo={true} />}
                                </Flex>
                                <Flex center className="badge-image">
                                    {avatarInfo.badges[4] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[4]} showInfo={true} />}
                                </Flex>
                            </Flex>
                        </Column>
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={1}>
                    <Flex alignItems="center" className="bg-light-dark rounded py-1 px-2">
                        {(avatarInfo.type !== AvatarInfoUser.OWN_USER) &&
                            <Flex grow alignItems="center" className="motto-content">
                                <Text fullWidth pointer wrap textBreak small variant="white">{motto}</Text>
                            </Flex>}
                        {avatarInfo.type === AvatarInfoUser.OWN_USER &&
                            <Flex grow alignItems="center" gap={2}>
                                <FaPencilAlt className="small fa-icon" />
                                <Flex grow alignItems="center" className="motto-content">
                                    {!isEditingMotto &&
                                        <Text fullWidth pointer wrap textBreak small variant="white" onClick={event => setIsEditingMotto(true)}>{motto} </Text>}
                                    {isEditingMotto &&
                                        <input type="text" className="motto-input" maxLength={GetConfiguration<number>('motto.max.length', 38)} value={motto} onChange={event => setMotto(event.target.value)} onBlur={onMottoBlur} onKeyDown={onMottoKeyDown} autoFocus={true} />}
                                </Flex>
                            </Flex>}
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={1}>
                    <Text variant="white" small wrap>
                        {LocalizeText('infostand.text.achievement_score') + ' ' + avatarInfo.achievementScore}
                    </Text>
                    {(avatarInfo.carryItem > 0) &&
                        <>
                            <hr className="m-0" />
                            <Text variant="white" small wrap>
                                {LocalizeText('infostand.text.handitem', ['item'], [LocalizeText('handitem' + avatarInfo.carryItem)])}
                            </Text>
                        </>}
                </Column>
                <Column gap={1}>
                    <InfoStandWidgetUserRelationshipsView relationships={relationships} />
                </Column>
                {GetConfiguration('user.tags.enabled') &&
                    <Column gap={1} className="mt-1">
                        <InfoStandWidgetUserTagsView tags={GetSessionDataManager().tags} />
                    </Column>
                }
            </Column>
            {(isVisible && avatarInfo.type === AvatarInfoUser.OWN_USER) &&
                <BackgroundsView
                    setIsVisible={setIsVisible}
                    selectedBackground={backgroundId}
                    setSelectedBackground={setBackgroundId}
                    selectedStand={standId}
                    setSelectedStand={setStandId}
                    selectedOverlay={overlayId}
                    setSelectedOverlay={setOverlayId} // Fixed: Use setOverlayId
                    setBackgroundDirection={setBackgroundDirection}
                    setStandDirection={setStandDirection}
                    setOverlayDirection={setOverlayDirection}
                />}
        </Column>
    );
};