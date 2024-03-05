import { GetGuestRoomResultEvent, NavigatorSearchComposer, RateFlatMessageComposer, RoomControllerLevel, RoomDataParser } from '@nitrots/nitro-renderer';
import { FC, useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CreateLinkEvent, GetRoomEngine, LocalizeText, SendMessageComposer, SetLocalStorage, TryVisitRoom } from '../../../../api';
import { Base, Column, Flex, Text, TransitionAnimation, TransitionAnimationTypes, classNames } from '../../../../common';
import { useMessageEvent, useNavigator, useRoom } from '../../../../hooks';

export const RoomToolsWidgetView: FC<{}> = props =>
{
    const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string>(null);
    const [roomOwner, setRoomOwner] = useState<string>(null);
    const [roomTags, setRoomTags] = useState<string[]>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [roomHistory, setRoomHistory] = useState<{ roomId: number, roomName: string }[]>([]);
    const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
    const { navigatorData = null } = useNavigator();
    const { roomSession = null } = useRoom();
    const roomHistoryRef = useRef(null);
	
	const roomsetthidebot = () => {
		setIsOpenHistory(false);
		const roomHistoryTool = document.getElementById("roomhistorytool");
		const roomsettnew = document.getElementById("roomsettnew");

		if (roomHistoryTool && roomsettnew) {
			roomHistoryTool.style.display = "none";
			roomsettnew.style.marginLeft = "19px";
		}

		const roomsettshow = document.getElementById("roomsettshow");
		const roomsetthide = document.getElementById("roomsetthide");

		if (roomsettshow && roomsetthide) {
			roomsettshow.style.display = "none";
			roomsetthide.style.display = "block";
		}
	};
	
	const toolroomhidebot = () => {
		setIsOpenHistory(false);
		const roomHistoryTool = document.getElementById("roomhistorytool");
		const roomsettnew = document.getElementById("roomsettnew");

		if (roomHistoryTool && roomsettnew) {
			roomHistoryTool.style.display = "none";
			roomsettnew.style.marginLeft = "-152px";
		}

		const roomsettshow = document.getElementById("roomsettshow");
		const roomsetthide = document.getElementById("roomsetthide");

		if (roomsettshow && roomsetthide) {
			roomsettshow.style.display = "block";
			roomsetthide.style.display = "none";
		}
	};

    const handleToolClick = (action: string, value?: string) => {
        const actions = {
            'settings': () => CreateLinkEvent('navigator/toggle-room-info'),
            'zoom': () => {
                setIsZoomedIn(prevValue => {
                    let scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);

                    if (!prevValue) scale /= 2;
                    else scale *= 2;

                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, scale);

                    return !prevValue;
                });
            },
            'chat_history': () => CreateLinkEvent('chat-history/toggle'),
            'hiddenbubbles': () => {
                CreateLinkEvent('nitrobubblehidden/toggle');
                const bubbleElement = document.getElementById('bubble');
                if (bubbleElement) {
                    bubbleElement.classList.toggle('icon-chat-disablebubble');
                }
            },
            'like_room': () => SendMessageComposer(new RateFlatMessageComposer(1)),
            'toggle_room_link': () => CreateLinkEvent('navigator/toggle-room-link'),
            'navigator_search_tag': (tag: string) => {
                CreateLinkEvent(`navigator/search/${value}`);
                SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${value}`));
            },
            'room_history': () => {
                if (roomHistory.length > 0) {
                    const roomHistoryTool = document.getElementById("roomhistorytool");
                    if (!isOpenHistory) {
                        roomHistoryTool.style.display = "block";
                        setIsOpenHistory(true);
                    } else {
                        setIsOpenHistory(false);
                        roomHistoryTool.style.display = "none";
                    }
                }
            },
            'room_history_back': () => TryVisitRoom(roomHistory[roomHistory.findIndex(room => room.roomId === navigatorData.currentRoomId) - 1].roomId),
            'room_history_next': () => TryVisitRoom(roomHistory[roomHistory.findIndex(room => room.roomId === navigatorData.currentRoomId) + 1].roomId)
        };
        if (actions[action]) {
            actions[action](value);
        }
    };

    const onChangeRoomHistory = (roomId: number, roomName: string) => {
        const newStorage = JSON.parse(window.localStorage.getItem('nitro.room.history')) || [];

        if (newStorage.some(room => room.roomId === roomId)) return;

        if (newStorage.length >= 10) newStorage.shift();

        const newData = [...newStorage, { roomId, roomName }];

        setRoomHistory(newData);
        SetLocalStorage('nitro.room.history', newData);
    };

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event => {
        CreateLinkEvent('nitrobubblehidden/hide');
        const parser = event.getParser();

        if (!parser.roomEnter || (parser.data.roomId !== roomSession.roomId)) return;

        const { roomName, ownerName, tags } = parser.data;

        if (roomName !== roomSession.roomName) {
            setRoomName(roomName);
        }
        if (ownerName !== roomSession.ownerName) {
            setRoomOwner(ownerName);
        }
        if (JSON.stringify(tags) !== JSON.stringify(roomSession.tags)) {
            setRoomTags(tags);
        }

        onChangeRoomHistory(parser.data.roomId, parser.data.roomName);
    });

    useEffect(() => {
        setIsOpen(true);

        const timeout = setTimeout(() => setIsOpen(false), 5000);

        return () => clearTimeout(timeout);
    }, [roomName, roomOwner, roomTags]);

    useEffect(() => {
        setRoomHistory(JSON.parse(window.localStorage.getItem('nitro.room.history')) || []);
    }, []);

    return (
        <Flex className="nitro-room-tools-container" >
            <div className="leftroomhide" id="roomsetthide" onClick={() => toolroomhidebot()} style={{display: "none"}}>
                <FaChevronLeft className="fa-icon iconcenterleftiright" />
            </div>
            <Column center className="nitro-room-tools p-2 d-block" id="roomsettnew" style={{ marginLeft: -152 }}>

                <div className="gridinforooms">
                    <Base pointer title={LocalizeText('room.settings.button.text')} className="iconleftgen icon icon-cog" onClick={() => handleToolClick('settings')} />
                    <div className="texticonright" onClick={() => handleToolClick('settings')} title={LocalizeText('room.settings.button.text')}>{LocalizeText('room.settings.button.text')}</div>
                </div>
                
                <div className="gridinforooms">
                    <Base pointer title={ LocalizeText('room.zoom.button.text') } onClick={ () => handleToolClick('zoom') } className={ classNames('iconleftgen icon', (!isZoomedIn && 'icon-zoom-less'), (isZoomedIn && 'icon-zoom-more')) } />
                    <div className="texticonright" style={{marginLeft: 22}} onClick={ () => handleToolClick('zoom') } title={ LocalizeText('room.zoom.button.text') }>{LocalizeText('room.zoom.button.text')}</div>
                </div>
                
                <div className="gridinforooms">
                    <Base pointer title={ LocalizeText('room.chathistory.button.text') } onClick={ () => handleToolClick('chat_history') } className="iconleftgen icon icon-chat-history" />
                    <div className="texticonright" onClick={ () => handleToolClick('chat_history') } title={ LocalizeText('room.chathistory.button.text') }>{LocalizeText('room.chathistory.button.text')}</div>
                </div>

                <div className="gridinforooms">
                    <Base id="bubble" pointer title={ LocalizeText('room.mute.button.texte') } onClick={ () => handleToolClick('hiddenbubbles') } className="iconleftgen icon icon-chat-enablebubble"/>
                    <div className="texticonright" onClick={ () => handleToolClick('hiddenbubbles') } title={ LocalizeText('room.mute.button.text') }>{LocalizeText('room.mute.button.text')}</div>
                </div>

                { navigatorData.canRate &&
                    <div className="gridinforooms">
                        <Base pointer title={LocalizeText('room.like.button.text')} onClick={() => handleToolClick('like_room')} className="iconleftgen icon icon-like-room" />
                        <div className="texticonright" onClick={() => handleToolClick('like_room')} title={ LocalizeText('room.like.button.text') }>{LocalizeText('room.like.button.text')}</div>
                    </div>
                }
                
                <Flex justifyContent="center">
                    <Base pointer={ roomHistory.length > 1 && roomHistory[0]?.roomId !== navigatorData.currentRoomId } title={ LocalizeText('room.history.button.back.tooltip') } className={ `icon ${ (roomHistory?.length === 0 || roomHistory[0]?.roomId === navigatorData.currentRoomId) ? 'icon-room-history-back-disabled' : 'icon-room-history-back-enabled' }` } onClick={ () => (roomHistory?.length === 0 || roomHistory[0]?.roomId === navigatorData.currentRoomId) ? null : handleToolClick('room_history_back') } />
                    <Base pointer={ roomHistory?.length > 0 } title={ LocalizeText('room.history.button.tooltip') } className={ `icon ${ roomHistory?.length === 0 ? 'icon-room-history-disabled' : 'icon-room-history-enabled' } margin-button-history` } onClick={ () => roomHistory?.length === 0 ? null : handleToolClick('room_history') } />
                    <Base pointer={ roomHistory.length > 1 && roomHistory[roomHistory.length - 1]?.roomId !== navigatorData.currentRoomId } title={ LocalizeText('room.history.button.forward.tooltip') } className={ `icon ${ (roomHistory?.length === 0 || roomHistory[roomHistory.length - 1]?.roomId === navigatorData.currentRoomId) ? 'icon-room-history-next-disabled' : 'icon-room-history-next-enabled' }` } onClick={ () => (roomHistory?.length === 0 || roomHistory[roomHistory.length - 1]?.roomId === navigatorData.currentRoomId) ? null : handleToolClick('room_history_next') } />
                </Flex>
            </Column>
            
            <div className="leftroomhideshow" id="roomsettshow" onClick={() => roomsetthidebot()}>
                <FaChevronRight className="fa-icon" />
            </div>
            <TransitionAnimation type={ TransitionAnimationTypes.SLIDE_LEFT } inProp={ isOpen } timeout={ 200 }>
                <Column className="nitro-room-tools-info rounded py-2 px-3">
                    <Column gap={ 1 }>
                        <Text wrap variant="white" fontSize={ 5 }>{ roomName }</Text>
                        <Text variant="muted" fontSize={ 6 }>{ roomOwner }</Text>
                    </Column>
                    { roomTags && roomTags.length > 0 && <Flex gap={ 2 }>
                        { roomTags.map((tag, index) => <Text key={ index } small pointer variant="white" className="rounded bg-primary p-1" onClick={ () => handleToolClick('navigator_search_tag', tag) }>#{ tag }</Text>) }
                    </Flex>
                    }
                </Column>
            </TransitionAnimation>
            <div className="nitro-room-tools-history" id="roomhistorytool" style={ { display: "none",bottom: !navigatorData.canRate ? '180px' : '210px' } }>
                <TransitionAnimation type={ TransitionAnimationTypes.SLIDE_LEFT } inProp={ isOpenHistory }>
                    <Column center>
                        <Column className="nitro-room-history rounded py-2 px-3">
                            <Column gap={ 1 }> { 
                                (roomHistory.length > 0) && roomHistory.map(history =>
                                    {
                                        return <Text key={ history.roomId } bold={ history.roomId === navigatorData.currentRoomId } variant={ history.roomId === navigatorData.currentRoomId ? 'white' : 'muted' } pointer onClick={ () => TryVisitRoom(history.roomId) }>{ history.roomName }</Text>;
                                    })
                                }
                            </Column>
                        </Column>
                    </Column>
                </TransitionAnimation>
            </div>
        </Flex>
    );
}