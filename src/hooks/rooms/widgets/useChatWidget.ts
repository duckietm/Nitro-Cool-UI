import { AvatarFigurePartType, AvatarScaleType, AvatarSetType, GetGuestRoomResultEvent, NitroPoint, PetFigureData, RoomChatSettings, RoomChatSettingsEvent, RoomDragEvent, RoomObjectCategory, RoomObjectType, RoomObjectVariable, RoomSessionChatEvent, SystemChatStyleEnum, TextureUtils, Vector3d } from '@nitrots/nitro-renderer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatBubbleMessage, ChatEntryType, ChatHistoryCurrentDate, GetAvatarRenderManager, GetConfiguration, GetRoomEngine, GetRoomObjectScreenLocation, IRoomChatSettings, LocalizeText, PlaySound, RoomChatFormatter } from '../../../api';
import { useMessageEvent, useRoomEngineEvent, useRoomSessionManagerEvent } from '../../events';
import { useRoom } from '../useRoom';
import { useChatHistory } from './../../chat-history';

const avatarColorCache: Map<string, number> = new Map();
const avatarImageCache: Map<string, string> = new Map();
const petImageCache: Map<string, string> = new Map();

const useChatWidgetState = () =>
{
    const [ chatMessages, setChatMessages ] = useState<ChatBubbleMessage[]>([]);
    const [ chatSettings, setChatSettings ] = useState<IRoomChatSettings>({
        mode: RoomChatSettings.CHAT_MODE_FREE_FLOW,
        weight: RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL,
        speed: RoomChatSettings.CHAT_SCROLL_SPEED_NORMAL,
        distance: 50,
        protection: RoomChatSettings.FLOOD_FILTER_NORMAL
    });
    const [ hasRoomLoaded, setHasRoomLoaded ] = useState(false);
    const [ isInitialLoadDelayActive, setIsInitialLoadDelayActive ] = useState(false);
    const { roomSession = null } = useRoom();
    const { addChatEntry } = useChatHistory();
    const isDisposed = useRef(false);
    const isDelayingPetChats = useRef(false); // Synchronous flag to track delay period
    const isFirstRoomLoad = useRef(true); // Track if this is the first room load in the session
    const isWaitingForRoomEntry = useRef(true); // Track if we're waiting for GetGuestRoomResultEvent

    const getScrollSpeed = useMemo(() =>
    {
        if(!chatSettings) return 6000;

        switch(chatSettings.speed)
        {
            case RoomChatSettings.CHAT_SCROLL_SPEED_FAST:
                return 3000;
            case RoomChatSettings.CHAT_SCROLL_SPEED_NORMAL:
                return 6000;
            case RoomChatSettings.CHAT_SCROLL_SPEED_SLOW:
                return 12000;
        }
    }, [ chatSettings ]);

    const setFigureImage = (figure: string, username: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const avatarImage = GetAvatarRenderManager().createAvatarImage(figure, AvatarScaleType.LARGE, null, {
                resetFigure: figure => {
                    if (isDisposed.current) return;
                    setFigureImage(figure, username);
                },
                dispose: () => {},
                disposed: false
            });

            if (!avatarImage) {
                resolve(null);
                return;
            }

            avatarImage.getCroppedImage(AvatarSetType.HEAD).then(image => {
                if (!image || !image.src) {
                    avatarImage.dispose();
                    resolve(null);
                    return;
                }

                const color = avatarImage.getPartColor(AvatarFigurePartType.CHEST);

                avatarColorCache.set(figure, ((color && color.rgb) || 16777215));
                avatarImageCache.set(figure, image.src);

                setChatMessages(prevValue => {
                    const updatedMessages = prevValue.map(chat => {
                        if (chat.username === username && chat.imageUrl !== image.src) {
                            chat.imageUrl = image.src;
                            return { ...chat };
                        }
                        return chat;
                    });
                    return updatedMessages;
                });

                avatarImage.dispose();
                resolve(image.src);
            }).catch(error => {
                console.log(`Error generating avatar image for figure ${figure}:`, error);
                avatarImage.dispose();
                resolve(null);
            });
        });
    };

    const getUserImage = async (figure: string, username: string): Promise<string | null> => {
        let existing = avatarImageCache.get(figure);

        if (!existing) {
            const src = await setFigureImage(figure, username);
            if (src) {
                avatarImageCache.set(figure, src);
                return src;
            }
            return null;
        }

        return existing;
    };

    const getPetImage = async (figure: string, direction: number, _arg_3: boolean, scale: number = 64, posture: string = null): Promise<string | null> => {
        const cacheKey = (figure + posture);
        let existing = petImageCache.get(cacheKey);

        if (existing) return existing;

        const figureData = new PetFigureData(figure);
        const typeId = figureData.typeId;

        let image = GetRoomEngine().getRoomObjectPetImage(typeId, figureData.paletteId, figureData.color, new Vector3d((direction * 45)), scale, null, false, 0, figureData.customParts, posture);

        if (!image) {
            image = GetRoomEngine().getRoomObjectPetImage(typeId, figureData.paletteId, figureData.color, new Vector3d(90), 64, null, false, 0, figureData.customParts, null);
        }

        if (image) {
            const imageUrl = await TextureUtils.generateImageUrl(image.data);
            if (imageUrl) {
                petImageCache.set(cacheKey, imageUrl);
                console.log(`Pet image generated successfully: ${imageUrl}`);
                return imageUrl;
            } else {
                console.log(`Failed to generate image URL for pet: typeId=${typeId}`);
                petImageCache.delete(cacheKey);
            }
        } else {
            console.log(`Pet image generation failed for typeId ${typeId}`);
            petImageCache.delete(cacheKey);
        }

        return null;
    };

    const processChatEvent = async (event: RoomSessionChatEvent) => {
        const roomObject = GetRoomEngine().getRoomObject(roomSession.roomId, event.objectId, RoomObjectCategory.UNIT);
        const bubbleLocation = roomObject ? GetRoomObjectScreenLocation(roomSession.roomId, roomObject?.id, RoomObjectCategory.UNIT) : new NitroPoint();
        const userData = roomObject ? roomSession.userDataManager.getUserDataByIndex(event.objectId) : new RoomUserData(-1);

        let username = '';
        let avatarColor = 0;
        let imageUrl: string | null = null;
        let chatType = event.chatType;
        let styleId = event.style;
        let userType = 0;
        let petType = -1;
        let text = event.message;
        let chatColours = event._chatColours;

        if(userData)
        {
            userType = userData.type;
            const figure = userData.figure;

            switch(userType)
            {
                case RoomObjectType.PET:
                    imageUrl = await getPetImage(figure, 2, true, 64, roomObject?.model.getValue<string>(RoomObjectVariable.FIGURE_POSTURE));
                    petType = new PetFigureData(figure).typeId;
                    chatColours = "black";
                    break;
                case RoomObjectType.USER:
                    imageUrl = await getUserImage(figure, userData.name);
                    break;
                case RoomObjectType.RENTABLE_BOT:
                case RoomObjectType.BOT:
                    styleId = SystemChatStyleEnum.BOT;
                    chatColours = "black";
                    break;
            }

            avatarColor = avatarColorCache.get(figure);
            username = userData.name;
        }

        switch(chatType)
        {
            case RoomSessionChatEvent.CHAT_TYPE_RESPECT:
				styleId = 38;
                text = LocalizeText('widgets.chatbubble.respect', [ 'username' ], [ username ]);
                if(GetConfiguration('respect.options')['enabled']) PlaySound(GetConfiguration('respect.options')['sound']);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_PETREVIVE:
            case RoomSessionChatEvent.CHAT_TYPE_PET_REBREED_FERTILIZE:
            case RoomSessionChatEvent.CHAT_TYPE_PET_SPEED_FERTILIZE: {
                let textKey = 'widget.chatbubble.petrevived';
				styleId = 38;
                if(chatType === RoomSessionChatEvent.CHAT_TYPE_PET_REBREED_FERTILIZE)
                {
                    textKey = 'widget.chatbubble.petrefertilized;';
                }
                else if(chatType === RoomSessionChatEvent.CHAT_TYPE_PET_SPEED_FERTILIZE)
                {
                    textKey = 'widget.chatbubble.petspeedfertilized';
                }
                let targetUserName: string = null;
                const newRoomObject = GetRoomEngine().getRoomObject(roomSession.roomId, event.extraParam, RoomObjectCategory.UNIT);
                if(newRoomObject)
                {
                    const newUserData = roomSession.userDataManager.getUserDataByIndex(roomObject.id);
                    if(newUserData) targetUserName = newUserData.name;
                }
                text = LocalizeText(textKey, [ 'petName', 'userName' ], [ username, targetUserName ]);
                break;
            }
            case RoomSessionChatEvent.CHAT_TYPE_PETRESPECT:
				styleId = 38;
                text = LocalizeText('widget.chatbubble.petrespect', [ 'petname' ], [ username ]);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_PETTREAT:
				styleId = 38;
                text = LocalizeText('widget.chatbubble.pettreat', [ 'petname' ], [ username ]);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_HAND_ITEM_RECEIVED:
				styleId = 38;
                text = LocalizeText('widget.chatbubble.handitem', [ 'username', 'handitem' ], [ username, LocalizeText(('handitem' + event.extraParam)) ]);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_MUTE_REMAINING: {
				styleId = 38;
                const hours = ((event.extraParam > 0) ? Math.floor((event.extraParam / 3600)) : 0).toString();
                const minutes = ((event.extraParam > 0) ? Math.floor((event.extraParam % 3600) / 60) : 0).toString();
                const seconds = (event.extraParam % 60).toString();
                text = LocalizeText('widget.chatbubble.mutetime', [ 'hours', 'minutes', 'seconds' ], [ hours, minutes, seconds ]);
                break;
            }
        }

        const formattedText = RoomChatFormatter(text);
        const color = (avatarColor && (('#' + (avatarColor.toString(16).padStart(6, '0'))) || null));

        const chatMessage = new ChatBubbleMessage(
            userData.roomIndex,
            RoomObjectCategory.UNIT,
            roomSession.roomId,
            text,
            formattedText,
            username,
            new NitroPoint(bubbleLocation.x, bubbleLocation.y),
            chatType,
            styleId,
            imageUrl,
            color,
            chatColours
        );

        (chatMessage as any).userType = userType;

        setChatMessages(prevValue => [ ...prevValue, chatMessage ]);
        addChatEntry({ id: -1, webId: userData.webID, entityId: userData.roomIndex, name: username, imageUrl, style: styleId, chatType: chatType, entityType: userData.type, message: formattedText, timestamp: ChatHistoryCurrentDate(), type: ChatEntryType.TYPE_CHAT, roomId: roomSession.roomId, color, chatColours });
    };

    useRoomSessionManagerEvent<RoomSessionChatEvent>(RoomSessionChatEvent.CHAT_EVENT, async event =>
    {
        if (!roomSession) return;

        const userData = GetRoomEngine().getRoomObject(roomSession.roomId, event.objectId, RoomObjectCategory.UNIT) 
            ? roomSession.userDataManager.getUserDataByIndex(event.objectId) 
            : new RoomUserData(-1);
        const userType = userData?.type;

        // Discard pet chats until room entry is confirmed and delay is processed
        if (userType === RoomObjectType.PET) {
            if (isWaitingForRoomEntry.current || (isFirstRoomLoad.current && isDelayingPetChats.current)) {
                console.log(`Discarding pet chat event for objectId ${event.objectId} until room entry is confirmed or delay ends`);
                return;
            }
        }

        // Process all chats immediately after room entry and initial delay (if applicable)
        await processChatEvent(event);
    });

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event =>
    {
        const parser = event.getParser();

        console.log(`GetGuestRoomResultEvent received, roomEnter: ${parser.roomEnter}`);

        if(!parser.roomEnter) return;

        setChatSettings(parser.chat);

        // Room entry confirmed, stop waiting
        isWaitingForRoomEntry.current = false;
        console.log('Room entry confirmed via GetGuestRoomResultEvent');

        if (!hasRoomLoaded) {
            setHasRoomLoaded(true);

            // Apply delay only for the first room load
            if (isFirstRoomLoad.current) {
                isDelayingPetChats.current = true;
                setIsInitialLoadDelayActive(true);
                console.log('First room loaded in useRoom.ts, starting 5-second delay for pet chat events');

                // After 5 seconds, stop delaying pet chats
                setTimeout(() => {
                    console.log('Initial 5-second delay ended');
                    isDelayingPetChats.current = false;
                    setIsInitialLoadDelayActive(false);
                    isFirstRoomLoad.current = false; // Mark that the first room has been loaded
                }, 5000);
            } else {
                // For subsequent rooms, no delay is applied
                console.log('Subsequent room loaded, no delay for pet chat events');
            }
        }
    });

    // Fallback timeout to stop waiting if GetGuestRoomResultEvent doesn't fire
    useEffect(() => {
        if (isWaitingForRoomEntry.current) {
            const timeout = setTimeout(() => {
                console.log('Fallback timeout: GetGuestRoomResultEvent not received within 10 seconds, assuming room entry');
                isWaitingForRoomEntry.current = false;
                if (!hasRoomLoaded) {
                    setHasRoomLoaded(true);
                    if (isFirstRoomLoad.current) {
                        isDelayingPetChats.current = true;
                        setIsInitialLoadDelayActive(true);
                        console.log('First room assumed loaded (fallback), starting 5-second delay for pet chat events');
                        setTimeout(() => {
                            console.log('Initial 5-second delay ended (fallback)');
                            isDelayingPetChats.current = false;
                            setIsInitialLoadDelayActive(false);
                            isFirstRoomLoad.current = false;
                        }, 5000);
                    } else {
                        console.log('Subsequent room assumed loaded (fallback), no delay for pet chat events');
                    }
                }
            }, 10000); // Wait 10 seconds for GetGuestRoomResultEvent
            return () => clearTimeout(timeout);
        }
    }, []);

    useMessageEvent<RoomChatSettingsEvent>(RoomChatSettingsEvent, event =>
    {
        const parser = event.getParser();

        setChatSettings(parser.chat);
    });

    useRoomEngineEvent<RoomDragEvent>(RoomDragEvent.ROOM_DRAG, event =>
    {
        if(!chatMessages.length || (event.roomId !== roomSession.roomId)) return;

        const offsetX = event.offsetX;

        chatMessages.forEach(chat => (chat.elementRef && (chat.left += offsetX)));
    });

    useEffect(() =>
    {
        isDisposed.current = false;

        return () =>
        {
            isDisposed.current = true;
            isDelayingPetChats.current = false;
            isWaitingForRoomEntry.current = true; // Reset for next room load
            setHasRoomLoaded(false);
            setIsInitialLoadDelayActive(false);
        };
    }, []);

    return { chatMessages, setChatMessages, chatSettings, getScrollSpeed };
};

export const useChatWidget = useChatWidgetState;