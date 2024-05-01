import { AddFavouriteRoomMessageComposer, DeleteFavouriteRoomMessageComposer, GetCustomRoomFilterMessageComposer, NavigatorSearchComposer, RoomMuteComposer, RoomSettingsComposer, SecurityLevel, ToggleStaffPickMessageComposer, UpdateHomeRoomMessageComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { CreateLinkEvent, DispatchUiEvent, GetConfiguration, GetGroupInformation, GetSessionDataManager, GetUserProfile, LocalizeText, ReportType, SendMessageComposer } from '../../../api';
import { Base, Button, Column, Flex, LayoutBadgeImageView, LayoutRoomThumbnailView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text, UserProfileIconView, classNames } from '../../../common';

import { RoomWidgetThumbnailEvent } from '../../../events';
import { useHelp, useNavigator } from '../../../hooks';

export class NavigatorRoomInfoViewProps
{
    onCloseClick: () => void;
}

export const NavigatorRoomInfoView: FC<NavigatorRoomInfoViewProps> = props =>
{
    const { onCloseClick = null } = props;
    const [ isRoomPicked, setIsRoomPicked ] = useState(false);
    const [ isRoomMuted, setIsRoomMuted ] = useState(false);
    const [ isOpenLink, setIsOpenLink ] = useState<boolean>(false);
    const { report = null } = useHelp();
    const { navigatorData = null } = useNavigator();

    const hasPermission = (permission: string) =>
    {
        switch(permission)
        {
            case 'settings':
                return (GetSessionDataManager().userId === navigatorData.enteredGuestRoom.ownerId || GetSessionDataManager().isModerator);
            case 'staff_pick':
                return GetSessionDataManager().securityLevel >= SecurityLevel.COMMUNITY;
            default: return false;
        }
    }

    const processAction = (action: string, value?: string) =>
    {
        if(!navigatorData || !navigatorData.enteredGuestRoom) return;

        switch(action)
        {
            case 'set_home_room':
                let newRoomId = -1;

                if(navigatorData.homeRoomId !== navigatorData.enteredGuestRoom.roomId)
                {
                    newRoomId = navigatorData.enteredGuestRoom.roomId;
                }

                if(newRoomId > 0) SendMessageComposer(new UpdateHomeRoomMessageComposer(newRoomId));
                return;
            case 'navigator_search_tag':
                CreateLinkEvent(`navigator/search/${ value }`);
                SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${ value }`));
                return;
            case 'open_room_thumbnail_camera':
                DispatchUiEvent(new RoomWidgetThumbnailEvent(RoomWidgetThumbnailEvent.TOGGLE_THUMBNAIL));
                onCloseClick();
                return;
            case 'open_group_info':
                GetGroupInformation(navigatorData.enteredGuestRoom.habboGroupId);
                return;
            case 'open_room_settings':
                SendMessageComposer(new RoomSettingsComposer(navigatorData.enteredGuestRoom.roomId));
                onCloseClick();
                return;
            case 'toggle_pick':
                setIsRoomPicked(value => !value);
                SendMessageComposer(new ToggleStaffPickMessageComposer(navigatorData.enteredGuestRoom.roomId));
                return;
            case 'toggle_mute':
                setIsRoomMuted(value => !value);
                SendMessageComposer(new RoomMuteComposer());
                return;
            case 'room_filter':
                SendMessageComposer(new GetCustomRoomFilterMessageComposer(navigatorData.enteredGuestRoom.roomId));
                onCloseClick();
                return;
            case 'open_floorplan_editor':
                CreateLinkEvent('floor-editor/toggle');
                onCloseClick();
                return;
            case 'report_room':
                report(ReportType.ROOM, { roomId: navigatorData.enteredGuestRoom.roomId, roomName: navigatorData.enteredGuestRoom.roomName });
                onCloseClick();
                return;
            case 'set_favourite_room':
                SendMessageComposer(new AddFavouriteRoomMessageComposer(navigatorData.enteredGuestRoom.roomId));    
                return;
            case 'set_unfavourite_room':
                SendMessageComposer(new DeleteFavouriteRoomMessageComposer(navigatorData.enteredGuestRoom.roomId));    
                return;
            case 'close':
                onCloseClick();
                return;
        }

    }

    useEffect(() =>
    {
        if(!navigatorData) return;

        setIsRoomPicked(navigatorData.currentRoomIsStaffPick);

        if(navigatorData.enteredGuestRoom) setIsRoomMuted(navigatorData.enteredGuestRoom.allInRoomMuted);
    }, [ navigatorData ]);

    if(!navigatorData.enteredGuestRoom) return null;

    return (
        <NitroCardView className="nitro-room-info" theme="primary">
            <NitroCardHeaderView headerText={ LocalizeText('navigator.roomsettings.roominfo') } onCloseClick={ () => processAction('close') } />
            <NitroCardContentView className="text-black">
                { navigatorData.enteredGuestRoom &&
                    <>
                        <Flex gap={ 2 } overflow="hidden">
                            <Column grow gap={ 1 } overflow="hidden">
                                <Flex gap={ 1 }>
                                    <Column grow gap={ 1 }>
                                        <Flex gap={ 1 } justifyContent="between">
                                            <Text bold>{ navigatorData.enteredGuestRoom.roomName }</Text>
                                            <Flex>
                                                <i title={ navigatorData.homeRoomId !== navigatorData.enteredGuestRoom.roomId ? LocalizeText('navigator.roominfo.makehome.tooltip') : '' } onClick={ () => processAction('set_home_room') } className={ classNames('flex-shrink-0 icon icon-house-small', ((navigatorData.homeRoomId !== navigatorData.enteredGuestRoom.roomId) && 'cursor-pointer'), ((navigatorData.homeRoomId !== navigatorData.enteredGuestRoom.roomId) && 'gray')) } />
                                                { /* <Flex className={ navigatorData.enteredGuestRoom.ownerId !== GetSessionDataManager().userId ? 'ms-1' : 'ms-4' }>
                                                    { (navigatorData.enteredGuestRoom.ownerId !== GetSessionDataManager().userId) &&
                                                        <i onClick={ () => processAction('set_favourite_room') } className={ classNames('flex-shrink-0 icon icon-favourite-room-active cursor-pointer') } />
                                                        <i onClick={ () => processAction('set_unfavourite_room') } className={ classNames('flex-shrink-0 icon icon-favourite-room-inactive cursor-pointer') } />
                                                    }
                                                </Flex> */ }
                                            </Flex>
                                        </Flex>
                                        { navigatorData.enteredGuestRoom.showOwner &&
                                            <Flex pointer title={ LocalizeText('guide.help.common.profile.tooltip') } alignItems="center" gap={ 1 } onClick={ () => GetUserProfile(navigatorData.enteredGuestRoom.ownerId) }>
                                                <Text small variant="muted">{ LocalizeText('navigator.roomownercaption') }</Text>
                                                <Flex alignItems="center" gap={ 1 }>
                                                    <UserProfileIconView userId={ navigatorData.enteredGuestRoom.ownerId } />
                                                    <Text small>{ navigatorData.enteredGuestRoom.ownerName }</Text>
                                                </Flex>
                                            </Flex>
                                        }
                                        <Flex alignItems="center" gap={ 1 }>
                                            <Text small variant="muted">{ LocalizeText('navigator.roomrating') }</Text>
                                            <Text small>{ navigatorData.currentRoomRating }</Text>
                                        </Flex>
                                        { (navigatorData.enteredGuestRoom.tags.length > 0) &&
                                            <Flex className="mt-1" alignItems="center" gap={ 1 }>
                                                { navigatorData.enteredGuestRoom.tags.map(tag =>
                                                {
                                                    return <Text key={ tag } pointer className="text-tag rounded p-1" onClick={ event => processAction('navigator_search_tag', tag) }>#{ tag }</Text>
                                                }) }
                                            </Flex>
                                        }
                                    </Column>
                                </Flex>
                                <Text small overflow="auto" style={ { wordBreak: 'break-all' } }>{ navigatorData.enteredGuestRoom.description }</Text>
                                <Flex justifyContent="center">
                                    <LayoutRoomThumbnailView title={ LocalizeText('tooltip.navigator.room.info.add.thumbnail') } roomId={ navigatorData.enteredGuestRoom.roomId } customUrl={ navigatorData.enteredGuestRoom.officialRoomPicRef }>
                                        { hasPermission('settings') && <i className="icon icon-camera-small position-absolute cursor-pointer bottom-1 end-1" onClick={ () => processAction('open_room_thumbnail_camera') } /> }
                                    </LayoutRoomThumbnailView>
                                </Flex>
                                { (navigatorData.enteredGuestRoom.habboGroupId > 0) &&
                                    <Flex pointer alignItems="center" gap={ 2 } onClick={ () => processAction('open_group_info') }>
                                        <LayoutBadgeImageView className="flex-none" badgeCode={ navigatorData.enteredGuestRoom.groupBadgeCode } isGroup={ true } />
                                        <Text small underline>
                                            { LocalizeText('navigator.guildbase', [ 'groupName' ], [ navigatorData.enteredGuestRoom.groupName ]) }
                                        </Text>
                                    </Flex>
                                }
                                <Flex gap={ 1 } className="w-100 room-tool-item" onClick={ () => setIsOpenLink(prevValue => !prevValue) }>
                                    <Base pointer title={ LocalizeText('room.like.button.text') } className="icon-width icon icon-link-room float-start" />
                                    <Text underline small >{ LocalizeText('navigator.embed.caption') }</Text>
                                </Flex>
                                { (isOpenLink) &&
                                    <Column className="w-100">
                                        <Text className="text-embed">{ LocalizeText('navigator.embed.info') }</Text>
                                        <input type="text" readOnly className="form-control form-control-sm" value={ LocalizeText('navigator.embed.src', [ 'roomId' ], [ navigatorData.enteredGuestRoom.roomId.toString() ]).replace('${url.prefix}', GetConfiguration<string>('url.prefix', '')) } />
                                    </Column>
                                }
                            </Column>
                        </Flex>
                        <Column gap={ 1 }>
                            { hasPermission('staff_pick') &&
                                <Button onClick={ () => processAction('toggle_pick') }>
                                    { LocalizeText(isRoomPicked ? 'navigator.staffpicks.unpick' : 'navigator.staffpicks.pick') }
                                </Button>
                            }
                            { hasPermission('settings') &&
                                <>
                                    <Button onClick={ () => processAction('open_room_settings') }>
                                        { LocalizeText('navigator.room.popup.info.room.settings') }
                                    </Button>
                                    <Button onClick={ () => processAction('room_filter') }>
                                        { LocalizeText('navigator.roomsettings.roomfilter') }
                                    </Button>
                                    <Button onClick={ () => processAction('open_floorplan_editor') }>
                                        { LocalizeText('open.floor.plan.editor') }
                                    </Button>
                                </>
                            }
                            
                            { hasPermission('settings') &&
                                <Button onClick={ () => processAction('toggle_mute') }>
                                    { LocalizeText(isRoomMuted ? 'navigator.muteall_on' : 'navigator.muteall_off') }
                                </Button>
                            }
							<Flex justifyContent="center" alignItems="center">
                                <Button className="col-8 mt-2 mb-2 btn-danger" onClick={ () => processAction('report_room') }>
                                    <Base className="flex-shrink-0 icon icon-report-room" />
                                    <Base className="vr" />
                                    <b className="px-2">{ LocalizeText('help.emergency.main.report.room') }</b>
                                </Button>
                            </Flex>
                        </Column>
                    </>
                }

            </NitroCardContentView>
        </NitroCardView>
    );
};
