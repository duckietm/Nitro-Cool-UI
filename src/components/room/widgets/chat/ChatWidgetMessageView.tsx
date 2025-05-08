import { RoomChatSettings, RoomObjectCategory, RoomObjectType } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ChatBubbleMessage, GetRoomEngine } from '../../../../api';
import { useOnClickChat } from '../../../../hooks';

interface ChatWidgetMessageViewProps {
    chat: ChatBubbleMessage;
    makeRoom: (chat: ChatBubbleMessage) => void;
    bubbleWidth?: number;
    selectedEmoji?: string;
}

export const ChatWidgetMessageView: FC<ChatWidgetMessageViewProps> = props => {
    const { chat = null, makeRoom = null, bubbleWidth = RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL, selectedEmoji } = props;
    const [isVisible, setIsVisible] = useState(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const { onClickChat = null } = useOnClickChat();
    const elementRef = useRef<HTMLDivElement>();

    const chatMemo = useMemo(() => ({
        id: chat?.id,
        locationX: chat?.location?.x,
        top: chat?.top,
        left: chat?.left,
        styleId: chat?.styleId,
        color: chat?.color,
        chatColours: chat?.chatColours,
        username: chat?.username,
        formattedText: chat?.formattedText,
        imageUrl: chat?.imageUrl,
        type: chat?.type,
        roomId: chat?.roomId,
        senderId: chat?.senderId,
        userType: (chat as any)?.userType || 0
    }), [chat?.id, chat?.location?.x, chat?.top, chat?.left, chat?.styleId, chat?.color, chat?.chatColours, chat?.username, chat?.formattedText, chat?.imageUrl, chat?.type, chat?.roomId, chat?.senderId, (chat as any)?.userType]);

    const getBubbleWidth = useMemo(() => {
        switch (bubbleWidth) {
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL:
                return 350;
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_THIN:
                return 240;
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_WIDE:
                return 2000;
        }
    }, [bubbleWidth]);

    useEffect(() => {
        setIsVisible(false);
        const element = elementRef.current;
        if (!element) return;

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        chat.width = width;
        chat.height = height;
        chat.elementRef = element;

        let left = chat.left;
        let top = chat.top;

        const contentOffset = chatMemo.styleId === 33 || chatMemo.styleId === 34 ? 35 : 27;

        if (!left && !top) {
            left = chatMemo.locationX ? (chatMemo.locationX - (width / 2) + contentOffset) : contentOffset;
            top = element.parentElement ? (element.parentElement.offsetHeight - height) : 0;
            chat.left = left;
            chat.top = top;
        }

        element.style.position = 'absolute';
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;

        setIsReady(true);

        return () => {
            chat.elementRef = null;
            setIsReady(false);
        };
    }, [chat, chatMemo]);

    useEffect(() => {
        if (!isReady || !chat || isVisible) return;
        if (makeRoom) makeRoom(chat);
        setIsVisible(true);
    }, [chat, isReady, isVisible, makeRoom]);

    const isPet = chatMemo.userType === RoomObjectType.PET;
    const imageWidth = isPet ? '41px' : '90px';
    const imageHeight = isPet ? '54px' : '130px';
    const imageTop = isPet ? '-15px' : '-50px';
    const imageLeft = isPet ? '-9.25px' : '-31px';

    // Define styles where imageUrl should not be loaded
    const stylesWithoutImage = [1, 2, 8, 28, 30, 32, 33, 34, 35, 36, 38];
    const shouldDisplayImage = !stylesWithoutImage.includes(chatMemo.styleId);

    return (
        <div
            ref={elementRef}
            className={`bubble-container newbubblehe ${isVisible ? 'visible' : 'invisible'}`}
            onClick={event => GetRoomEngine().selectRoomObject(chatMemo.roomId, chatMemo.senderId, RoomObjectCategory.UNIT)}
        >
            {selectedEmoji && <span>{DOMPurify.sanitize(selectedEmoji)}</span>}
            {chatMemo.styleId === 0 && (
                <div className="user-container-bg" style={{ backgroundColor: chatMemo.color }} />
            )}
            <div className={`chat-bubble bubble-${chatMemo.styleId} type-${chatMemo.type}`} style={{ maxWidth: getBubbleWidth }}>
                {shouldDisplayImage && chatMemo.imageUrl && typeof chatMemo.imageUrl === 'string' && chatMemo.imageUrl.length > 0 && (
                    <div className="user-container" style={{ display: 'block' }}>
                        <div
                            className="user-image"
                            style={{
                                backgroundImage: `url(${chatMemo.imageUrl})`,
                                width: imageWidth,
                                height: imageHeight,
                                top: imageTop,
                                left: imageLeft,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                            onError={() => console.log(`Failed to load image for Chat ID ${chatMemo.id}: ${chatMemo.imageUrl}`)}
                        />
                    </div>
                )}
                <div className="chat-content">
                    <b className="username mr-1" dangerouslySetInnerHTML={{ __html: `${chatMemo.username}: ` }} />
                    <span
                        className="message"
                        style={{ color: chatMemo.chatColours }}
                        dangerouslySetInnerHTML={{ __html: `${chatMemo.formattedText}` }}
                        onClick={e => onClickChat(e)}
                    />
                </div>
                <div className="pointer" />
            </div>
        </div>
    );
};