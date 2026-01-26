import { RoomDataParser } from '@nitrots/nitro-renderer';
import React, { FC, MouseEvent, useEffect, useRef } from 'react';
import { FaUser } from 'react-icons/fa';
import { CreateRoomSession, DoorStateType, GetSessionDataManager, TryVisitRoom } from '../../../../api';
import {
    Base,
    Column,
    Flex,
    LayoutBadgeImageView,
    LayoutGridItemProps,
    LayoutRoomThumbnailView,
    Text
} from '../../../../common';
import { useNavigator } from '../../../../hooks';
import { NavigatorSearchResultItemInfoView } from './NavigatorSearchResultItemInfoView';

export interface NavigatorSearchResultItemViewProps extends LayoutGridItemProps
{
    roomData: RoomDataParser
    thumbnail?: boolean
    selectedRoomId?: number | null;
    setSelectedRoomId?: React.Dispatch<React.SetStateAction<number | null>>;
    isPopoverActive?: boolean;
    setIsPopoverActive?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavigatorSearchResultItemView: FC<NavigatorSearchResultItemViewProps> = props =>
{
    const { roomData = null, children = null, thumbnail = false, selectedRoomId, setSelectedRoomId, isPopoverActive, setIsPopoverActive, ...rest } = props;
    const { setDoorData = null } = useNavigator();

    const handleMouseEnter = () =>
    {
        if(isPopoverActive && setSelectedRoomId)
        {
            setSelectedRoomId(roomData.roomId);
        }
    };

    const handleMouseLeave = () =>
    {
        if(setSelectedRoomId && setIsPopoverActive)
        {
            setSelectedRoomId(null);
            setIsPopoverActive(false);
        }
    };

    const handleInfoClick = (e: React.MouseEvent) =>
    {
        e.preventDefault();
        e.stopPropagation();

        if(setIsPopoverActive && setSelectedRoomId)
        {
            if(!isPopoverActive)
            {
                setSelectedRoomId(roomData.roomId);
                setIsPopoverActive(true);
            }
            else if(selectedRoomId === roomData.roomId)
            {
                setSelectedRoomId(null);
                setIsPopoverActive(false);
            }
            else
            {
                setSelectedRoomId(roomData.roomId);
            }
        }
    };

    useEffect(() =>
    {
        const handleClickOutside = (event: Event) =>
        {
            const target = event.target as HTMLElement;
            const navigatorItem = target.closest('.navigator-item');

            if(!navigatorItem && setIsPopoverActive && setSelectedRoomId)
            {
                setIsPopoverActive(false);
                setSelectedRoomId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [ setIsPopoverActive, setSelectedRoomId ]);

    const getUserCounterColor = () =>
    {
        const num: number = (100 * (roomData.userCount / roomData.maxUserCount));

        let bg = 'badge-empty';

        if(num >= 92)
        {
            bg = 'badge-danger';
        }
        else if(num >= 50)
        {
            bg = 'badge-warning';
        }
        else if(num > 0)
        {
            bg = 'badge-success';
        }

        return bg;
    }

    const visitRoom = (event: MouseEvent) =>
    {
        if(roomData.ownerId !== GetSessionDataManager().userId)
        {
            if(roomData.habboGroupId !== 0)
            {
                TryVisitRoom(roomData.roomId);

                return;
            }

            switch(roomData.doorMode)
            {
                case RoomDataParser.DOORBELL_STATE:
                    setDoorData(prevValue =>
                    {
                        const newValue = { ...prevValue };

                        newValue.roomInfo = roomData;
                        newValue.state = DoorStateType.START_DOORBELL;

                        return newValue;
                    });
                    return;
                case RoomDataParser.PASSWORD_STATE:
                    setDoorData(prevValue =>
                    {
                        const newValue = { ...prevValue };

                        newValue.roomInfo = roomData;
                        newValue.state = DoorStateType.START_PASSWORD;

                        return newValue;
                    });
                    return;
            }
        }

        CreateRoomSession(roomData.roomId);
    }


    if(thumbnail) return (
        <Column pointer overflow="hidden" alignItems="center" onClick={ visitRoom } onMouseEnter={ handleMouseEnter } onMouseLeave={ handleMouseLeave } gap={ 0 } className="nav-thumbnail p-1 rounded-3 small mb-1 flex-column" { ...rest }>
            <LayoutRoomThumbnailView roomId={ roomData.roomId } customUrl={ roomData.officialRoomPicRef } className="d-flex flex-column align-items-center justify-content-end mb-1">
                { roomData.habboGroupId > 0 && <LayoutBadgeImageView badgeCode={ roomData.groupBadgeCode } isGroup={ true } className={ 'position-absolute top-0 start-0 m-1' } /> }
                <Flex center className={ 'badge p-1 position-absolute m-1 ' + getUserCounterColor() } gap={ 1 }>
                    <FaUser className="fa-icon" />
                    { roomData.userCount }
                </Flex>
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) &&
                <i className={ ('position-absolute end-0 mb-1 me-1 icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) } /> }
            </LayoutRoomThumbnailView>
            <Flex className="w-100">
                <Text truncate className="flex-grow-1">{ roomData.roomName }</Text>
                <Flex reverse alignItems="center" gap={ 1 }>
                    <NavigatorSearchResultItemInfoView isVisible={ selectedRoomId === roomData.roomId } onToggle={ handleInfoClick } setIsPopoverActive={ setIsPopoverActive } roomData={ roomData } />
                </Flex>
                { children }
            </Flex>

        </Column>
    );

    return (
        <Flex pointer overflow="hidden" alignItems="center" onClick={ visitRoom } onMouseEnter={ handleMouseEnter } onMouseLeave={ handleMouseLeave } gap={ 2 } className="navigator-item px-2 small" { ...rest }>
            <Flex center className={ 'p-1 fw-bold ' + getUserCounterColor() } gap={ 1 }>
                <div className="nav-avatar-icon"/>
                { roomData.userCount }
            </Flex>
            <Text truncate grow>{ roomData.roomName }</Text>
            <Flex reverse alignItems="center" gap={ 1 }>
                <NavigatorSearchResultItemInfoView isVisible={ selectedRoomId === roomData.roomId && isPopoverActive } onToggle={ handleInfoClick } setIsPopoverActive={ setIsPopoverActive } roomData={ roomData } />
                { roomData.habboGroupId > 0 && <i className="icon icon-navigator-room-group" /> }
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) &&
                    <i className={ ('icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) } /> }
            </Flex>
            { children }
        </Flex>
    );
}