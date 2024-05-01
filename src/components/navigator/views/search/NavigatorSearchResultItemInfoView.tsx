import { RoomDataParser } from '@nitrots/nitro-renderer';
import { FC, useEffect, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import { LocalizeText } from '../../../../api';
import { Base, Column, Flex, LayoutBadgeImageView, LayoutRoomThumbnailView, NitroCardContentView, Text, UserProfileIconView } from '../../../../common';

interface NavigatorSearchResultItemInfoViewProps
{
    roomData: RoomDataParser;
}

export const NavigatorSearchResultItemInfoView: FC<NavigatorSearchResultItemInfoViewProps> = props =>
{
    const { roomData = null } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const elementRef = useRef<HTMLDivElement>();
    const [ showProfile, setShowProfile ] = useState(false);

    useEffect(() =>
    {
        if (showProfile)
        {
            setIsVisible(false);
        }
    }, [ showProfile ]);

    useEffect(() =>
    {
        // add when mounted
        document.addEventListener('mousedown', handleClick);
        // return function to be called when unmounted
        return () =>
        {
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);

    const handleClick = e =>
    {
        if (elementRef.current.contains(e.target))
        {
            // inside click
            return;
        }
        // outside click
        setIsVisible(false);
    };

    const getUserCounterColor = () =>
    {
        const num: number = (100 * (roomData.userCount / roomData.maxUserCount));

        let bg = 'bg-primary';

        if(num >= 92)
        {
            bg = 'bg-danger';
        }
        else if(num >= 50)
        {
            bg = 'bg-warning';
        }
        else if(num > 0)
        {
            bg = 'bg-success';
        }

        return bg;
    }

    return (
        <>
            <Base pointer innerRef={ elementRef } className="icon icon-navigator-info" onClick={ event =>
            {
                isVisible || showProfile ? setIsVisible(false) : setIsVisible(true);
                event.stopPropagation();
            } } />
            <Overlay show={ isVisible } target={ elementRef.current } placement="right" rootClose={ true } >
                <Popover>
                    <NitroCardContentView overflow="hidden" className="room-info bg-transparent">
                        <Flex gap={ 2 } overflow="hidden" className="room-info-bg p-2">
                            <LayoutRoomThumbnailView roomId={ roomData.roomId } customUrl={ roomData.officialRoomPicRef } className="d-flex flex-column align-items-center justify-content-end mb-1"> 
                                { roomData.habboGroupId > 0 && (
                                    <LayoutBadgeImageView badgeCode={ roomData.groupBadgeCode } isGroup={ true } className={ 'position-absolute top-0 start-0 m-1 ' }/>) }
                                { roomData.doorMode !== RoomDataParser.OPEN_STATE && (
                                    <i className={ 'position-absolute end-0 mb-1 me-1 icon icon-navigator-room-' + (roomData.doorMode === RoomDataParser.DOORBELL_STATE ? 'locked' : roomData.doorMode === RoomDataParser.PASSWORD_STATE ? 'password' : roomData.doorMode === RoomDataParser.INVISIBLE_STATE ? 'invisible' : '') }/> ) }
                            </LayoutRoomThumbnailView>
                            <Column gap={ 1 }>
                                <Text bold truncate className="flex-grow-1" style={ { maxHeight: 13 } }>
                                    { roomData.roomName }
                                </Text>
                                <Flex gap={ 2 }>
                                    <Text italics variant="muted">
                                        { LocalizeText('navigator.roomownercaption') }
                                    </Text>
                                    <Flex alignItems="center" gap={ 1 }>
                                        <UserProfileIconView userId={ roomData.ownerId } onClick={ event =>
                                        {
                                            setShowProfile(true);
                                        } } />
                                        <Text italics>{ roomData.ownerName }</Text>
                                    </Flex>
                                </Flex>
                                <Text className="flex-grow-1">
                                    { roomData.description }
                                </Text>
                                <Flex className={ 'badge p-1 position-absolute m-1 bottom-0 end-0 m-2 ' + getUserCounterColor() } gap={ 1 }>
                                    <FaUser className="fa-icon" />
                                    { roomData.userCount }
                                </Flex>
                            </Column>
                        </Flex>
                        <Column>
                            <Flex>
                                <Flex gap={ 1 } className="align-items-center">
                                    <UserProfileIconView userId={ roomData.ownerId }/>
                                    <Text bold underline>{ roomData.ownerName }</Text>
                                </Flex>
                                <Flex gap={ 1 } className="align-items-center" justifyContent="end" fullWidth>
                                    <i className="icon icon-navigator-room-group"/>
                                    <Text bold underline>{ roomData.groupName }</Text>
                                </Flex>
                            </Flex>
                            <Flex gap={ 1 }>
                                <Text bold>{ LocalizeText('navigator.roompopup.property.max_users') }</Text>
                                <Text>{ roomData.maxUserCount }</Text>
                            </Flex>
                        </Column>
                    </NitroCardContentView>
                </Popover>
            </Overlay>
        </>
    );
}
