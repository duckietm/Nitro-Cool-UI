import { RelationshipStatusInfoEvent, RoomSessionFavoriteGroupUpdateEvent, RoomSessionUserBadgesEvent, RoomSessionUserFigureUpdateEvent, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { AvatarInfoUser, CloneObject, GetConfiguration, GetGroupInformation, GetSessionDataManager, GetUserProfile, LocalizeText, SendMessageComposer } from '../../../../../api';
import { Base, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text, UserProfileIconView } from '../../../../../common';
import { useMessageEvent, useRoom, useRoomSessionManagerEvent } from '../../../../../hooks';
import { InfoStandWidgetUserRelationshipsView } from './InfoStandWidgetUserRelationshipsView';
import { InfoStandWidgetUserTagsView } from './InfoStandWidgetUserTagsView';
import { BackgroundsView } from '../../../../backgrounds/BackgroundsView';

interface InfoStandWidgetUserViewProps {
    avatarInfo: AvatarInfoUser | null;
    setAvatarInfo: Dispatch<SetStateAction<AvatarInfoUser | null>>;
    onClose: () => void;
}

export const InfoStandWidgetUserView: FC<InfoStandWidgetUserViewProps> = ({
    avatarInfo,
    setAvatarInfo,
    onClose
}) => {
    const [motto, setMotto] = useState<string>('');
    const [isEditingMotto, setIsEditingMotto] = useState(false);
    const [relationships, setRelationships] = useState<RelationshipStatusInfoMessageParser | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { roomSession } = useRoom();

    const config = useMemo(() => ({
        maxMottoLength: GetConfiguration<number>('motto.max.length', 38),
        tagsEnabled: GetConfiguration('user.tags.enabled')
    }), []);

    const backgroundClasses = useMemo(() => ({
        background: `background-${avatarInfo?.backgroundId ?? 0}`,
        stand: `stand-${avatarInfo?.standId ?? 0}`,
        overlay: `overlay-${avatarInfo?.overlayId ?? 0}`
    }), [avatarInfo?.backgroundId, avatarInfo?.standId, avatarInfo?.overlayId]);

    const saveMotto = useCallback((newMotto: string) => {
        if (!isEditingMotto || !roomSession || newMotto.length > config.maxMottoLength) return;
        
        roomSession.sendMottoMessage(newMotto);
        setIsEditingMotto(false);
    }, [isEditingMotto, roomSession, config.maxMottoLength]);

    const handleMottoBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => 
        saveMotto(event.target.value), [saveMotto]);

    const handleMottoKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();
        if (event.key === 'Enter') saveMotto(event.currentTarget.value);
    }, [saveMotto]);

    const updateAvatarInfo = useCallback((updater: (prev: AvatarInfoUser) => AvatarInfoUser) => {
        setAvatarInfo(prev => prev ? updater(CloneObject(prev)) : prev);
    }, [setAvatarInfo]);

    useRoomSessionManagerEvent<RoomSessionUserBadgesEvent>(RoomSessionUserBadgesEvent.RSUBE_BADGES, useCallback(event => {
        if (!avatarInfo || avatarInfo.webID !== event.userId || avatarInfo.badges.join('') === event.badges.join('')) return;
        updateAvatarInfo(prev => ({ ...prev, badges: event.badges }));
    }, [avatarInfo, updateAvatarInfo]));

    useRoomSessionManagerEvent<RoomSessionUserFigureUpdateEvent>(RoomSessionUserFigureUpdateEvent.USER_FIGURE, useCallback(event => {
        if (!avatarInfo || avatarInfo.roomIndex !== event.roomIndex) return;
        updateAvatarInfo(prev => ({
            ...prev,
            figure: event.figure,
            motto: event.customInfo,
            backgroundId: event.backgroundId,
            standId: event.standId,
            overlayId: event.overlayId,
            achievementScore: event.activityPoints
        }));
    }, [avatarInfo, updateAvatarInfo]));

    useRoomSessionManagerEvent<RoomSessionFavoriteGroupUpdateEvent>(RoomSessionFavoriteGroupUpdateEvent.FAVOURITE_GROUP_UPDATE, useCallback(event => {
        if (!avatarInfo || avatarInfo.roomIndex !== event.roomIndex) return;
        const clearGroup = (event.status === -1 || event.habboGroupId <= 0);
        updateAvatarInfo(prev => ({
            ...prev,
            groupId: clearGroup ? -1 : event.habboGroupId,
            groupName: clearGroup ? null : event.habboGroupName,
            groupBadgeId: clearGroup ? null : GetSessionDataManager().getGroupBadge(event.habboGroupId)
        }));
    }, [avatarInfo, updateAvatarInfo]));

    useMessageEvent<RelationshipStatusInfoEvent>(RelationshipStatusInfoEvent, useCallback(event => {
        const parser = event.getParser();
        if (!avatarInfo || avatarInfo.webID !== parser.userId) return;
        setRelationships(parser);
    }, [avatarInfo]));

    useEffect(() => {
        if (!avatarInfo) return;

        setMotto(avatarInfo.motto || '');
        SendMessageComposer(new UserRelationshipsComposer(avatarInfo.webID));

        return () => {
            setIsEditingMotto(false);
            setMotto('');
            setRelationships(null);
        };
    }, [avatarInfo]);

    if (!avatarInfo) return null;

    const isOwnUser = avatarInfo.type === AvatarInfoUser.OWN_USER;
    const renderBadge = (index: number) => avatarInfo.badges[index] && (
        <Flex center className="badge-image">
            <LayoutBadgeImageView badgeCode={avatarInfo.badges[index]} showInfo={true} />
        </Flex>
    );

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
                        <Column position="relative" pointer fullWidth 
                            className={`body-image profile-background ${backgroundClasses.background}`} 
                            onClick={() => GetUserProfile(avatarInfo.webID)}>
                            <Base position="absolute" className={`body-image profile-stand ${backgroundClasses.stand}`} />
                            <LayoutAvatarImageView figure={avatarInfo.figure} direction={2} />
                            <Base position="absolute" className={`body-image profile-overlay ${backgroundClasses.overlay}`} />
                            {isOwnUser && ( <Base position="absolute" className="icon edit-icon edit-icon-position" onClick={e => { e.stopPropagation(); setIsVisible(prev => !prev); }} /> )}
                        </Column>
                        <Column grow alignItems="center" gap={0}>
                            <Flex gap={1}>
                                {renderBadge(0)}
                                <Flex center pointer={avatarInfo.groupId > 0} className="badge-image" 
                                    onClick={() => avatarInfo.groupId > 0 && GetGroupInformation(avatarInfo.groupId)}>
                                    {avatarInfo.groupId > 0 && (
                                        <LayoutBadgeImageView 
                                            badgeCode={avatarInfo.groupBadgeId} 
                                            isGroup={true} 
                                            showInfo={true} 
                                            customTitle={avatarInfo.groupName} 
                                        />
                                    )}
                                </Flex>
                            </Flex>
                            <Flex center gap={1}>{renderBadge(1)}{renderBadge(2)}</Flex>
                            <Flex center gap={1}>{renderBadge(3)}{renderBadge(4)}</Flex>
                        </Column>
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={1}>
                    <Flex alignItems="center" className="bg-light-dark rounded py-1 px-2">
                        {!isOwnUser ? (
                            <Text fullWidth pointer wrap textBreak small variant="white">{motto}</Text>
                        ) : (
                            <Flex grow alignItems="center" gap={2}>
                                <FaPencilAlt className="small fa-icon" />
                                {!isEditingMotto ? (
                                    <Text fullWidth pointer wrap textBreak small variant="white" 
                                        onClick={() => setIsEditingMotto(true)}>{motto} </Text>
                                ) : (
                                    <input
                                        type="text"
                                        className="motto-input"
                                        maxLength={config.maxMottoLength}
                                        value={motto}
                                        onChange={e => setMotto(e.target.value)}
                                        onBlur={handleMottoBlur}
                                        onKeyDown={handleMottoKeyDown}
                                        autoFocus
                                    />
                                )}
                            </Flex>
                        )}
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={1}>
                    <Text variant="white" small wrap>
                        {LocalizeText('infostand.text.achievement_score')} {avatarInfo.achievementScore}
                    </Text>
                    {avatarInfo.carryItem > 0 && (
                        <>
                            <hr className="m-0" />
                            <Text variant="white" small wrap>
                                {LocalizeText('infostand.text.handitem', ['item'], [LocalizeText('handitem' + avatarInfo.carryItem)])}
                            </Text>
                        </>
                    )}
                </Column>
                <InfoStandWidgetUserRelationshipsView relationships={relationships} />
                {config.tagsEnabled && (
                    <Column gap={1} className="mt-1">
                        <InfoStandWidgetUserTagsView tags={GetSessionDataManager().tags} />
                    </Column>
                )}
            </Column>
            {isVisible && isOwnUser && (
                <BackgroundsView
                    setIsVisible={setIsVisible}
                    selectedBackground={avatarInfo.backgroundId ?? 0}
                    setSelectedBackground={id => updateAvatarInfo(prev => ({ ...prev, backgroundId: id }))}
                    selectedStand={avatarInfo.standId ?? 0}
                    setSelectedStand={id => updateAvatarInfo(prev => ({ ...prev, standId: id }))}
                    selectedOverlay={avatarInfo.overlayId ?? 0}
                    setSelectedOverlay={id => updateAvatarInfo(prev => ({ ...prev, overlayId: id }))}
                />
            )}
        </Column>
    );
};