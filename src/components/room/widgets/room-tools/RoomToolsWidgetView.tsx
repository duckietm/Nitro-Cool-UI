import { CreateLinkEvent, GetGuestRoomResultEvent, GetRoomEngine, NavigatorSearchComposer, RateFlatMessageComposer } from '@nitrots/nitro-renderer';
import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '../../../../layout';
import { FC, useEffect, useState } from 'react';
import { GetConfigurationValue, LocalizeText, SendMessageComposer, SetLocalStorage, TryVisitRoom } from '../../../../api';
import { Text } from '../../../../common';
import { useMessageEvent, useNavigator, useRoom } from '../../../../hooks';

export const RoomToolsWidgetView: FC<{}> = props => {
    const [areBubblesMuted, setAreBubblesMuted] = useState(false);
    const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string>(null);
    const [roomOwner, setRoomOwner] = useState<string>(null);
    const [roomTags, setRoomTags] = useState<string[]>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
    const [roomHistory, setRoomHistory] = useState<{ roomId: number, roomName: string }[]>([]);
    const { navigatorData = null } = useNavigator();
    const { roomSession = null } = useRoom();

    const handleToolClick = (action: string, value?: string) => {
        switch (action) {
            case 'settings':
                CreateLinkEvent('navigator/toggle-room-info');
                return;
            case 'zoom':
                setIsZoomedIn(prevValue => {
                    if (GetConfigurationValue('room.zoom.enabled', true)) {
                        const scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);
                        GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, scale === 1 ? 0.5 : 1);
                    } else {
                        const geometry = GetRoomEngine().getRoomInstanceGeometry(roomSession.roomId, 1);
                        if (geometry) geometry.performZoom();
                    }
                    return !prevValue;
                });
                return;
            case 'chat_history':
                CreateLinkEvent('chat-history/toggle');
                return;
            case 'hiddenbubbles':
                CreateLinkEvent('nitrobubblehidden/toggle');
                setAreBubblesMuted(prev => !prev);
                return;
            case 'like_room':
                SendMessageComposer(new RateFlatMessageComposer(1));
                return;
            case 'toggle_room_link':
                CreateLinkEvent('navigator/toggle-room-link');
                return;
            case 'navigator_search_tag':
                CreateLinkEvent(`navigator/search/${value}`);
                SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${value}`));
                return;
            case 'room_history':
                if (roomHistory.length > 0) setIsOpenHistory(prev => !prev);
                return;
            case 'room_history_back':
                const prevIndex = roomHistory.findIndex(room => room.roomId === navigatorData.currentRoomId) - 1;
                if (prevIndex >= 0) TryVisitRoom(roomHistory[prevIndex].roomId);
                return;
            case 'room_history_next':
                const nextIndex = roomHistory.findIndex(room => room.roomId === navigatorData.currentRoomId) + 1;
                if (nextIndex < roomHistory.length) TryVisitRoom(roomHistory[nextIndex].roomId);
                return;
        }
    };

    const onChangeRoomHistory = (roomId: number, roomName: string) => {
        let newStorage = JSON.parse(window.localStorage.getItem('nitro.room.history') || '[]');
        if (newStorage.some((room: { roomId: number }) => room.roomId === roomId)) return;

        if (newStorage.length >= 10) newStorage.shift();
        newStorage = [...newStorage, { roomId, roomName }];

        setRoomHistory(newStorage);
        SetLocalStorage('nitro.room.history', newStorage);
    };

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event => {
        const parser = event.getParser();
        if (!parser.roomEnter || (parser.data.roomId !== roomSession.roomId)) return;

        if (roomName !== parser.data.roomName) setRoomName(parser.data.roomName);
        if (roomOwner !== parser.data.ownerName) setRoomOwner(parser.data.ownerName);
        if (roomTags !== parser.data.tags) setRoomTags(parser.data.tags);
        onChangeRoomHistory(parser.data.roomId, parser.data.roomName);
    });

    useEffect(() => {
        setIsOpen(true);
        const timeout = setTimeout(() => setIsOpen(false), 5000);
        return () => clearTimeout(timeout);
    }, [roomName, roomOwner, roomTags]);

    useEffect(() => {
        setRoomHistory(JSON.parse(window.localStorage.getItem('nitro.room.history') || '[]'));
    }, []);

    useEffect(() => {
        const handleTabClose = () => {
            window.localStorage.removeItem('nitro.room.history');
        };
        window.addEventListener('beforeunload', handleTabClose);
        return () => window.removeEventListener('beforeunload', handleTabClose);
    }, []);

    return (
        <div className="flex space-x-2 nitro-room-tools-container">
            <div className="flex flex-col items-center justify-center p-2 nitro-room-tools">
				<div className="cursor-pointer nitro-icon icon-cog" title={LocalizeText('room.settings.button.text')} onClick={() => handleToolClick('settings')} />
                <div className={classNames('cursor-pointer', 'nitro-icon', (!isZoomedIn && 'icon-zoom-less'), (isZoomedIn && 'icon-zoom-more'))} title={LocalizeText('room.zoom.button.text')} onClick={() => handleToolClick('zoom')} />
                <div className="cursor-pointer nitro-icon icon-chat-history" title={LocalizeText('room.chathistory.button.text')} onClick={() => handleToolClick('chat_history')} />
				<div className={classNames('cursor-pointer', 'nitro-icon', (areBubblesMuted ? 'icon-chat-disablebubble' : 'icon-chat-enablebubble'))} title={areBubblesMuted ? LocalizeText('room.unmute.button.text') : LocalizeText('room.mute.button.text')} onClick={() => handleToolClick('hiddenbubbles')} />
                
                {navigatorData.canRate && (
                    <div className="cursor-pointer nitro-icon icon-like-room" title={LocalizeText('room.like.button.text')} onClick={() => handleToolClick('like_room')} />
                )}
                <div className="cursor-pointer nitro-icon icon-room-link" title={LocalizeText('navigator.embed.caption')} onClick={() => handleToolClick('toggle_room_link')} />
                <div className="cursor-pointer nitro-icon icon-room-history-enabled" title={LocalizeText('room.history.button.tooltip')} onClick={() => handleToolClick('room_history')} />
            </div>
            <div className="flex flex-col justify-center">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ x: -100 }} animate={{ x: 0 }} exit={{ x: -100 }} transition={{ duration: 0.3 }}>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex flex-col px-3 py-2 rounded nitro-room-tools-info">
                                    <div className="flex flex-col gap-1">
                                        <Text wrap fontSize={4} variant="white">{roomName}</Text>
                                        <Text fontSize={5} variant="gray">{roomOwner}</Text>
                                    </div>
                                    {roomTags && roomTags.length > 0 && (
                                        <div className="flex gap-2">
                                            {roomTags.map((tag, index) => (
                                                <Text key={index} pointer small className="p-1 rounded bg-primary" variant="white" onClick={() => handleToolClick('navigator_search_tag', tag)}>
                                                    #{tag}
                                                </Text>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {isOpenHistory && (
                        <motion.div initial={{ x: -100 }} animate={{ x: 0 }} exit={{ x: -100 }} transition={{ duration: 0.3 }} className="nitro-room-tools-history">
                            <div className="flex flex-col px-3 py-2 rounded nitro-room-history">
                                {roomHistory.map(history => (
                                    <Text key={history.roomId} bold={history.roomId === navigatorData.currentRoomId} variant={history.roomId === navigatorData.currentRoomId ? 'white' : 'muted'} pointer onClick={() => TryVisitRoom(history.roomId)}>
                                        {history.roomName}
                                    </Text>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};