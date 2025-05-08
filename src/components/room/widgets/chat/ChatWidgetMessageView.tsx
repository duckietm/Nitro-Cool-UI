import { RoomChatSettings, RoomObjectCategory } from '@nitrots/nitro-renderer';
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

    // Memoize chat properties to prevent unnecessary re-renders
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
        senderId: chat?.senderId
    }), [chat?.id, chat?.location?.x, chat?.top, chat?.left, chat?.styleId, chat?.color, chat?.chatColours, chat?.username, chat?.formattedText, chat?.imageUrl, chat?.type, chat?.roomId, chat?.senderId]);

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

        // Calculate content offset based on styleId to account for margin-left in .chat-content
        const contentOffset = chatMemo.styleId === 33 || chatMemo.styleId === 34 ? 35 : 27;

        // Position the bubble above the user (chat.location.x), adjusting for content offset
        if (!left && !top) {
            left = chatMemo.locationX ? (chatMemo.locationX - (width / 2) + contentOffset) : contentOffset;
            top = element.parentElement ? (element.parentElement.offsetHeight - height) : 0;
            chat.left = left;
            chat.top = top;
        }

        // Apply position immediately
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
                <div className="user-container">
                    {chatMemo.imageUrl && chatMemo.imageUrl.length > 0 && (
                        <div className="user-image" style={{ backgroundImage: `url(${chatMemo.imageUrl})` }} />
                    )}
                </div>
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