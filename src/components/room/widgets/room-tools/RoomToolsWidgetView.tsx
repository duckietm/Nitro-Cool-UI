import { CreateLinkEvent, GetGuestRoomResultEvent, GetRoomEngine, NavigatorSearchComposer, RateFlatMessageComposer } from '@nitrots/nitro-renderer';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useEffect, useState } from 'react';
import { LocalizeText, SendMessageComposer } from '../../../../api';
import { Text } from '../../../../common';
import { useMessageEvent, useNavigator, useRoom } from '../../../../hooks';
import { classNames } from '../../../../layout';

export const RoomToolsWidgetView: FC<{}> = () => {
    const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [roomOwner, setRoomOwner] = useState<string | null>(null);
    const [roomTags, setRoomTags] = useState<string[] | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { navigatorData = null } = useNavigator();
    const { roomSession = null } = useRoom();

    const handleToolClick = useCallback((action: string, value?: string) => {
        if (!roomSession?.roomId) return;

        switch (action) {
            case 'settings':
                CreateLinkEvent('navigator/toggle-room-info');
                break;
            case 'zoom':
                setIsZoomedIn(prevValue => {
                    const scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);
                    const newScale = prevValue ? scale * 2 : scale / 2;
                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, newScale);
                    return !prevValue;
                });
                break;
            case 'chat_history':
                CreateLinkEvent('chat-history/toggle');
                break;
            case 'like_room':
                SendMessageComposer(new RateFlatMessageComposer(1));
                break;
            case 'toggle_room_link':
                CreateLinkEvent('navigator/toggle-room-link');
                break;
            case 'navigator_search_tag':
                if (value) {
                    CreateLinkEvent(`navigator/search/${value}`);
                    SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${value}`));
                }
                break;
            default:
                break;
        }
    }, [roomSession]);

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event => {
        const parser = event.getParser();
        if (!parser.roomEnter || parser.data.roomId !== roomSession?.roomId) return;

        setRoomName(prev => prev !== parser.data.roomName ? parser.data.roomName : prev);
        setRoomOwner(prev => prev !== parser.data.ownerName ? parser.data.ownerName : prev);
        setRoomTags(prev => prev !== parser.data.tags ? parser.data.tags : prev);
    });

    useEffect(() => {
        if (!roomName && !roomOwner && !roomTags) return;

        setIsOpen(true);
        const timeout = setTimeout(() => setIsOpen(false), 5000);

        return () => clearTimeout(timeout);
    }, [roomName, roomOwner, roomTags]);

    if (!roomSession) return null;

    return (
        <div className="flex gap-2 nitro-room-tools-container">
            <div className="flex flex-col items-center justify-center p-2 nitro-room-tools">
                <div 
                    className="cursor-pointer nitro-icon icon-cog" 
                    title={LocalizeText('room.settings.button.text')} 
                    onClick={() => handleToolClick('settings')} 
                />
                <div 
                    className={classNames('cursor-pointer', 'icon', !isZoomedIn && 'icon-zoom-less', isZoomedIn && 'icon-zoom-more')} 
                    title={LocalizeText('room.zoom.button.text')} 
                    onClick={() => handleToolClick('zoom')} 
                />
                <div 
                    className="cursor-pointer nitro-icon icon-chat-history" 
                    title={LocalizeText('room.chathistory.button.text')} 
                    onClick={() => handleToolClick('chat_history')} 
                />
                {navigatorData?.canRate && (
                    <div 
                        className="cursor-pointer nitro-icon icon-like-room" 
                        title={LocalizeText('room.like.button.text')} 
                        onClick={() => handleToolClick('like_room')} 
                    />
                )}
            </div>
            <div className="flex flex-col justify-center">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }}>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex flex-col px-3 py-2 rounded nitro-room-tools-info">
                                    <div className="flex flex-col gap-1">
                                        <Text wrap fontSize={4} variant="white">{roomName}</Text>
                                        <Text fontSize={5} variant="muted">{roomOwner}</Text>
                                    </div>
                                    {roomTags?.length > 0 && (
                                        <div className="flex gap-2">
                                            {roomTags.map((tag, index) => (
                                                <Text key={index} pointer small className="p-1 rounded bg-primary"  variant="white" onClick={() => handleToolClick('navigator_search_tag', tag)}>
                                                    #{tag}
                                                </Text>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};