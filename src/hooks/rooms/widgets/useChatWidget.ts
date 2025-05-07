import { AvatarFigurePartType, AvatarScaleType, AvatarSetType, GetGuestRoomResultEvent, NitroPoint, PetFigureData, RoomChatSettings, RoomChatSettingsEvent, RoomDragEvent, RoomObjectCategory, RoomObjectType, RoomObjectVariable, RoomSessionChatEvent, RoomUserData, SystemChatStyleEnum, TextureUtils, Vector3d } from '@nitrots/nitro-renderer';
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
    const { roomSession = null } = useRoom();
    const { addChatEntry } = useChatHistory();
    const isDisposed = useRef(false);

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
            console.log('setFigureImage called with figure:', figure, 'username:', username);

            const avatarImage = GetAvatarRenderManager().createAvatarImage(figure, AvatarScaleType.LARGE, null, {
                resetFigure: figure => {
                    if (isDisposed.current) return;
                    setFigureImage(figure, username);
                },
                dispose: () => {},
                disposed: false
            });

            console.log('avatarImage result:', avatarImage);

            if (!avatarImage) {
                console.log('Failed to create avatarImage for figure:', figure);
                resolve('https://via.placeholder.com/40');
                return;
            }

            avatarImage.getCroppedImage(AvatarSetType.HEAD).then(image => {
                console.log('Cropped image:', image, 'Image src:', image?.src);

                if (!image || !image.src) {
                    console.log('Failed to get cropped image or src for figure:', figure);
                    avatarImage.dispose();
                    resolve('https://via.placeholder.com/40');
                    return;
                }

                const color = avatarImage.getPartColor(AvatarFigurePartType.CHEST);
                console.log('Avatar color:', color, 'RGB:', color?.rgb);

                avatarColorCache.set(figure, ((color && color.rgb) || 16777215));
                avatarImageCache.set(figure, image.src);
                console.log('Cached image src:', image.src);

                // Update existing chat messages for this username
                setChatMessages(prevValue => {
                    const updatedMessages = prevValue.map(chat => {
                        if (chat.username === username && chat.imageUrl !== image.src) {
                            chat.imageUrl = image.src; // Update in-place
                            return { ...chat }; // Shallow copy to trigger re-render
                        }
                        return chat;
                    });
                    return updatedMessages;
                });

                avatarImage.dispose();
                resolve(image.src);
            }).catch(error => {
                console.error('Error in setFigureImage:', error);
                avatarImage.dispose();
                resolve('https://via.placeholder.com/40');
            });
        });
    };

    const getUserImage = (figure: string, username: string): string | null => {
        let existing = avatarImageCache.get(figure);

        if (!existing) {
            setFigureImage(figure, username).then(src => {
                avatarImageCache.set(figure, src);
            });
            return 'https://via.placeholder.com/40';
        }

        return existing;
    };

    const getPetImage = (figure: string, direction: number, _arg_3: boolean, scale: number = 64, posture: string = null) =>
    {
        let existing = petImageCache.get((figure + posture));

        if(existing) return existing;

        const figureData = new PetFigureData(figure);
        const typeId = figureData.typeId;
        const image = GetRoomEngine().getRoomObjectPetImage(typeId, figureData.paletteId, figureData.color, new Vector3d((direction * 45)), scale, null, false, 0, figureData.customParts, posture);

        if(image)
        {
            existing = TextureUtils.generateImageUrl(image.data);
            petImageCache.set((figure + posture), existing);
        }

        return existing;
    };

    useRoomSessionManagerEvent<RoomSessionChatEvent>(RoomSessionChatEvent.CHAT_EVENT, event =>
    {
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

            console.log('Chat Event Debug:', {
                userId: event.objectId,
                username: userData.name,
                userType,
                figure,
                roomObjectExists: !!roomObject
            });

            switch(userType)
            {
                case RoomObjectType.PET:
                    imageUrl = getPetImage(figure, 2, true, 64, roomObject.model.getValue<string>(RoomObjectVariable.FIGURE_POSTURE));
                    petType = new PetFigureData(figure).typeId;
                    chatColours = "black";
                    break;
                case RoomObjectType.USER:
                    imageUrl = getUserImage(figure, userData.name);
                    console.log('getUserImage result:', { figure, imageUrl });
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
                text = LocalizeText('widgets.chatbubble.respect', [ 'username' ], [ username ]);

                if(GetConfiguration('respect.options')['enabled']) PlaySound(GetConfiguration('respect.options')['sound']);

                break;
            case RoomSessionChatEvent.CHAT_TYPE_PETREVIVE:
            case RoomSessionChatEvent.CHAT_TYPE_PET_REBREED_FERTILIZE:
            case RoomSessionChatEvent.CHAT_TYPE_PET_SPEED_FERTILIZE: {
                let textKey = 'widget.chatbubble.petrevived';

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
                text = LocalizeText('widget.chatbubble.petrespect', [ 'petname' ], [ username ]);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_PETTREAT:
                text = LocalizeText('widget.chatbubble.pettreat', [ 'petname' ], [ username ]);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_HAND_ITEM_RECEIVED:
                text = LocalizeText('widget.chatbubble.handitem', [ 'username', 'handitem' ], [ username, LocalizeText(('handitem' + event.extraParam)) ]);
                break;
            case RoomSessionChatEvent.CHAT_TYPE_MUTE_REMAINING: {
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

        setChatMessages(prevValue => [ ...prevValue, chatMessage ]);
        addChatEntry({ id: -1, webId: userData.webID, entityId: userData.roomIndex, name: username, imageUrl, style: styleId, chatType: chatType, entityType: userData.type, message: formattedText, timestamp: ChatHistoryCurrentDate(), type: ChatEntryType.TYPE_CHAT, roomId: roomSession.roomId, color, chatColours });
    });

    useRoomEngineEvent<RoomDragEvent>(RoomDragEvent.ROOM_DRAG, event =>
    {
        if(!chatMessages.length || (event.roomId !== roomSession.roomId)) return;

        const offsetX = event.offsetX;

        chatMessages.forEach(chat => (chat.elementRef && (chat.left += offsetX)));
    });

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event =>
    {
        const parser = event.getParser();

        if(!parser.roomEnter) return;

        setChatSettings(parser.chat);
    });

    useMessageEvent<RoomChatSettingsEvent>(RoomChatSettingsEvent, event =>
    {
        const parser = event.getParser();

        setChatSettings(parser.chat);
    });

    useEffect(() =>
    {
        isDisposed.current = false;

        return () =>
        {
            isDisposed.current = true;
        }
    }, []);

    return { chatMessages, setChatMessages, chatSettings, getScrollSpeed };
};

export const useChatWidget = useChatWidgetState;